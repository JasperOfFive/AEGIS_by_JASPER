import pytest
from fastapi.testclient import TestClient


def test_end_to_end_api_workflow(client: TestClient):
    # 1. Health check
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    # 2. Create Brand
    brand_payload = {
        "name": "Acme Finance Group",
        "description": "Global corporate banking and wealth management.",
        "industry": "Financial Services",
        "primary_website": "https://acmefinance.com",
        "is_active": True
    }
    res = client.post("/api/v1/brands", json=brand_payload)
    assert res.status_code == 201
    brand_data = res.json()
    brand_id = brand_data["id"]

    # 3. Add Official Assets
    asset_social = {
        "asset_type": "official_social_account",
        "platform": "instagram",
        "display_value": "@acmefinance",
        "url": "https://instagram.com/acmefinance",
        "verification_status": "verified"
    }
    res = client.post(f"/api/v1/brands/{brand_id}/assets", json=asset_social)
    assert res.status_code == 201

    asset_app = {
        "asset_type": "official_mobile_app",
        "platform": "google_play",
        "display_value": "com.acme.finance.app",
        "url": "https://play.google.com/store/apps/details?id=com.acme.finance.app",
        "verification_status": "verified"
    }
    res = client.post(f"/api/v1/brands/{brand_id}/assets", json=asset_app)
    assert res.status_code == 201

    # 4. Trigger Scan Run (synchronous for test verification)
    scan_payload = {
        "brand_id": brand_id,
        "requested_source_types": ["social", "app_store"]
    }
    res = client.post("/api/v1/scans?synchronous=true", json=scan_payload)
    assert res.status_code == 201
    scan_data = res.json()
    assert scan_data["status"] == "completed"
    assert scan_data["total_candidates_found"] > 0
    assert scan_data["total_findings_flagged"] > 0

    # 5. List Findings
    res = client.get(f"/api/v1/findings?brand_id={brand_id}")
    assert res.status_code == 200
    findings_page = res.json()
    assert findings_page["total"] > 0
    findings = findings_page["items"]
    
    first_finding = findings[0]
    finding_id = first_finding["id"]
    assert first_finding["risk_score"] > 0
    assert first_finding["candidate"] is not None

    # 6. Add Review (Status transition & Audit Trail)
    review_payload = {
        "new_status": "confirmed_threat",
        "reviewer": "sarah_security",
        "comment": "Confirmed brand impersonation lookalike profile soliciting user credentials."
    }
    res = client.post(f"/api/v1/findings/{finding_id}/reviews", json=review_payload)
    assert res.status_code == 201
    review_data = res.json()
    assert review_data["new_status"] == "confirmed_threat"

    # Verify Finding updated status
    res = client.get(f"/api/v1/findings/{finding_id}")
    assert res.status_code == 200
    updated_finding = res.json()
    assert updated_finding["review_status"] == "confirmed_threat"
    assert len(updated_finding["reviews"]) >= 2 # Initial auto-review + analyst review

    # 7. Dashboard Stats
    res = client.get("/api/v1/dashboard/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats["overview"]["total_brands"] >= 1
    assert stats["overview"]["total_scans"] >= 1
    assert stats["overview"]["total_findings"] >= 1
