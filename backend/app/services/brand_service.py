from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.brand import Brand
from app.models.brand_asset import BrandAsset
from app.models.scan import ScanRun
from app.models.finding import Finding
from app.schemas.brand import BrandCreate, BrandUpdate, BrandResponse, BrandDetailResponse
from app.core.errors import EntityNotFoundError, bad_request_exception


class BrandService:
    @staticmethod
    def get_all(db: Session, active_only: bool = False) -> List[BrandResponse]:
        query = select(Brand)
        if active_only:
            query = query.where(Brand.is_active.is_(True))
        brands = db.scalars(query.order_by(Brand.name.asc())).all()

        results = []
        for b in brands:
            assets_count = db.scalar(select(func.count(BrandAsset.id)).where(BrandAsset.brand_id == b.id)) or 0
            scans_count = db.scalar(select(func.count(ScanRun.id)).where(ScanRun.brand_id == b.id)) or 0
            findings_count = db.scalar(select(func.count(Finding.id)).where(Finding.brand_id == b.id)) or 0
            
            resp = BrandResponse.model_validate(b)
            resp.assets_count = assets_count
            resp.scans_count = scans_count
            resp.findings_count = findings_count
            results.append(resp)
        return results

    @staticmethod
    def get_by_id(db: Session, brand_id: str) -> Brand:
        brand = db.scalar(select(Brand).where(Brand.id == brand_id))
        if not brand:
            raise EntityNotFoundError(f"Brand '{brand_id}' not found.")
        return brand

    @staticmethod
    def get_detail(db: Session, brand_id: str) -> BrandDetailResponse:
        brand = BrandService.get_by_id(db, brand_id)
        assets_count = len(brand.assets)
        scans_count = db.scalar(select(func.count(ScanRun.id)).where(ScanRun.brand_id == brand.id)) or 0
        findings_count = db.scalar(select(func.count(Finding.id)).where(Finding.brand_id == brand.id)) or 0

        resp = BrandDetailResponse.model_validate(brand)
        resp.assets_count = assets_count
        resp.scans_count = scans_count
        resp.findings_count = findings_count
        return resp

    @staticmethod
    def create(db: Session, data: BrandCreate) -> Brand:
        existing = db.scalar(select(Brand).where(Brand.name.ilike(data.name)))
        if existing:
            raise bad_request_exception(f"A brand with name '{data.name}' already exists.")

        brand = Brand(
            name=data.name,
            description=data.description,
            industry=data.industry,
            primary_website=data.primary_website,
            is_active=data.is_active
        )
        db.add(brand)
        db.commit()
        db.refresh(brand)
        return brand

    @staticmethod
    def update(db: Session, brand_id: str, data: BrandUpdate) -> Brand:
        brand = BrandService.get_by_id(db, brand_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(brand, key, value)
        db.commit()
        db.refresh(brand)
        return brand

    @staticmethod
    def delete(db: Session, brand_id: str) -> None:
        brand = BrandService.get_by_id(db, brand_id)
        db.delete(brand)
        db.commit()
