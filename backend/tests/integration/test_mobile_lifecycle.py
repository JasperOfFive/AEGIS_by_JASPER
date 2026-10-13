import pytest
from app.detection.engine import evaluate_candidate


@pytest.fixture
def brand_profile():
    return {
        "name": "Acme Finance",
        "description": "Global enterprise banking, fintech payment APIs, and consumer wealth management.",
        "primary_website": "https://acmefinance.com"
    }


@pytest.fixture
def registered_assets():
    return [
        {
            "id": "asset-app-active",
            "asset_type": "official_mobile_app",
            "platform": "google_play",
            "display_value": "com.acme.finance.app",
            "normalized_identifier": "com.acme.finance.app",
            "lifecycle_status": "active",
            "official_publisher": "Acme Finance Technologies Inc."
        },
        {
            "id": "asset-app-retired",
            "asset_type": "official_mobile_app",
            "platform": "google_play",
            "display_value": "com.acme.finance.legacyapp",
            "normalized_identifier": "com.acme.finance.legacyapp",
            "lifecycle_status": "retired",
            "official_publisher": "Acme Finance Technologies Inc.",
            "analyst_notes": "Decommissioned v1 application retired in 2025."
        },
        {
            "id": "asset-app-legacy",
            "asset_type": "official_mobile_app",
            "platform": "apple_app_store",
            "display_value": "com.acme.finance.ioslegacy",
            "normalized_identifier": "com.acme.finance.ioslegacy",
            "lifecycle_status": "legacy",
            "official_publisher": "Acme Finance Corp",
            "analyst_notes": "Maintained only for enterprise legacy clients."
        },
        {
            "id": "asset-pub-1",
            "asset_type": "official_publisher",
            "platform": "google_play",
            "display_value": "Acme Finance Technologies Inc.",
            "normalized_identifier": "acme finance technologies inc"
        }
    ]


def test_active_official_app_excluded(brand_profile, registered_assets):
    """
    Active official application is recognized and excluded with confirmed_official_match.
    """
    candidate = {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Acme Finance Banking",
        "username_or_package": "com.acme.finance.app",
        "publisher_or_developer": "Acme Finance Technologies Inc.",
        "description": "Official retail banking mobile application.",
        "external_url": "https://play.google.com/store/apps/details?id=com.acme.finance.app",
        "logo_reference": "acme_logo_v1",
        "metadata_json": {
            "downloads": 5000000,
            "rating": 4.8
        }
    }
    res = evaluate_candidate(brand_profile, registered_assets, candidate)
    assert res.is_threat is False
    assert res.decision == "confirmed_official_match"
    assert res.risk_score == 0.0
    assert "active official mobile application" in res.detection_reasons[0].lower()


def test_retired_official_app_not_flagged(brand_profile, registered_assets):
    """
    Retired official application is recognized as an official asset and NOT labelled
    malicious solely because it is no longer active.
    """
    candidate = {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Acme Finance Mobile (Archived)",
        "username_or_package": "com.acme.finance.legacyapp",
        "publisher_or_developer": "Acme Finance Technologies Inc.",
        "description": "Previous generation mobile banking application.",
        "external_url": "https://play.google.com/store/apps/details?id=com.acme.finance.legacyapp",
        "logo_reference": "acme_logo_v1",
        "metadata_json": {
            "downloads": 100000,
            "rating": 4.1
        }
    }
    res = evaluate_candidate(brand_profile, registered_assets, candidate)
    assert res.is_threat is False
    assert res.decision == "confirmed_official_match"
    assert res.risk_score == 0.0
    assert "retired brand asset" in res.detection_reasons[0].lower()
    assert "not an impersonation threat" in res.detection_reasons[0].lower()


def test_legacy_official_app_not_flagged(brand_profile, registered_assets):
    """
    Legacy official application is recognized and not flagged.
    """
    candidate = {
        "candidate_type": "mobile_app",
        "platform": "apple_app_store",
        "display_name": "Acme Finance iOS Legacy",
        "username_or_package": "com.acme.finance.ioslegacy",
        "publisher_or_developer": "Acme Finance Corp",
        "description": "Legacy iOS banking client.",
        "external_url": "https://apps.apple.com/app/id123456789",
        "logo_reference": "acme_logo_v1",
        "metadata_json": {}
    }
    res = evaluate_candidate(brand_profile, registered_assets, candidate)
    assert res.is_threat is False
    assert res.decision == "confirmed_official_match"
    assert res.risk_score == 0.0
    assert "legacy brand asset" in res.detection_reasons[0].lower()


def test_deceptive_clone_flagged_as_threat(brand_profile, registered_assets):
    """
    A deceptive third-party clone mimicking brand name and package ID with low downloads
    and suspicious permissions must be flagged as a threat.
    """
    candidate = {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Acme Finance Quick Loans",
        "username_or_package": "com.acmefinance.loan.fast",
        "publisher_or_developer": "Apex Shady Devs",
        "description": "Instant unverified loans from Acme Finance. Send deposit to unlock.",
        "external_url": "https://play.google.com/store/apps/details?id=com.acmefinance.loan.fast",
        "logo_reference": "acme_logo_v1",
        "metadata_json": {
            "downloads": 40,
            "rating": 1.2,
            "suspicious_permissions": True
        }
    }
    res = evaluate_candidate(brand_profile, registered_assets, candidate)
    assert res.is_threat is True
    assert res.decision == "potential_impersonation"
    assert res.risk_score >= 50.0


def test_publisher_mismatch_detected(brand_profile, registered_assets):
    """
    An app using brand tokens in its package ID but published by an unverified/mismatched developer.
    """
    candidate = {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Acme Finance Helper",
        "username_or_package": "com.acme.finance.helper",
        "publisher_or_developer": "Rogue Developer Studio",
        "description": "Unofficial companion helper app for Acme Finance.",
        "external_url": "https://play.google.com/store/apps/details?id=com.acme.finance.helper",
        "logo_reference": None,
        "metadata_json": {
            "downloads": 200,
            "rating": 3.0
        }
    }
    res = evaluate_candidate(brand_profile, registered_assets, candidate)
    assert res.is_threat is True
    assert res.decision == "potential_impersonation"
    # Verify publisher mismatch is captured in signal breakdown
    pub_signals = [s for s in res.signal_breakdown if s["category"] == "publisher"]
    assert len(pub_signals) == 1
    assert pub_signals[0]["raw_score"] == 1.0


def test_unknown_benign_utility_not_flagged(brand_profile, registered_assets):
    """
    Missing inventory alone is NOT proof of maliciousness.
    An unknown app with no brand similarity, no brand keywords, and generic name must NOT be flagged.
    """
    candidate = {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Simple Scientific Calculator",
        "username_or_package": "com.utilitytools.calculator",
        "publisher_or_developer": "Utility Tools LLC",
        "description": "Clean and fast scientific calculator for engineers.",
        "external_url": "https://play.google.com/store/apps/details?id=com.utilitytools.calculator",
        "logo_reference": None,
        "metadata_json": {
            "downloads": 10000,
            "rating": 4.5
        }
    }
    res = evaluate_candidate(brand_profile, registered_assets, candidate)
    assert res.is_threat is False
    assert res.decision == "insufficient_evidence"
    assert res.risk_score < 40.0
