import pytest
from app.detection.engine import evaluate_candidate
from app.adapters.fixtures.dataset import SOCIAL_FIXTURES, APP_STORE_FIXTURES


def test_evaluation_social_monitoring_benchmark():
    brand = {
        "name": "Acme Finance",
        "description": "Global enterprise banking, financial APIs, and digital wealth management.",
        "primary_website": "https://acmefinance.com"
    }
    brand_assets = [
        {
            "id": "asset-social-1",
            "asset_type": "official_social_account",
            "platform": "instagram",
            "normalized_identifier": "acmefinance",
            "display_value": "@acmefinance",
            "url": "https://instagram.com/acmefinance"
        },
        {
            "id": "asset-logo-1",
            "asset_type": "logo_image",
            "image_reference": "acme_official_logo_v1"
        }
    ]

    results = []
    for f in SOCIAL_FIXTURES:
        cand = {
            "candidate_type": "social_profile",
            "platform": f["platform"],
            "display_name": f["display_name"],
            "username_or_package": f["username"],
            "description": f["bio"],
            "external_url": f["profile_url"],
            "logo_reference": f["logo_reference"],
            "metadata_json": {
                "follower_count": f["follower_count"],
                "claimed_verified": f["claimed_verified"]
            }
        }
        res = evaluate_candidate(brand, brand_assets, cand)
        results.append((f, res))

    # 1. Exact official profile MUST be excluded with 0 score
    official_fixture = SOCIAL_FIXTURES[0]
    official_res = [r for f, r in results if f["username"] == "acmefinance"][0]
    assert official_res.is_threat is False
    assert official_res.decision == "confirmed_official_match"
    assert official_res.risk_score == 0.0

    # 2. Typosquatting profile (acmefinaance) MUST be flagged
    typo_res = [r for f, r in results if f["username"] == "acmefinaance"][0]
    assert typo_res.is_threat is True
    assert typo_res.risk_score >= 60.0

    # 3. Transposition profile (amcefinance) MUST be flagged
    trans_res = [r for f, r in results if f["username"] == "amcefinance"][0]
    assert trans_res.is_threat is True
    assert trans_res.risk_score >= 60.0

    # 4. Affix support scam profile MUST be flagged as high/critical
    affix_res = [r for f, r in results if "helpdesk" in f["username"]][0]
    assert affix_res.is_threat is True
    assert affix_res.risk_score >= 70.0
    assert any("help" in r.lower() or "support" in r.lower() for r in affix_res.detection_reasons)

    # 5. Legitimate unrelated entity (acmeanvils) MUST NOT be high risk
    unrelated_res = [r for f, r in results if f["username"] == "acmeanvils"][0]
    assert unrelated_res.risk_score < 40.0


def test_evaluation_app_monitoring_benchmark():
    brand = {
        "name": "Acme Finance",
        "description": "Global enterprise banking and mobile wallet.",
        "primary_website": "https://acmefinance.com"
    }
    brand_assets = [
        {
            "id": "asset-app-1",
            "asset_type": "official_mobile_app",
            "platform": "google_play",
            "normalized_identifier": "com.acme.finance.app",
            "display_value": "com.acme.finance.app",
            "url": "https://play.google.com/store/apps/details?id=com.acme.finance.app"
        },
        {
            "id": "asset-pub-1",
            "asset_type": "official_publisher",
            "platform": "google_play",
            "normalized_identifier": "acme financial group llc",
            "display_value": "Acme Financial Group LLC"
        },
        {
            "id": "asset-logo-1",
            "asset_type": "logo_image",
            "image_reference": "acme_app_icon_v1"
        }
    ]

    results = []
    for f in APP_STORE_FIXTURES:
        cand = {
            "candidate_type": "mobile_app",
            "platform": f["store"],
            "display_name": f["app_name"],
            "username_or_package": f["package_id"],
            "publisher_or_developer": f["publisher"],
            "description": f["description"],
            "external_url": f["listing_url"],
            "logo_reference": f["logo_reference"],
            "metadata_json": {
                "downloads": f["downloads"],
                "rating": f["rating"],
                "developer_website": f.get("developer_website"),
                "suspicious_permissions": f.get("suspicious_permissions", False)
            }
        }
        res = evaluate_candidate(brand, brand_assets, cand)
        results.append((f, res))

    # 1. Exact official app MUST be excluded
    official_app_res = [r for f, r in results if f["package_id"] == "com.acme.finance.app"][0]
    assert official_app_res.is_threat is False
    assert official_app_res.decision == "confirmed_official_match"

    # 2. Lookalike clone app MUST be flagged as critical/high
    clone_res = [r for f, r in results if "quickloan" in f["package_id"]][0]
    assert clone_res.is_threat is True
    assert clone_res.risk_score >= 60.0
    assert clone_res.risk_level in ("high", "critical")

    # 3. Unrelated soundboard app MUST NOT be flagged as high threat
    unrelated_app_res = [r for f, r in results if "acmesounds" in f["package_id"]][0]
    assert unrelated_app_res.risk_score < 40.0
