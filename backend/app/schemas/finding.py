from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.candidate import CandidateResponse
from app.schemas.review import ReviewResponse


class SignalBreakdownItem(BaseModel):
    signal_name: str
    category: str # name, handle, logo, description, publisher, package, etc.
    score_contribution: float
    max_weight: float
    raw_score: float # 0.0 - 1.0 or similarity ratio
    observed_value: Optional[str] = None
    target_value: Optional[str] = None
    explanation: str


class FindingBase(BaseModel):
    risk_score: float
    risk_level: str
    decision: str
    detection_reasons: List[str] = Field(default_factory=list)
    signal_breakdown: List[SignalBreakdownItem] = Field(default_factory=list)
    evidence_summary: str
    review_status: str = "new"


class FindingResponse(FindingBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    brand_id: str
    candidate_id: str
    scan_run_id: str
    first_detected_at: datetime
    last_detected_at: datetime
    resolved_at: Optional[datetime] = None
    candidate: Optional[CandidateResponse] = None
    reviews: List[ReviewResponse] = Field(default_factory=list)
    ai_explanation: Optional[Dict[str, Any]] = None
    ai_explanation_model: Optional[str] = None
    ai_explanation_generated_at: Optional[datetime] = None
    ai_explanation_status: Optional[str] = None


class FindingFilterParams(BaseModel):
    brand_id: Optional[str] = None
    risk_level: Optional[str] = None
    review_status: Optional[str] = None
    platform: Optional[str] = None
    candidate_type: Optional[str] = None
    decision: Optional[str] = None
    min_score: Optional[float] = None
    max_score: Optional[float] = None
