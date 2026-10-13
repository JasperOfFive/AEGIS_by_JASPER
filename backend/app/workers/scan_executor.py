import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from typing import Optional, Set
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.scan import ScanRun
from app.workers.scan_runner import ScanRunner
from app.core.logging import logger


class ScanExecutionManager:
    """
    Durable in-process scan execution manager with:
    - Bounded ThreadPoolExecutor (prevents unbounded thread creation)
    - Thread-safe duplicate processing prevention per scan and brand
    - Safe exception handling ensuring jobs never remain stuck in 'running'
    - Startup recovery for abandoned queued or running scans
    """
    _instance: Optional["ScanExecutionManager"] = None
    _lock = threading.Lock()

    def __init__(self, max_workers: int = 2):
        self.executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="aegis_scan_worker")
        self._active_scans: Set[str] = set()
        self._active_brands: Set[str] = set()
        self._state_lock = threading.Lock()

    @classmethod
    def get_instance(cls) -> "ScanExecutionManager":
        with cls._lock:
            if cls._instance is None or cls._instance.executor._shutdown:
                cls._instance = cls()
            return cls._instance

    def is_scan_active(self, scan_id: str) -> bool:
        with self._state_lock:
            return scan_id in self._active_scans

    def is_brand_active(self, brand_id: str) -> bool:
        with self._state_lock:
            return brand_id in self._active_brands

    def submit_scan(
        self,
        scan_id: str,
        brand_id: str,
        simulate_unavailable_source: Optional[str] = None
    ) -> bool:
        """
        Submit a queued scan for background execution.
        Returns True if accepted, False if the scan or brand is already actively processing.
        """
        with self._state_lock:
            if scan_id in self._active_scans or brand_id in self._active_brands:
                logger.warning(f"Scan {scan_id} or Brand {brand_id} is already actively processing. Rejecting duplicate.")
                return False
            self._active_scans.add(scan_id)
            self._active_brands.add(brand_id)

        logger.info(f"Submitting scan {scan_id} (brand: {brand_id}) to background execution pool.")
        self.executor.submit(
            self._run_scan_job,
            scan_id,
            brand_id,
            simulate_unavailable_source
        )
        return True

    def _run_scan_job(
        self,
        scan_id: str,
        brand_id: str,
        simulate_unavailable_source: Optional[str]
    ):
        db: Session = SessionLocal()
        try:
            ScanRunner.execute_scan(
                db=db,
                scan_run_id=scan_id,
                simulate_unavailable_source=simulate_unavailable_source
            )
        except Exception as exc:
            logger.exception(f"Unhandled exception during background execution of scan {scan_id}: {exc}")
            try:
                scan = db.scalar(select(ScanRun).where(ScanRun.id == scan_id))
                if scan:
                    scan.status = "failed"
                    scan.completed_at = datetime.now(timezone.utc)
                    scan.failure_details = f"Unhandled background execution error: {str(exc)}"
                    db.commit()
            except Exception as inner_exc:
                logger.error(f"Failed to record failure status for scan {scan_id}: {inner_exc}")
        finally:
            try:
                db.close()
            except Exception:
                pass
            with self._state_lock:
                self._active_scans.discard(scan_id)
                self._active_brands.discard(brand_id)

    @classmethod
    def recover_abandoned_scans(cls, db: Session) -> int:
        """
        Startup recovery policy:
        Transitions abandoned 'queued' or 'running' scans from prior unexpected
        server shutdowns to 'failed' status with clear diagnostic details.
        Does NOT blindly rerun non-idempotent jobs.
        """
        abandoned_scans = db.scalars(
            select(ScanRun).where(ScanRun.status.in_(["queued", "running"]))
        ).all()

        recovered_count = len(abandoned_scans)
        if recovered_count > 0:
            logger.warning(f"Recovering {recovered_count} abandoned scan(s) from previous server execution.")
            now = datetime.now(timezone.utc)
            for s in abandoned_scans:
                s.status = "failed"
                s.completed_at = now
                s.failure_details = "Scan was interrupted by server restart or unexpected process termination."
            db.commit()
        return recovered_count

    def shutdown(self, wait: bool = False):
        self.executor.shutdown(wait=wait)
