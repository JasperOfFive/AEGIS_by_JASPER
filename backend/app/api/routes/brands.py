from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.brand_service import BrandService
from app.schemas.brand import BrandCreate, BrandUpdate, BrandResponse, BrandDetailResponse
from app.security.url_validation import is_safe_external_url
from app.core.errors import bad_request_exception
from app.models.user import User
from app.security.auth import get_current_user

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.get("", response_model=List[BrandResponse])
def list_brands(active_only: bool = False, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return BrandService.get_all(db, owner_id=user.id, active_only=active_only)


@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(payload: BrandCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.primary_website:
        is_safe, err = is_safe_external_url(payload.primary_website)
        if not is_safe:
            raise bad_request_exception(f"Invalid primary website URL: {err}")

    brand = BrandService.create(db, payload, owner_id=user.id)
    resp = BrandResponse.model_validate(brand)
    resp.assets_count = 0
    resp.scans_count = 0
    resp.findings_count = 0
    return resp


@router.get("/{brand_id}", response_model=BrandDetailResponse)
def get_brand(brand_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return BrandService.get_detail(db, brand_id, owner_id=user.id)


@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(brand_id: str, payload: BrandUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.primary_website:
        is_safe, err = is_safe_external_url(payload.primary_website)
        if not is_safe:
            raise bad_request_exception(f"Invalid primary website URL: {err}")

    brand = BrandService.update(db, brand_id, payload, owner_id=user.id)
    return BrandResponse.model_validate(brand)


@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand(brand_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    BrandService.delete(db, brand_id, owner_id=user.id)


# Recurring Scan Schedule Endpoints
from app.schemas.brand import BrandScheduleUpdate, BrandScheduleResponse
from app.services.scheduler_service import SchedulerService


@router.get("/{brand_id}/schedule", response_model=BrandScheduleResponse)
def get_brand_schedule(brand_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return SchedulerService.get_schedule(db, brand_id, user.id)


@router.put("/{brand_id}/schedule", response_model=BrandScheduleResponse)
def update_brand_schedule(brand_id: str, payload: BrandScheduleUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return SchedulerService.update_schedule(
        db=db,
        brand_id=brand_id,
        owner_id=user.id,
        enabled=payload.schedule_enabled,
        interval_hours=payload.schedule_interval_hours
    )


@router.post("/{brand_id}/schedule/run-now")
def run_brand_schedule_now(brand_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from app.services.scan_service import ScanService
    from app.schemas.scan import ScanTriggerRequest
    req = ScanTriggerRequest(brand_id=brand_id, requested_source_types=["social", "app_store"])
    scan = ScanService.trigger_scan(db, req, owner_id=user.id, run_synchronous=False)
    return {"message": "Scan dispatched", "scan_id": scan.id, "status": scan.status}
