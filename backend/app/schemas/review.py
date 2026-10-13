from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ReviewCreate(BaseModel):
    new_status: str = Field(..., description="confirmed_threat, false_positive, under_review, resolved, ignored, new")
    reviewer: str = Field("security_analyst", description="Reviewer name or identifier")
    comment: str = Field(..., min_length=1, description="Reason or remediation notes")


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    finding_id: str
    previous_status: str
    new_status: str
    reviewer: str
    comment: str
    created_at: datetime
