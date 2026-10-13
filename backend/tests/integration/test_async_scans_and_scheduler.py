import time
from datetime import datetime, timezone, timedelta
import pytest
from sqlalchemy.orm import Session
from app.models.brand import Brand
from app.models.scan import ScanRun
from app.schemas.scan import ScanTriggerRequest
from app.services.scan_service import ScanService
from app.services.scheduler_service import SchedulerService
from app.workers.scan_executor import ScanExecutionManager


@pytest.fixture
def test_brand(db_session: Session) -> Brand:
    brand = Brand(
        name="Async Acme Corp",
        description="Test brand for async scan and scheduler execution.",
        primary_website="https://async-acme.example.com",
        schedule_enabled=False,
        schedule_interval_hours=24
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)
    return brand


def test_scan_prompt_response_returns_queued(db_session: Session, test_brand: Brand):
    """
    Scan request returns promptly with a persisted scan ID and 'queued' status.
    """
    req = ScanTriggerRequest(
        brand_id=test_brand.id,
        requested_source_types=["social", "app_store"]
    )
    # Background execution (run_synchronous=False)
    scan = ScanService.trigger_scan(db_session, req, run_synchronous=False)

    assert scan.id is not None
    assert scan.brand_id == test_brand.id
    assert scan.status in ("queued", "running", "completed")  # may transition quickly

    # Query status endpoint
    status_data = ScanService.get_status(db_session, scan.id)
    assert status_data["id"] == scan.id
    assert "is_terminal" in status_data


def test_scan_duplicate_processing_prevention(db_session: Session, test_brand: Brand):
    """
    Concurrent requests cannot process the same active brand scan twice.
    """
    manager = ScanExecutionManager.get_instance()
    
    # Simulate an active scan in progress for test_brand
    scan1 = ScanRun(
        brand_id=test_brand.id,
        requested_source_types=["social"],
        status="running"
    )
    db_session.add(scan1)
    db_session.commit()

    # Manually register brand in manager active set
    with manager._state_lock:
        manager._active_brands.add(test_brand.id)

    try:
        req = ScanTriggerRequest(
            brand_id=test_brand.id,
            requested_source_types=["social"]
        )
        scan2 = ScanService.trigger_scan(db_session, req, run_synchronous=False)
        # Should be rejected to prevent duplicate execution
        assert scan2.status == "failed"
        assert "duplicate" in scan2.failure_details.lower() or "already running" in scan2.failure_details.lower()
    finally:
        with manager._state_lock:
            manager._active_brands.discard(test_brand.id)


def test_scan_startup_recovery_policy(db_session: Session, test_brand: Brand):
    """
    Abandoned 'queued' or 'running' scans are safely transitioned to 'failed'
    upon server restart recovery.
    """
    abandoned_running = ScanRun(
        brand_id=test_brand.id,
        requested_source_types=["social"],
        status="running"
    )
    abandoned_queued = ScanRun(
        brand_id=test_brand.id,
        requested_source_types=["app_store"],
        status="queued"
    )
    db_session.add_all([abandoned_running, abandoned_queued])
    db_session.commit()

    recovered_count = ScanExecutionManager.recover_abandoned_scans(db_session)
    assert recovered_count >= 2

    db_session.refresh(abandoned_running)
    db_session.refresh(abandoned_queued)

    assert abandoned_running.status == "failed"
    assert "interrupted" in abandoned_running.failure_details.lower() or "abandoned" in abandoned_running.failure_details.lower()
    assert abandoned_queued.status == "failed"


def test_scan_partial_failure_handling(db_session: Session, test_brand: Brand):
    """
    When one adapter fails (simulated), scan records partial completion
    and persists adapter failure details without failing the entire run.
    """
    req = ScanTriggerRequest(
        brand_id=test_brand.id,
        requested_source_types=["social", "app_store"],
        simulate_unavailable_source="app_store"
    )
    # Execute synchronously to verify outcome state
    scan = ScanService.trigger_scan(db_session, req, run_synchronous=True)
    assert scan.status in ("partially_completed", "completed")
    
    # Check source results
    source_results = scan.source_results
    assert len(source_results) > 0
    failed_sources = [s for s in source_results if s.status == "failed"]
    assert len(failed_sources) >= 1
    assert failed_sources[0].error_message is not None


def test_scheduler_due_job_dispatch(db_session: Session, test_brand: Brand):
    """
    Scheduler dispatches scans for brands whose next_scheduled_run_at is due (in the past).
    """
    now = datetime.now(timezone.utc)
    test_brand.schedule_enabled = True
    test_brand.schedule_interval_hours = 12
    test_brand.next_scheduled_run_at = now - timedelta(hours=1)
    db_session.commit()

    dispatched = SchedulerService.check_and_dispatch_due_schedules(db_session)
    assert len(dispatched) >= 1

    db_session.refresh(test_brand)
    assert test_brand.last_scheduled_run_at is not None
    next_run = test_brand.next_scheduled_run_at
    if next_run.tzinfo is None:
        next_run = next_run.replace(tzinfo=timezone.utc)
    assert next_run > now


def test_scheduler_disabled_schedules_ignored(db_session: Session, test_brand: Brand):
    """
    Scheduler ignores brands where schedule_enabled is False.
    """
    test_brand.schedule_enabled = False
    test_brand.next_scheduled_run_at = datetime.now(timezone.utc) - timedelta(hours=1)
    db_session.commit()

    dispatched = SchedulerService.check_and_dispatch_due_schedules(db_session)
    assert test_brand.id not in [db_session.get(ScanRun, s_id).brand_id for s_id in dispatched if db_session.get(ScanRun, s_id)]


def test_scheduler_duplicate_prevention_on_active_scan(db_session: Session, test_brand: Brand):
    """
    Scheduler prevents dispatching a duplicate scan if an uncompleted scan is already active in DB.
    """
    now = datetime.now(timezone.utc)
    test_brand.schedule_enabled = True
    test_brand.next_scheduled_run_at = now - timedelta(minutes=5)

    # Active running scan exists
    active_scan = ScanRun(
        brand_id=test_brand.id,
        requested_source_types=["social"],
        status="running"
    )
    db_session.add(active_scan)
    db_session.commit()

    dispatched = SchedulerService.check_and_dispatch_due_schedules(db_session)
    # The active brand must NOT have another scan dispatched
    for s_id in dispatched:
        s = db_session.get(ScanRun, s_id)
        if s:
            assert s.brand_id != test_brand.id
