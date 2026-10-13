from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.models.scan import ScanRun
from app.models.brand import Brand
from app.schemas.scan import ScanTriggerRequest
from app.workers.scan_runner import ScanRunner
from app.core.errors import EntityNotFoundError


class ScanService:
    @staticmethod
    def trigger_scan(
        db: Session,
        req: ScanTriggerRequest,
        run_synchronous: bool = True
    ) -> ScanRun:
        brand = db.scalar(select(Brand).where(Brand.id == req.brand_id))
        if not brand:
            raise EntityNotFoundError(f"Brand '{req.brand_id}' not found.")

        # Create ScanRun record
        scan = ScanRun(
            brand_id=req.brand_id,
            requested_source_types=req.requested_source_types,
            status="queued"
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        if run_synchronous:
            # Run scan runner directly
            ScanRunner.execute_scan(
                db=db,
                scan_run_id=scan.id,
                simulate_unavailable_source=req.simulate_unavailable_source
            )
            db.refresh(scan)

        return scan

    @staticmethod
    def get_by_id(db: Session, scan_id: str) -> ScanRun:
        scan = db.scalar(
            select(ScanRun)
            .options(joinedload(ScanRun.source_results))
            .where(ScanRun.id == scan_id)
        )
        if not scan:
            raise EntityNotFoundError(f"Scan '{scan_id}' not found.")
        return scan

    @staticmethod
    def list_by_brand(db: Session, brand_id: str) -> List[ScanRun]:
        return db.scalars(
            select(ScanRun)
            .options(joinedload(ScanRun.source_results))
            .where(ScanRun.brand_id == brand_id)
            .order_by(ScanRun.created_at.desc())
        ).unique().all()

    @staticmethod
    def list_all(db: Session, limit: int = 50) -> List[ScanRun]:
        return db.scalars(
            select(ScanRun)
            .options(joinedload(ScanRun.source_results))
            .order_by(ScanRun.created_at.desc())
            .limit(limit)
        ).unique().all()
