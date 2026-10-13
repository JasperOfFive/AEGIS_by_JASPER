from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.models.scan import ScanRun
from app.models.brand import Brand
from app.schemas.scan import ScanTriggerRequest
from app.workers.scan_runner import ScanRunner
from app.core.errors import EntityNotFoundError


from app.workers.scan_executor import ScanExecutionManager


class ScanService:
    @staticmethod
    def trigger_scan(
        db: Session,
        req: ScanTriggerRequest,
        run_synchronous: bool = False
    ) -> ScanRun:
        brand = db.scalar(select(Brand).where(Brand.id == req.brand_id))
        if not brand:
            raise EntityNotFoundError(f"Brand '{req.brand_id}' not found.")

        # Create ScanRun record with queued status
        scan = ScanRun(
            brand_id=req.brand_id,
            requested_source_types=req.requested_source_types,
            status="queued"
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        if run_synchronous:
            # Controlled synchronous execution path for unit tests / dev
            ScanRunner.execute_scan(
                db=db,
                scan_run_id=scan.id,
                simulate_unavailable_source=req.simulate_unavailable_source
            )
            db.refresh(scan)
        else:
            # Durable background execution
            manager = ScanExecutionManager.get_instance()
            accepted = manager.submit_scan(
                scan_id=scan.id,
                brand_id=brand.id,
                simulate_unavailable_source=req.simulate_unavailable_source
            )
            if not accepted:
                scan.status = "failed"
                scan.failure_details = "Concurrent scan rejected: another scan is already running for this brand."
                db.commit()
                db.refresh(scan)

        return scan

    @staticmethod
    def get_status(db: Session, scan_id: str) -> dict:
        scan = ScanService.get_by_id(db, scan_id)
        is_terminal = scan.status in ("completed", "partially_completed", "failed")
        return {
            "id": scan.id,
            "brand_id": scan.brand_id,
            "status": scan.status,
            "is_terminal": is_terminal,
            "started_at": scan.started_at,
            "completed_at": scan.completed_at,
            "total_candidates_found": scan.total_candidates_found,
            "total_findings_flagged": scan.total_findings_flagged,
            "failure_details": scan.failure_details,
            "created_at": scan.created_at,
            "source_results": scan.source_results
        }

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
