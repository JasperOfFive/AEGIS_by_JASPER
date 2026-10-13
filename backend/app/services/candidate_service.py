from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.candidate import Candidate, CandidateObservation
from app.adapters.base import NormalizedCandidateRecord
from app.core.logging import logger


class CandidateService:
    @staticmethod
    def get_or_create(db: Session, record: NormalizedCandidateRecord) -> Candidate:
        now = datetime.now(timezone.utc)
        
        # Look up existing candidate by platform and username_or_package
        existing = db.scalar(
            select(Candidate).where(
                Candidate.platform == record.platform,
                Candidate.username_or_package == record.username_or_package
            )
        )

        if existing:
            # Update last_seen_at and metadata
            existing.last_seen_at = now
            existing.display_name = record.display_name
            existing.description = record.description or existing.description
            existing.external_url = record.external_url or existing.external_url
            existing.logo_reference = record.logo_reference or existing.logo_reference
            existing.publisher_or_developer = record.publisher_or_developer or existing.publisher_or_developer
            existing.metadata_json = {**existing.metadata_json, **record.metadata_json}
            return existing

        # Create new candidate
        candidate = Candidate(
            candidate_type=record.candidate_type,
            platform=record.platform,
            canonical_identifier=record.username_or_package,
            display_name=record.display_name,
            username_or_package=record.username_or_package,
            publisher_or_developer=record.publisher_or_developer,
            description=record.description,
            external_url=record.external_url,
            logo_reference=record.logo_reference,
            source_provenance=record.source_provenance,
            metadata_json=record.metadata_json,
            first_seen_at=now,
            last_seen_at=now
        )
        db.add(candidate)
        db.flush()
        return candidate

    @staticmethod
    def record_observation(
        db: Session,
        scan_run_id: str,
        candidate_id: str,
        provenance: str,
        raw_payload: dict
    ) -> CandidateObservation:
        obs = CandidateObservation(
            scan_run_id=scan_run_id,
            candidate_id=candidate_id,
            observed_at=datetime.now(timezone.utc),
            raw_payload=raw_payload,
            provenance=provenance
        )
        db.add(obs)
        return obs

    @staticmethod
    def list_all(
        db: Session,
        candidate_type: Optional[str] = None,
        platform: Optional[str] = None,
        limit: int = 100
    ) -> List[Candidate]:
        query = select(Candidate)
        if candidate_type:
            query = query.where(Candidate.candidate_type == candidate_type)
        if platform:
            query = query.where(Candidate.platform == platform)
        return db.scalars(query.order_by(Candidate.last_seen_at.desc()).limit(limit)).all()
