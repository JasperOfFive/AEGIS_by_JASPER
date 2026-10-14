from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.scan_service import ScanService
from app.schemas.scan import ScanTriggerRequest, ScanRunResponse, ScanStatusResponse
from app.models.user import User
from app.security.auth import get_current_user

router = APIRouter(prefix="/scans", tags=["Scans"])


@router.post("", response_model=ScanRunResponse, status_code=status.HTTP_201_CREATED)
def trigger_scan(payload: ScanTriggerRequest, synchronous: bool = False, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    scan = ScanService.trigger_scan(db, payload, owner_id=user.id, run_synchronous=synchronous)
    return ScanRunResponse.model_validate(scan)


@router.get("/{scan_id}/status", response_model=ScanStatusResponse)
def get_scan_status(scan_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    status_data = ScanService.get_status(db, scan_id, user.id)
    return ScanStatusResponse.model_validate(status_data)


@router.get("", response_model=List[ScanRunResponse])
def list_scans(limit: int = 50, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    scans = ScanService.list_all(db, owner_id=user.id, limit=limit)
    return [ScanRunResponse.model_validate(s) for s in scans]


@router.get("/{scan_id}", response_model=ScanRunResponse)
def get_scan(scan_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    scan = ScanService.get_by_id(db, scan_id, user.id)
    return ScanRunResponse.model_validate(scan)


@router.get("/brand/{brand_id}", response_model=List[ScanRunResponse])
def list_scans_for_brand(brand_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    scans = ScanService.list_by_brand(db, brand_id, user.id)
    return [ScanRunResponse.model_validate(s) for s in scans]
