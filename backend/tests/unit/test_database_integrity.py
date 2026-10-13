import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import text, select
from datetime import datetime, timezone

from app.models.brand import Brand
from app.models.brand_asset import BrandAsset
from app.models.scan import ScanRun, ScanSourceResult
from app.models.candidate import Candidate, CandidateObservation
from app.models.finding import Finding
from app.models.review import Review


def test_sqlite_foreign_keys_pragma_enabled(db_session: Session):
    """PRAGMA foreign_keys must be active (value=1)."""
    val = db_session.execute(text("PRAGMA foreign_keys;")).scalar()
    assert val == 1, f"Expected PRAGMA foreign_keys=1, got {val}"


def test_invalid_foreign_key_insert_fails(db_session: Session):
    """Inserting a child record referencing a nonexistent parent must raise IntegrityError."""
    # Attempt to insert a brand_asset for a non-existent brand_id
    orphan_asset = BrandAsset(
        brand_id="nonexistent-brand-id-12345",
        asset_type="official_domain",
        platform="web",
        normalized_identifier="evil.example.com",
        display_value="evil.example.com",
        verification_status="verified"
    )
    db_session.add(orphan_asset)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

    # Attempt to insert a candidate_observation for a non-existent scan_run_id
    candidate = Candidate(
        candidate_type="domain",
        platform="web",
        canonical_identifier="example.com",
        display_name="Example",
        username_or_package="example.com",
        source_provenance="osint:test",
        metadata_json={}
    )
    db_session.add(candidate)
    db_session.commit()

    orphan_obs = CandidateObservation(
        scan_run_id="nonexistent-scan-run-99999",
        candidate_id=candidate.id,
        raw_payload={},
        provenance="test:invalid"
    )
    db_session.add(orphan_obs)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_configured_cascades_work(db_session: Session):
    """Deleting a parent record must cascade delete its dependent children."""
    now = datetime.now(timezone.utc)
    # 1. Create Brand
    brand = Brand(name="Cascade Test Brand", primary_website="https://cascade.example.com")
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)

    # 2. Add Brand Asset
    asset = BrandAsset(
        brand_id=brand.id,
        asset_type="official_domain",
        platform="web",
        normalized_identifier="cascade.example.com",
        display_value="cascade.example.com",
        verification_status="verified"
    )
    db_session.add(asset)

    # 3. Add Scan Run and Scan Source Result
    scan = ScanRun(
        brand_id=brand.id,
        requested_source_types=["social"],
        status="completed"
    )
    db_session.add(scan)
    db_session.commit()
    db_session.refresh(scan)

    source_res = ScanSourceResult(
        scan_run_id=scan.id,
        source_name="social_live",
        status="success",
        records_collected=1,
        started_at=now,
        completed_at=now
    )
    db_session.add(source_res)

    # 4. Add Candidate & Observation
    candidate = Candidate(
        candidate_type="social_profile",
        platform="twitter",
        canonical_identifier="cascade_user",
        display_name="Cascade User",
        username_or_package="cascade_user",
        source_provenance="test:provenance",
        metadata_json={}
    )
    db_session.add(candidate)
    db_session.commit()
    db_session.refresh(candidate)

    obs = CandidateObservation(
        scan_run_id=scan.id,
        candidate_id=candidate.id,
        raw_payload={"test": 1},
        provenance="test:provenance",
        observed_at=now
    )
    db_session.add(obs)
    db_session.commit()

    obs_id = obs.id
    source_res_id = source_res.id
    asset_id = asset.id

    # Verify children exist
    assert db_session.get(BrandAsset, asset_id) is not None
    assert db_session.get(ScanSourceResult, source_res_id) is not None
    assert db_session.get(CandidateObservation, obs_id) is not None

    # Deleting the scan should cascade delete its observation and source result
    db_session.delete(scan)
    db_session.commit()

    assert db_session.get(ScanSourceResult, source_res_id) is None
    assert db_session.get(CandidateObservation, obs_id) is None

    # Deleting the brand should cascade delete its brand asset
    db_session.delete(brand)
    db_session.commit()

    assert db_session.get(BrandAsset, asset_id) is None
