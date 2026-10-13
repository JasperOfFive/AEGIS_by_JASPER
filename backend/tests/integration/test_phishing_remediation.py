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
            "id": "asset-dom-1",
            "asset_type": "official_domain",
            "platform": "web",
            "display_value": "acmefinance.com",
            "url": "https://acmefinance.com"
        }
    ]


def test_previously_missed_zero_day_phishing_url(brand_profile, registered_assets):
    """
    Regression test for previously missed unlisted phishing URL:
    acme-promo-event.firebaseapp.com/claim/wallet
    Previously scored 29.3 and was missed.
    Now must be flagged at an appropriately cautious review level (suspicious_needs_review)
    with score >= 50.0.
    """
    candidate = {
        "candidate_type": "phishing_url",
        "platform": "phishing",
        "display_name": "Acme Promo Event Wallet Claim",
        "username_or_package": "acme-promo-event.firebaseapp.com",
        "description": "Unlisted promotional page soliciting wallet connect",
        "external_url": "https://acme-promo-event.firebaseapp.com/claim/wallet",
        "logo_reference": None,
        "metadata_json": {
            "hostname": "acme-promo-event.firebaseapp.com",
            "url_path": "/claim/wallet",
            "feed_source": None,  # Zero-day, not in threat intel feed
            "has_credential_path": True
        }
    }

    res = evaluate_candidate(brand_profile, registered_assets, candidate)
    assert res.is_threat is True
    assert res.risk_score >= 55.0
    assert res.decision == "suspicious_needs_review"
    assert any("tenant subdomain" in r.lower() or "mimics brand" in r.lower() for r in res.detection_reasons)
    assert any("credential" in r.lower() or "wallet" in r.lower() for r in res.detection_reasons)


def test_benign_counterexamples_remain_unflagged(brand_profile, registered_assets):
    """
    Verifies that benign counterexamples remain unflagged:
    - Legitimate official login pages
    - Security research articles mentioning brand
    - Benign URLs containing 'login', 'verify', or 'wallet'
    - Benign tenant applications on shared hosting
    """
    counterexamples = [
        {
            "name": "Official Login Page",
            "url": "https://acmefinance.com/auth/login",
            "host": "acmefinance.com",
            "path": "/auth/login",
            "expected_decision": "confirmed_official_match",
            "max_score": 0.0
        },
        {
            "name": "Security Research Article",
            "url": "https://krebsonsecurity.com/2026/04/acme-finance-breach-analysis",
            "host": "krebsonsecurity.com",
            "path": "/2026/04/acme-finance-breach-analysis",
            "expected_decision": "insufficient_evidence",
            "max_score": 25.0
        },
        {
            "name": "Third-Party Benign Wallet URL",
            "url": "https://myetherwallet.com/wallet/create",
            "host": "myetherwallet.com",
            "path": "/wallet/create",
            "expected_decision": "insufficient_evidence",
            "max_score": 25.0
        },
        {
            "name": "Third-Party Benign Login URL",
            "url": "https://github.com/login",
            "host": "github.com",
            "path": "/login",
            "expected_decision": "insufficient_evidence",
            "max_score": 25.0
        },
        {
            "name": "Third-Party Benign Verify URL",
            "url": "https://stripe.com/docs/identity/verify",
            "host": "stripe.com",
            "path": "/docs/identity/verify",
            "expected_decision": "insufficient_evidence",
            "max_score": 25.0
        },
        {
            "name": "Benign Hosted Application on Shared Host",
            "url": "https://personal-portfolio.firebaseapp.com/about",
            "host": "personal-portfolio.firebaseapp.com",
            "path": "/about",
            "expected_decision": "insufficient_evidence",
            "max_score": 25.0
        }
    ]

    for ex in counterexamples:
        cand = {
            "candidate_type": "phishing_url",
            "platform": "phishing",
            "display_name": ex["name"],
            "username_or_package": ex["host"],
            "description": f"Counterexample {ex['name']}",
            "external_url": ex["url"],
            "logo_reference": None,
            "metadata_json": {
                "hostname": ex["host"],
                "url_path": ex["path"],
                "feed_source": None
            }
        }
        res = evaluate_candidate(brand_profile, registered_assets, cand)
        assert res.is_threat is False, f"{ex['name']} should NOT be a threat"
        assert res.decision == ex["expected_decision"]
        assert res.risk_score <= ex["max_score"]


def test_cached_threat_intel_provenance_labelling(brand_profile, registered_assets):
    """
    Cached threat-intelligence matches must be labelled as cached, with their
    observation/update time if available. Never described as a fresh feed result.
    """
    candidate = {
        "candidate_type": "phishing_url",
        "platform": "phishing",
        "display_name": "Cached Phishing Kit",
        "username_or_package": "acme-fake-portal.com",
        "description": "Known phishing kit from historic archive",
        "external_url": "https://acme-fake-portal.com/login",
        "logo_reference": None,
        "metadata_json": {
            "hostname": "acme-fake-portal.com",
            "url_path": "/login",
            "feed_source": "abuse_ch_urlhaus",
            "is_cached": True,
            "cached_at": "2026-10-10T14:30:00Z"
        }
    }
    res = evaluate_candidate(brand_profile, registered_assets, candidate)
    assert res.is_threat is True
    assert res.decision == "confirmed_phishing"
    assert any("cached" in r.lower() and "2026-10-10t14:30:00z" in r.lower() for r in res.detection_reasons)
    
    # Check signal breakdown dictionary
    intel_signals = [s for s in res.signal_breakdown if s["category"] == "threat_intel"]
    assert len(intel_signals) == 1
    assert "cached" in intel_signals[0]["observed_value"]
    assert "cached index: 2026-10-10T14:30:00Z" in intel_signals[0]["explanation"]
