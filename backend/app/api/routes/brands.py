from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.brand_service import BrandService
from app.schemas.brand import BrandCreate, BrandUpdate, BrandResponse, BrandDetailResponse
from app.security.url_validation import is_safe_external_url
from app.core.errors import bad_request_exception

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.get("", response_model=List[BrandResponse])
def list_brands(active_only: bool = False, db: Session = Depends(get_db)):
    return BrandService.get_all(db, active_only=active_only)


@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(payload: BrandCreate, db: Session = Depends(get_db)):
    if payload.primary_website:
        is_safe, err = is_safe_external_url(payload.primary_website)
        if not is_safe:
            raise bad_request_exception(f"Invalid primary website URL: {err}")

    brand = BrandService.create(db, payload)
    resp = BrandResponse.model_validate(brand)
    resp.assets_count = 0
    resp.scans_count = 0
    resp.findings_count = 0
    return resp


@router.get("/{brand_id}", response_model=BrandDetailResponse)
def get_brand(brand_id: str, db: Session = Depends(get_db)):
    return BrandService.get_detail(db, brand_id)


@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(brand_id: str, payload: BrandUpdate, db: Session = Depends(get_db)):
    if payload.primary_website:
        is_safe, err = is_safe_external_url(payload.primary_website)
        if not is_safe:
            raise bad_request_exception(f"Invalid primary website URL: {err}")

    brand = BrandService.update(db, brand_id, payload)
    return BrandResponse.model_validate(brand)


@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand(brand_id: str, db: Session = Depends(get_db)):
    BrandService.delete(db, brand_id)
