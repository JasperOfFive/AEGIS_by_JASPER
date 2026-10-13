from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class BrandAssetBase(BaseModel):
    asset_type: str = Field(..., description="Asset type: official_domain, official_social_account, official_mobile_app, official_publisher, logo_image, brand_keyword, other")
    platform: Optional[str] = Field(None, description="Platform: instagram, facebook, tiktok, youtube, linkedin, google_play, apple_app_store, web, etc.")
    display_value: str = Field(..., min_length=1, max_length=255, description="Display value such as '@acme' or 'com.acme.app'")
    normalized_identifier: Optional[str] = Field(None, description="Normalized identifier for matching. Generated automatically if omitted.")
    url: Optional[str] = Field(None, description="Optional URL to asset")
    image_reference: Optional[str] = Field(None, description="Image URL or perceptual hash or fixture ID")
    verification_status: str = Field("verified", description="verified, pending, unverified")

    @field_validator("asset_type")
    @classmethod
    def validate_asset_type(cls, v: str) -> str:
        valid_types = {
            "official_domain",
            "official_social_account",
            "official_mobile_app",
            "official_publisher",
            "logo_image",
            "brand_keyword",
            "other"
        }
        if v.lower() not in valid_types:
            raise ValueError(f"Invalid asset_type. Must be one of: {', '.join(valid_types)}")
        return v.lower()


class BrandAssetCreate(BrandAssetBase):
    pass


class BrandAssetUpdate(BaseModel):
    display_value: Optional[str] = None
    normalized_identifier: Optional[str] = None
    url: Optional[str] = None
    image_reference: Optional[str] = None
    verification_status: Optional[str] = None


class BrandAssetResponse(BrandAssetBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    brand_id: str
    normalized_identifier: str
    created_at: datetime
