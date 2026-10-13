import pytest
from app.detection.engine import evaluate_candidate


def test_high_risk_lookalike_social_profile():
    brand = {
        "name": "Acme Finance",
        "description": "Global corporate banking and financial software solutions.",
        "primary_website": "https://acmefinance.com"
    }
    brand_assets = [
        {
            "id": "asset-1",
            "asset_type": "official_social_account",
            "platform": "instagram",
            "normalized_identifier": "acmefinance",
            "display_value": "@acmefinance",
            "url": "https://instagram.com/acmefinance"
        },
        {
            "id": "asset-logo",
            "asset_type": "logo_image",
            "image_reference": "acme_official_logo_v1"
        }
    ]

    impostor = {
        "candidate_type": "social_profile",
        "platform": "instagram",
        "display_name": "Acme Finance Customer Support Desk",
        "username_or_package": "acmefinance_support",
        "description": "24/7 Official Customer Support. DM for assistance or account recovery.",
        "logo_reference": "acme_official_logo_v1",
        "metadata_json": {
            "follower_count": 12,
            "claimed_verified": True
        }
    }

    result = evaluate_candidate(brand, brand_assets, impostor)
    assert result.is_threat is True
    assert result.risk_score >= 70.0 # Should be high or critical
    assert result.risk_level in ("high", "critical")
    assert len(result.signal_breakdown) > 0
    assert any("Display Name" in s["signal_name"] for s in result.signal_breakdown)


def test_unrelated_entity_low_risk():
    brand = {
        "name": "Acme Finance",
        "description": "Global corporate banking.",
        "primary_website": "https://acmefinance.com"
    }
    brand_assets = []

    unrelated = {
        "candidate_type": "social_profile",
        "platform": "instagram",
        "display_name": "Acme Anvils & Ironmongery",
        "username_or_package": "acmeanvils",
        "description": "Blacksmith supply shop for custom forged metals and industrial tools.",
        "logo_reference": "unrelated_blacksmith_icon",
        "metadata_json": {
            "follower_count": 50000,
            "claimed_verified": False
        }
    }

    result = evaluate_candidate(brand, brand_assets, unrelated)
    # Score should be low risk, not flagged as impersonation threat
    assert result.risk_score < 40.0
