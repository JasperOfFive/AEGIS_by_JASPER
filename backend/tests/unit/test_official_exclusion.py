import pytest
from app.detection.official_exclusion import evaluate_official_exclusion, ExclusionDecision


def test_official_social_exclusion_exact_match():
    brand_name = "Acme Finance"
    brand_website = "https://acmefinance.com"
    registered_assets = [
        {
            "id": "asset-1",
            "asset_type": "official_social_account",
            "platform": "instagram",
            "normalized_identifier": "acmefinance",
            "display_value": "@acmefinance",
            "url": "https://instagram.com/acmefinance"
        }
    ]

    candidate = {
        "candidate_type": "social_profile",
        "platform": "instagram",
        "display_name": "Acme Finance Official",
        "username_or_package": "acmefinance",
        "external_url": "https://instagram.com/acmefinance"
    }

    res = evaluate_official_exclusion(brand_name, brand_website, registered_assets, candidate)
    assert res.decision == ExclusionDecision.CONFIRMED_OFFICIAL_MATCH
    assert res.is_excluded_from_findings is True
    assert res.matched_asset_id == "asset-1"


def test_official_mobile_app_exclusion():
    brand_name = "Acme Finance"
    brand_website = "https://acmefinance.com"
    registered_assets = [
        {
            "id": "asset-app-1",
            "asset_type": "official_mobile_app",
            "platform": "google_play",
            "normalized_identifier": "com.acme.finance.app",
            "display_value": "com.acme.finance.app",
            "url": "https://play.google.com/store/apps/details?id=com.acme.finance.app"
        }
    ]

    candidate = {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Acme Mobile Banking",
        "username_or_package": "com.acme.finance.app",
        "publisher_or_developer": "Acme Financial Group LLC",
        "external_url": "https://play.google.com/store/apps/details?id=com.acme.finance.app"
    }

    res = evaluate_official_exclusion(brand_name, brand_website, registered_assets, candidate)
    assert res.decision == ExclusionDecision.CONFIRMED_OFFICIAL_MATCH
    assert res.is_excluded_from_findings is True


def test_lookalike_not_excluded_despite_display_name_match():
    # Impostor uses the same display name "Acme Finance", but different handle
    brand_name = "Acme Finance"
    brand_website = "https://acmefinance.com"
    registered_assets = [
        {
            "id": "asset-1",
            "asset_type": "official_social_account",
            "platform": "instagram",
            "normalized_identifier": "acmefinance",
            "display_value": "@acmefinance",
            "url": "https://instagram.com/acmefinance"
        }
    ]

    candidate = {
        "candidate_type": "social_profile",
        "platform": "instagram",
        "display_name": "Acme Finance", # Copied brand display name
        "username_or_package": "acmefinance_claims", # Fake handle
        "external_url": "https://instagram.com/acmefinance_claims"
    }

    res = evaluate_official_exclusion(brand_name, brand_website, registered_assets, candidate)
    assert res.decision == ExclusionDecision.POTENTIAL_IMPERSONATION
    assert res.is_excluded_from_findings is False
