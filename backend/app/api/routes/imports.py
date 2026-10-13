from typing import Optional
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.db.session import get_db
from app.models import Brand, BrandAsset, ScanRun, ScanSourceResult, Candidate, CandidateObservation, Finding, Review
from app.services.brand_service import BrandService
from app.services.asset_service import AssetService
from app.services.scan_service import ScanService
from app.schemas.brand import BrandCreate
from app.schemas.asset import BrandAssetCreate
from app.schemas.scan import ScanTriggerRequest
from app.core.logging import logger

router = APIRouter(prefix="/demo", tags=["Demo & Fixtures"])


@router.post("/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """Seed prototype with Acme Finance and trigger an automated baseline scan."""
    from app.core.config import settings
    from app.core.errors import bad_request_exception

    if not settings.ALLOW_DEMO_RESET:
        raise bad_request_exception("Demo seeding is disabled in production environment. Enable ALLOW_DEMO_RESET explicitly if required.")

    logger.info("Seeding demo data...")

    # Check if Acme already exists
    existing = db.scalar(select(Brand).where(Brand.name == "Acme Finance Group"))
    if not existing:
        brand = BrandService.create(
            db,
            BrandCreate(
                name="Acme Finance Group",
                description="Global digital banking, enterprise payments, and consumer wealth management services.",
                industry="Financial Services & Banking",
                primary_website="https://acmefinance.com",
                is_active=True
            )
        )

        # Register official assets
        assets_to_create = [
            BrandAssetCreate(
                asset_type="official_domain",
                platform="web",
                display_value="acmefinance.com",
                url="https://acmefinance.com",
                verification_status="verified"
            ),
            BrandAssetCreate(
                asset_type="official_social_account",
                platform="instagram",
                display_value="@acmefinance",
                normalized_identifier="acmefinance",
                url="https://instagram.com/acmefinance",
                verification_status="verified"
            ),
            BrandAssetCreate(
                asset_type="official_mobile_app",
                platform="google_play",
                display_value="com.acme.finance.app",
                normalized_identifier="com.acme.finance.app",
                url="https://play.google.com/store/apps/details?id=com.acme.finance.app",
                verification_status="verified"
            ),
            BrandAssetCreate(
                asset_type="official_publisher",
                platform="google_play",
                display_value="Acme Financial Group LLC",
                verification_status="verified"
            ),
            BrandAssetCreate(
                asset_type="logo_image",
                platform="all",
                display_value="Official Brand Crest 2026",
                image_reference="acme_official_logo_v1",
                verification_status="verified"
            ),
            BrandAssetCreate(
                asset_type="brand_keyword",
                platform="all",
                display_value="Acme Finance",
                verification_status="verified"
            )
        ]

        for asset_data in assets_to_create:
            AssetService.create(db, brand.id, asset_data)
    else:
        brand = existing

    # Trigger baseline scan covering all four threat-detection pipelines
    scan = ScanService.trigger_scan(
        db,
        ScanTriggerRequest(
            brand_id=brand.id,
            requested_source_types=["social", "app_store", "domain", "threat_intel"]
        ),
        run_synchronous=True
    )

    return {
        "success": True,
        "message": "Demo data successfully seeded and multi-pipeline threat scan completed.",
        "brand_id": brand.id,
        "brand_name": brand.name,
        "scan_id": scan.id,
        "findings_flagged": scan.total_findings_flagged,
        "candidates_discovered": scan.total_candidates_found
    }


@router.post("/reset")
def reset_database(
    x_aegis_admin_token: Optional[str] = Header(None, alias="x-aegis-admin-token"),
    db: Session = Depends(get_db)
):
    """
    Reset all findings, candidates, scans, and brands for a fresh demonstration.
    Protected by admin confirmation token header to prevent unauthorized destruction.
    """
    from app.core.config import settings
    from app.core.errors import bad_request_exception
    import secrets

    if not settings.ALLOW_DEMO_RESET:
        raise bad_request_exception("Database reset is disabled in current environment.")

    if not x_aegis_admin_token or not secrets.compare_digest(x_aegis_admin_token, settings.AEGIS_ADMIN_TOKEN):
        raise bad_request_exception("Unauthorized reset attempt. Valid 'x-aegis-admin-token' header required.")

    db.execute(delete(Review))
    db.execute(delete(Finding))
    db.execute(delete(CandidateObservation))
    db.execute(delete(Candidate))
    db.execute(delete(ScanSourceResult))
    db.execute(delete(ScanRun))
    db.execute(delete(BrandAsset))
    db.execute(delete(Brand))
    db.commit()
    return {"success": True, "message": "Database reset completed successfully."}
