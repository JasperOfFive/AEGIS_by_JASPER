from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.asset import BrandAssetResponse


class BrandBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Brand or company name")
    description: Optional[str] = Field(None, description="Description of company operations/products")
    industry: Optional[str] = Field(None, max_length=100, description="Industry or category (FinTech, Retail, etc.)")
    primary_website: Optional[str] = Field(None, max_length=512, description="Primary website URL")
    is_active: bool = Field(True, description="Active status")


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    primary_website: Optional[str] = None
    is_active: Optional[bool] = None


class BrandResponse(BrandBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
    assets_count: Optional[int] = 0
    scans_count: Optional[int] = 0
    findings_count: Optional[int] = 0
    schedule_enabled: bool = False
    schedule_interval_hours: int = 24
    last_scheduled_run_at: Optional[datetime] = None
    next_scheduled_run_at: Optional[datetime] = None


class BrandDetailResponse(BrandResponse):
    assets: List[BrandAssetResponse] = []


class BrandScheduleUpdate(BaseModel):
    schedule_enabled: bool = Field(..., description="Whether recurring scans are enabled for this brand")
    schedule_interval_hours: int = Field(24, ge=1, le=720, description="Interval between scans in hours (1-720)")


class BrandScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    brand_id: str
    brand_name: str
    schedule_enabled: bool
    schedule_interval_hours: int
    last_scheduled_run_at: Optional[datetime] = None
    next_scheduled_run_at: Optional[datetime] = None
    is_currently_scanning: bool = False
