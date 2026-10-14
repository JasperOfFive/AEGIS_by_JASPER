from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.brand import Brand
from app.models.scan import ScanRun
from app.models.finding import Finding
from app.models.candidate import Candidate, CandidateObservation
from app.schemas.finding import FindingResponse
from app.schemas.scan import ScanRunResponse
from app.models.user import User
from app.security.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned = Brand.owner_id == user.id
    total_brands = db.scalar(select(func.count(Brand.id)).where(owned)) or 0
    total_scans = db.scalar(select(func.count(ScanRun.id)).join(Brand, ScanRun.brand_id == Brand.id).where(owned)) or 0
    total_findings = db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned)) or 0
    total_candidates = db.scalar(select(func.count(func.distinct(CandidateObservation.candidate_id))).join(ScanRun, CandidateObservation.scan_run_id == ScanRun.id).join(Brand, ScanRun.brand_id == Brand.id).where(owned)) or 0

    # Risk level breakdown
    risk_counts = {
        "critical": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.risk_level == "critical")) or 0,
        "high": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.risk_level == "high")) or 0,
        "medium": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.risk_level == "medium")) or 0,
        "low": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.risk_level == "low")) or 0,
    }

    # Review status breakdown
    status_counts = {
        "new": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.review_status == "new")) or 0,
        "under_review": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.review_status == "under_review")) or 0,
        "confirmed_threat": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.review_status == "confirmed_threat")) or 0,
        "false_positive": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.review_status == "false_positive")) or 0,
        "resolved": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.review_status == "resolved")) or 0,
        "ignored": db.scalar(select(func.count(Finding.id)).join(Brand, Finding.brand_id == Brand.id).where(owned, Finding.review_status == "ignored")) or 0,
    }

    # Platform breakdown for findings
    platform_query = (
        select(Candidate.platform, func.count(Finding.id))
        .join(Candidate, Finding.candidate_id == Candidate.id)
        .join(Brand, Finding.brand_id == Brand.id)
        .where(owned)
        .group_by(Candidate.platform)
    )
    platform_breakdown = dict(db.execute(platform_query).all())

    # Candidate type breakdown (social vs mobile app)
    type_query = (
        select(Candidate.candidate_type, func.count(Finding.id))
        .join(Candidate, Finding.candidate_id == Candidate.id)
        .join(Brand, Finding.brand_id == Brand.id)
        .where(owned)
        .group_by(Candidate.candidate_type)
    )
    type_breakdown = dict(db.execute(type_query).all())

    # Recent scans
    recent_scans = db.scalars(
        select(ScanRun).join(Brand, ScanRun.brand_id == Brand.id).where(owned).order_by(ScanRun.created_at.desc()).limit(5)
    ).all()

    # Recent high & critical threats
    recent_threats = db.scalars(
        select(Finding)
        .join(Brand, Finding.brand_id == Brand.id)
        .where(owned, Finding.risk_level.in_(["critical", "high"]))
        .order_by(Finding.risk_score.desc(), Finding.last_detected_at.desc())
        .limit(6)
    ).all()

    return {
        "overview": {
            "total_brands": total_brands,
            "total_scans": total_scans,
            "total_findings": total_findings,
            "total_candidates_observed": total_candidates,
            "active_threats": risk_counts["critical"] + risk_counts["high"],
        },
        "risk_breakdown": risk_counts,
        "status_breakdown": status_counts,
        "platform_breakdown": platform_breakdown,
        "type_breakdown": type_breakdown,
        "recent_scans": [ScanRunResponse.model_validate(s) for s in recent_scans],
        "recent_threats": [FindingResponse.model_validate(f) for f in recent_threats],
    }
