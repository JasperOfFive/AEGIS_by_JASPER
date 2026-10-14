from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.asset_service import AssetService
from app.schemas.asset import BrandAssetCreate, BrandAssetUpdate, BrandAssetResponse
from app.security.url_validation import is_safe_external_url
from app.core.errors import bad_request_exception
from app.models.user import User
from app.security.auth import get_current_user
from app.services.brand_service import BrandService

router = APIRouter(tags=["Official Assets"])


@router.get("/brands/{brand_id}/assets", response_model=List[BrandAssetResponse])
def list_brand_assets(brand_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    BrandService.get_by_id(db, brand_id, user.id)
    assets = AssetService.get_by_brand(db, brand_id)
    return [BrandAssetResponse.model_validate(a) for a in assets]


@router.post("/brands/{brand_id}/assets", response_model=BrandAssetResponse, status_code=status.HTTP_201_CREATED)
def create_brand_asset(brand_id: str, payload: BrandAssetCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    BrandService.get_by_id(db, brand_id, user.id)
    if payload.url:
        is_safe, err = is_safe_external_url(payload.url)
        if not is_safe:
            raise bad_request_exception(f"Invalid asset URL: {err}")

    asset = AssetService.create(db, brand_id, payload)
    return BrandAssetResponse.model_validate(asset)


@router.get("/assets/{asset_id}", response_model=BrandAssetResponse)
def get_asset(asset_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    asset = AssetService.get_by_id(db, asset_id)
    BrandService.get_by_id(db, asset.brand_id, user.id)
    return BrandAssetResponse.model_validate(asset)


@router.put("/assets/{asset_id}", response_model=BrandAssetResponse)
def update_asset(asset_id: str, payload: BrandAssetUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    asset = AssetService.get_by_id(db, asset_id)
    BrandService.get_by_id(db, asset.brand_id, user.id)
    if payload.url:
        is_safe, err = is_safe_external_url(payload.url)
        if not is_safe:
            raise bad_request_exception(f"Invalid asset URL: {err}")

    asset = AssetService.update(db, asset_id, payload)
    return BrandAssetResponse.model_validate(asset)


@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(asset_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    asset = AssetService.get_by_id(db, asset_id)
    BrandService.get_by_id(db, asset.brand_id, user.id)
    AssetService.delete(db, asset_id)
