import json
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.brand import Brand
from app.models.candidate import Candidate
from app.models.scan import ScanRun
from app.models.finding import Finding
from app.core.config import settings


@pytest.fixture
def api_test_finding(db_session: Session) -> Finding:
    brand = Brand(
        name="Acme Finance",
        description="Global banking and digital assets.",
        primary_website="https://acmefinance.com",
        industry="Financial Services"
    )
    db_session.add(brand)
    db_session.flush()

    candidate = Candidate(
        candidate_type="social_profile",
        platform="twitter",
        display_name="Acme Finance Official Help",
        username_or_package="acmefinance_help",
        description="Official support channel. Send direct message for instant help.",
        external_url="https://x.com/acmefinance_help",
        source_provenance="fixture:twitter"
    )
    db_session.add(candidate)
    db_session.flush()

    scan = ScanRun(
        brand_id=brand.id,
        requested_source_types=["social"],
        status="completed"
    )
    db_session.add(scan)
    db_session.flush()

    finding = Finding(
        brand_id=brand.id,
        candidate_id=candidate.id,
        scan_run_id=scan.id,
        risk_score=72.0,
        risk_level="high",
        decision="potential_impersonation",
        detection_reasons=["Name similarity to brand", "Support keywords in handle"],
        signal_breakdown=[{"signal_name": "Handle", "score_contribution": 20.0, "max_weight": 25.0}],
        evidence_summary="Lookalike support handle.",
        review_status="new"
    )
    db_session.add(finding)
    db_session.commit()
    db_session.refresh(finding)
    return finding


def test_ai_status_endpoint(client: TestClient):
    """GET /api/v1/ai/status returns configuration status without revealing secrets."""
    res = client.get("/api/v1/ai/status")
    assert res.status_code == 200
    data = res.json()
    assert "configured" in data
    assert "provider" in data
    assert "model" in data
    assert "base_url" in data
    assert "timeout_seconds" in data
    assert "api_key" not in data
    assert "APINEX_API_KEY" not in data
    assert "Authorization" not in str(data)


def test_post_explain_finding_unconfigured(client: TestClient, api_test_finding: Finding):
    """POST /api/v1/findings/{id}/explain returns deterministic fallback when not configured."""
    with patch.object(settings, "APINEX_API_KEY", ""):
        res = client.post(f"/api/v1/findings/{api_test_finding.id}/explain")
        assert res.status_code == 200
        data = res.json()
        assert data["finding_id"] == api_test_finding.id
        assert data["status"] == "not_configured"
        assert data["is_ai_generated"] is False
        assert "explanation" in data
        assert len(data["explanation"]["suggested_actions"]) > 0


def test_post_explain_finding_mocked_success(client: TestClient, api_test_finding: Finding):
    """POST /api/v1/findings/{id}/explain returns AI structured explanation on successful provider call."""
    mock_llm_json = {
        "summary": "The candidate handle mimics Acme Finance support channel.",
        "rule_triggers": ["Handle similarity 20/25 pts"],
        "evidence_supported": ["Handle contains brand name"],
        "uncertainties": ["Account ownership unverified"],
        "suggested_actions": ["File takedown request"]
    }
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.text = json.dumps({
        "choices": [{"message": {"content": json.dumps(mock_llm_json)}}]
    })

    with patch.object(settings, "APINEX_API_KEY", "real_key_xyz"), \
         patch("app.services.explanation_service.ExplanationService._call_provider", return_value=(json.dumps({"choices": [{"message": {"content": json.dumps(mock_llm_json)}}]}), 200, None, "success")):
        res = client.post(f"/api/v1/findings/{api_test_finding.id}/explain?force_refresh=true")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["is_ai_generated"] is True
        assert data["model"] == settings.APINEX_MODEL
        assert data["explanation"]["summary"] == mock_llm_json["summary"]
