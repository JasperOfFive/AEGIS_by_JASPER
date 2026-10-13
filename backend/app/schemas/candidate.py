from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class CandidateBase(BaseModel):
    candidate_type: str = Field(..., description="social_profile or mobile_app")
    platform: str = Field(..., description="instagram, facebook, tiktok, youtube, linkedin, google_play, apple_app_store")
    canonical_identifier: Optional[str] = None
    display_name: str
    username_or_package: Optional[str] = None
    publisher_or_developer: Optional[str] = None
    description: Optional[str] = None
    external_url: Optional[str] = None
    logo_reference: Optional[str] = None
    source_provenance: str = "fixture"
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class CandidateCreate(CandidateBase):
    pass


class CandidateResponse(CandidateBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    first_seen_at: datetime
    last_seen_at: datetime
