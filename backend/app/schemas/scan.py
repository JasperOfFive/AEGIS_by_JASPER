from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ScanTriggerRequest(BaseModel):
    brand_id: str = Field(..., description="Target brand ID to run scan for")
    requested_source_types: List[str] = Field(
        default=["social", "app_store"],
        description="Source categories: 'social', 'app_store'"
    )
    simulate_unavailable_source: Optional[str] = Field(
        None,
        description="Optional source name to simulate unavailable platform for demonstration (e.g. 'tiktok', 'google_play')"
    )


class ScanSourceResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_name: str
    status: str
    records_collected: int
    started_at: datetime
    completed_at: datetime
    error_message: Optional[str] = None


class ScanRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    brand_id: str
    brand_name: Optional[str] = None
    requested_source_types: List[str]
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_candidates_found: int
    total_findings_flagged: int
    failure_details: Optional[str] = None
    created_at: datetime
    source_results: List[ScanSourceResultResponse] = Field(default_factory=list)


class ScanStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    brand_id: str
    brand_name: Optional[str] = None
    status: str
    is_terminal: bool
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_candidates_found: int = 0
    total_findings_flagged: int = 0
    failure_details: Optional[str] = None
    created_at: datetime
    source_results: List[ScanSourceResultResponse] = Field(default_factory=list)
