from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, and_, func
from app.models.finding import Finding
from app.models.candidate import Candidate
from app.models.review import Review
from app.schemas.finding import FindingFilterParams
from app.detection.engine import DetectionResult
from app.core.errors import EntityNotFoundError


class FindingService:
    @staticmethod
    def upsert_finding(
        db: Session,
        brand_id: str,
        candidate_id: str,
        scan_run_id: str,
        detection: DetectionResult
    ) -> Finding:
        now = datetime.now(timezone.utc)
        
        # Check existing finding for this brand and candidate
        existing = db.scalar(
            select(Finding).where(
                Finding.brand_id == brand_id,
                Finding.candidate_id == candidate_id
            )
        )

        if existing:
            # Update last detected and telemetry
            existing.last_detected_at = now
            existing.scan_run_id = scan_run_id
            existing.risk_score = detection.risk_score
            existing.risk_level = detection.risk_level
            existing.decision = detection.decision
            existing.detection_reasons = detection.detection_reasons
            existing.signal_breakdown = detection.signal_breakdown
            existing.evidence_summary = detection.evidence_summary
            # Preserve review_status if already triaged (e.g. false_positive, confirmed_threat)
            db.flush()
            return existing

        # Create new finding
        finding = Finding(
            brand_id=brand_id,
            candidate_id=candidate_id,
            scan_run_id=scan_run_id,
            risk_score=detection.risk_score,
            risk_level=detection.risk_level,
            decision=detection.decision,
            detection_reasons=detection.detection_reasons,
            signal_breakdown=detection.signal_breakdown,
            evidence_summary=detection.evidence_summary,
            review_status="new",
            first_detected_at=now,
            last_detected_at=now
        )
        db.add(finding)
        db.flush()

        # Add initial audit trail review log
        initial_review = Review(
            finding_id=finding.id,
            previous_status="none",
            new_status="new",
            reviewer="detection_engine",
            comment=f"Initial detection via automated scan runner. Assessed {detection.risk_level.upper()} risk ({detection.risk_score}/100)."
        )
        db.add(initial_review)
        db.flush()

        return finding

    @staticmethod
    def get_by_id(db: Session, finding_id: str) -> Finding:
        finding = db.scalar(
            select(Finding)
            .options(
                joinedload(Finding.candidate),
                joinedload(Finding.reviews)
            )
            .where(Finding.id == finding_id)
        )
        if not finding:
            raise EntityNotFoundError(f"Finding '{finding_id}' not found.")
        return finding

    @staticmethod
    def list_findings(
        db: Session,
        params: FindingFilterParams,
        skip: int = 0,
        limit: int = 50
    ) -> Tuple[List[Finding], int]:
        query = select(Finding).join(Candidate, Finding.candidate_id == Candidate.id)

        conditions = []
        if params.brand_id:
            conditions.append(Finding.brand_id == params.brand_id)
        if params.risk_level:
            conditions.append(Finding.risk_level == params.risk_level)
        if params.review_status:
            conditions.append(Finding.review_status == params.review_status)
        if params.decision:
            conditions.append(Finding.decision == params.decision)
        if params.platform:
            conditions.append(Candidate.platform == params.platform)
        if params.candidate_type:
            conditions.append(Candidate.candidate_type == params.candidate_type)
        if params.min_score is not None:
            conditions.append(Finding.risk_score >= params.min_score)
        if params.max_score is not None:
            conditions.append(Finding.risk_score <= params.max_score)

        if conditions:
            query = query.where(and_(*conditions))

        # Count total
        count_query = select(func.count(Finding.id)).join(Candidate, Finding.candidate_id == Candidate.id)
        if conditions:
            count_query = count_query.where(and_(*conditions))
        total = db.scalar(count_query) or 0

        # Eager load candidate and reviews
        query = (
            query.options(joinedload(Finding.candidate), joinedload(Finding.reviews))
            .order_by(Finding.risk_score.desc(), Finding.last_detected_at.desc())
            .offset(skip)
            .limit(limit)
        )

        findings = db.scalars(query).unique().all()
        return findings, total
