from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.brand_asset import BrandAsset
from app.models.brand import Brand
from app.schemas.asset import BrandAssetCreate, BrandAssetUpdate
from app.core.errors import EntityNotFoundError, bad_request_exception, conflict_exception
from app.detection.normalization import (
    normalize_domain,
    normalize_username,
    normalize_package_id,
    normalize_text
)


def derive_normalized_identifier(asset_type: str, display_value: str, raw_norm_id: Optional[str]) -> str:
    if raw_norm_id:
        return raw_norm_id.strip().lower()

    if asset_type == "official_domain":
        return normalize_domain(display_value)
    elif asset_type == "official_social_account":
        return normalize_username(display_value)
    elif asset_type == "official_mobile_app":
        return normalize_package_id(display_value)
    elif asset_type == "official_publisher":
        return normalize_text(display_value)
    elif asset_type == "brand_keyword":
        return normalize_text(display_value)
    return display_value.strip().lower()


class AssetService:
    @staticmethod
    def get_by_brand(db: Session, brand_id: str) -> List[BrandAsset]:
        # Validate brand exists
        brand = db.scalar(select(Brand).where(Brand.id == brand_id))
        if not brand:
            raise EntityNotFoundError(f"Brand '{brand_id}' not found.")
        return db.scalars(select(BrandAsset).where(BrandAsset.brand_id == brand_id).order_by(BrandAsset.created_at.desc())).all()

    @staticmethod
    def get_by_id(db: Session, asset_id: str) -> BrandAsset:
        asset = db.scalar(select(BrandAsset).where(BrandAsset.id == asset_id))
        if not asset:
            raise EntityNotFoundError(f"Asset '{asset_id}' not found.")
        return asset

    @staticmethod
    def create(db: Session, brand_id: str, data: BrandAssetCreate) -> BrandAsset:
        # Validate brand exists
        brand = db.scalar(select(Brand).where(Brand.id == brand_id))
        if not brand:
            raise EntityNotFoundError(f"Brand '{brand_id}' not found.")

        norm_id = derive_normalized_identifier(data.asset_type, data.display_value, data.normalized_identifier)
        platform_val = data.platform.lower().strip() if data.platform else None

        # Check unique constraint (brand_id, asset_type, platform, normalized_identifier)
        existing = db.scalar(
            select(BrandAsset).where(
                BrandAsset.brand_id == brand_id,
                BrandAsset.asset_type == data.asset_type,
                BrandAsset.platform == platform_val,
                BrandAsset.normalized_identifier == norm_id
            )
        )
        if existing:
            raise conflict_exception(
                f"An asset of type '{data.asset_type}' with identifier '{norm_id}' already exists for this brand."
            )

        asset = BrandAsset(
            brand_id=brand_id,
            asset_type=data.asset_type,
            platform=platform_val,
            normalized_identifier=norm_id,
            display_value=data.display_value.strip(),
            url=data.url.strip() if data.url else None,
            image_reference=data.image_reference,
            verification_status=data.verification_status,
            lifecycle_status=data.lifecycle_status,
            official_publisher=data.official_publisher.strip() if data.official_publisher else None,
            effective_date=data.effective_date,
            retirement_date=data.retirement_date,
            analyst_notes=data.analyst_notes.strip() if data.analyst_notes else None
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)
        return asset

    @staticmethod
    def update(db: Session, asset_id: str, data: BrandAssetUpdate) -> BrandAsset:
        asset = AssetService.get_by_id(db, asset_id)
        update_data = data.model_dump(exclude_unset=True)

        if "display_value" in update_data and "normalized_identifier" not in update_data:
            update_data["normalized_identifier"] = derive_normalized_identifier(
                asset.asset_type,
                update_data["display_value"],
                None
            )

        for key, value in update_data.items():
            setattr(asset, key, value)

        db.commit()
        db.refresh(asset)
        return asset

    @staticmethod
    def delete(db: Session, asset_id: str) -> None:
        asset = AssetService.get_by_id(db, asset_id)
        db.delete(asset)
        db.commit()
