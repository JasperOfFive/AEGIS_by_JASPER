from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.finding_service import FindingService
from app.schemas.finding import FindingResponse, FindingFilterParams
from app.schemas.ai import AIExplanationResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/findings", tags=["Findings"])


@router.get("", response_model=PaginatedResponse[FindingResponse])
def list_findings(
    brand_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    review_status: Optional[str] = None,
    platform: Optional[str] = None,
    candidate_type: Optional[str] = None,
    decision: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    params = FindingFilterParams(
        brand_id=brand_id,
        risk_level=risk_level,
        review_status=review_status,
        platform=platform,
        candidate_type=candidate_type,
        decision=decision,
        min_score=min_score,
        max_score=max_score
    )

    skip = (page - 1) * page_size
    items, total = FindingService.list_findings(db, params, skip=skip, limit=page_size)

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedResponse(
        items=[FindingResponse.model_validate(f) for f in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{finding_id}", response_model=FindingResponse)
def get_finding(finding_id: str, db: Session = Depends(get_db)):
    finding = FindingService.get_by_id(db, finding_id)
    return FindingResponse.model_validate(finding)


@router.post("/{finding_id}/explain", response_model=AIExplanationResponse)
def explain_finding(
    finding_id: str,
    force_refresh: bool = Query(False, description="Bypass cache and regenerate explanation"),
    db: Session = Depends(get_db)
):
    from app.services.explanation_service import ExplanationService
    return ExplanationService.explain_finding(db, finding_id, force_refresh=force_refresh)
