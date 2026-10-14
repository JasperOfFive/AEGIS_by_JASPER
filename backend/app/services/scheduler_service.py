from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.brand import Brand
from app.models.scan import ScanRun
from app.workers.scan_executor import ScanExecutionManager
from app.core.errors import EntityNotFoundError
from app.core.logging import logger


class SchedulerService:
    @staticmethod
    def get_schedule(db: Session, brand_id: str, owner_id: str | None = None) -> dict:
        query = select(Brand).where(Brand.id == brand_id)
        if owner_id:
            query = query.where(Brand.owner_id == owner_id)
        brand = db.scalar(query)
        if not brand:
            raise EntityNotFoundError(f"Brand '{brand_id}' not found.")

        is_scanning = ScanExecutionManager.get_instance().is_brand_active(brand_id)
        return {
            "brand_id": brand.id,
            "brand_name": brand.name,
            "schedule_enabled": bool(brand.schedule_enabled),
            "schedule_interval_hours": brand.schedule_interval_hours or 24,
            "last_scheduled_run_at": brand.last_scheduled_run_at,
            "next_scheduled_run_at": brand.next_scheduled_run_at,
            "is_currently_scanning": is_scanning
        }

    @staticmethod
    def update_schedule(
        db: Session,
        brand_id: str,
        enabled: bool,
        interval_hours: int,
        owner_id: str | None = None
    ) -> dict:
        query = select(Brand).where(Brand.id == brand_id)
        if owner_id:
            query = query.where(Brand.owner_id == owner_id)
        brand = db.scalar(query)
        if not brand:
            raise EntityNotFoundError(f"Brand '{brand_id}' not found.")

        brand.schedule_enabled = enabled
        brand.schedule_interval_hours = max(1, min(720, interval_hours))

        now = datetime.now(timezone.utc)
        if enabled:
            # If enabling and no next run or it's in the past, schedule next run
            if brand.next_scheduled_run_at is None or brand.next_scheduled_run_at < now:
                brand.next_scheduled_run_at = now + timedelta(hours=brand.schedule_interval_hours)
        else:
            brand.next_scheduled_run_at = None

        db.commit()
        db.refresh(brand)

        is_scanning = ScanExecutionManager.get_instance().is_brand_active(brand_id)
        return {
            "brand_id": brand.id,
            "brand_name": brand.name,
            "schedule_enabled": bool(brand.schedule_enabled),
            "schedule_interval_hours": brand.schedule_interval_hours,
            "last_scheduled_run_at": brand.last_scheduled_run_at,
            "next_scheduled_run_at": brand.next_scheduled_run_at,
            "is_currently_scanning": is_scanning
        }

    @staticmethod
    def check_and_dispatch_due_schedules(db: Session) -> List[str]:
        """
        Polls for due brand schedules and safely dispatches background scans.
        Guarantees:
        1. Persists schedule times (last_scheduled_run_at, next_scheduled_run_at)
        2. Strictly prevents duplicate scheduled scans for active brands
        3. Returns list of newly scheduled scan IDs
        """
        now = datetime.now(timezone.utc)
        manager = ScanExecutionManager.get_instance()

        due_brands = db.scalars(
            select(Brand).where(
                Brand.schedule_enabled == True,
                Brand.is_active == True,
                (Brand.next_scheduled_run_at <= now) | (Brand.next_scheduled_run_at == None)
            )
        ).all()

        dispatched_scan_ids = []

        for brand in due_brands:
            # 1. Prevent duplicate if brand is actively executing in background pool
            if manager.is_brand_active(brand.id):
                logger.info(f"Skipping scheduled scan for '{brand.name}': scan is actively executing.")
                continue

            # 2. Prevent duplicate if there is an existing uncompleted scan in DB
            active_scan_exists = db.scalar(
                select(ScanRun.id).where(
                    ScanRun.brand_id == brand.id,
                    ScanRun.status.in_(["queued", "running"])
                )
            )
            if active_scan_exists:
                logger.info(f"Skipping scheduled scan for '{brand.name}': uncompleted scan {active_scan_exists} exists.")
                continue

            # 3. Create ScanRun
            scan = ScanRun(
                brand_id=brand.id,
                requested_source_types=["social", "app_store"],
                status="queued"
            )
            db.add(scan)

            # 4. Advance brand schedule
            brand.last_scheduled_run_at = now
            interval = brand.schedule_interval_hours or 24
            brand.next_scheduled_run_at = now + timedelta(hours=interval)

            db.commit()
            db.refresh(scan)

            # 5. Dispatch to background pool
            accepted = manager.submit_scan(scan_id=scan.id, brand_id=brand.id)
            if accepted:
                dispatched_scan_ids.append(scan.id)
                logger.info(f"Successfully dispatched scheduled scan {scan.id} for brand '{brand.name}'.")
            else:
                logger.warning(f"Failed to submit scheduled scan {scan.id} to execution manager.")

        return dispatched_scan_ids
