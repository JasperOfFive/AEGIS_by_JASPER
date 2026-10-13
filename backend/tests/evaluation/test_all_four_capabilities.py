"""
AEGIS Comprehensive 4-Pipeline Threat Detection Quality Evaluation.
Evaluates Precision, Recall, True Positives, and False Positives across:
1. Lookalike Domains and Fake Websites
2. Phishing URLs and Fraudulent Pages
3. Social Media Impersonation and Scam Accounts
4. Malicious and Impersonating Mobile Applications
"""
import pytest
from app.detection.engine import evaluate_candidate


@pytest.fixture
def acme_brand_profile():
    return {
        "name": "Acme Finance",
        "description": "Global enterprise banking, fintech payment APIs, and consumer wealth management.",
        "primary_website": "https://acmefinance.com"
    }


@pytest.fixture
def acme_registered_assets():
    return [
        {
            "id": "asset-dom-1",
            "asset_type": "official_domain",
            "platform": "web",
            "display_value": "acmefinance.com",
            "url": "https://acmefinance.com"
        },
        {
            "id": "asset-social-1",
            "asset_type": "official_social_account",
            "platform": "instagram",
            "normalized_identifier": "acmefinance",
            "display_value": "@acmefinance",
            "url": "https://instagram.com/acmefinance"
        },
        {
            "id": "asset-social-2",
            "asset_type": "official_social_account",
            "platform": "github",
            "normalized_identifier": "acmefinance",
            "display_value": "acmefinance",
            "url": "https://github.com/acmefinance"
        },
        {
            "id": "asset-app-1",
            "asset_type": "official_mobile_app",
            "platform": "google_play",
            "normalized_identifier": "com.acme.finance.app",
            "display_value": "com.acme.finance.app",
            "url": "https://play.google.com/store/apps/details?id=com.acme.finance.app"
        },
        {
            "id": "asset-app-2",
            "asset_type": "official_mobile_app",
            "platform": "apple_app_store",
            "normalized_identifier": "com.acme.finance.ios",
            "display_value": "com.acme.finance.ios",
            "url": "https://apps.apple.com/app/id123456789"
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
            "image_reference": "acme_official_logo_v1"
        }
    ]


def test_pipeline_1_lookalike_domains(acme_brand_profile, acme_registered_assets):
    """
    Evaluates Capability 1: Lookalike Domains and Fake Brand Websites
    """
    test_cases = [
        # Positive 1: Active lookalike with live DNS and auth keywords
        {
            "candidate": {
                "candidate_type": "lookalike_domain",
                "platform": "domain",
                "display_name": "acmefinance-verify-login.online",
                "username_or_package": "acmefinance-verify-login.online",
                "description": "Combosquatting lookalike login portal.",
                "external_url": "https://acmefinance-verify-login.online",
                "logo_reference": None,
                "metadata_json": {
                    "technique": "combosquatting_suffix",
                    "is_resolved": True,
                    "resolved_ips": ["104.21.72.19"],
                    "dns_status": "active",
                    "has_mx": True,
                    "is_parked": False,
                    "http_title": "Acme Finance Online Login"
                }
            },
            "expected_threat": True,
            "min_score": 60.0
        },
        # Positive 2: Typosquatted domain with MX records and active site
        {
            "candidate": {
                "candidate_type": "lookalike_domain",
                "platform": "domain",
                "display_name": "acmefinaance.com",
                "username_or_package": "acmefinaance.com",
                "description": "Typo domain duplication with live mail records.",
                "external_url": "https://acmefinaance.com",
                "logo_reference": None,
                "metadata_json": {
                    "technique": "character_duplication",
                    "is_resolved": True,
                    "resolved_ips": ["198.51.100.1"],
                    "dns_status": "active",
                    "has_mx": True,
                    "is_parked": False,
                    "http_title": "Acme Finance Customer Help"
                }
            },
            "expected_threat": True,
            "min_score": 60.0
        },
        # Negative 1: Official brand domain -> MUST BE EXCLUDED (0 risk)
        {
            "candidate": {
                "candidate_type": "lookalike_domain",
                "platform": "domain",
                "display_name": "acmefinance.com",
                "username_or_package": "acmefinance.com",
                "description": "Official brand website.",
                "external_url": "https://acmefinance.com",
                "logo_reference": None,
                "metadata_json": {
                    "is_resolved": True,
                    "dns_status": "active"
                }
            },
            "expected_threat": False,
            "expected_decision": "confirmed_official_match"
        },
        # Negative 2: Official brand subdomain -> MUST BE EXCLUDED (0 risk)
        {
            "candidate": {
                "candidate_type": "lookalike_domain",
                "platform": "domain",
                "display_name": "portal.acmefinance.com",
                "username_or_package": "portal.acmefinance.com",
                "description": "Official brand enterprise portal.",
                "external_url": "https://portal.acmefinance.com",
                "logo_reference": None,
                "metadata_json": {
                    "is_resolved": True,
                    "dns_status": "active"
                }
            },
            "expected_threat": False,
            "expected_decision": "confirmed_official_match"
        },
        # Negative 3: Unregistered hypothetical candidate (NXDOMAIN) -> MUST NOT BE THREAT
        {
            "candidate": {
                "candidate_type": "lookalike_domain",
                "platform": "domain",
                "display_name": "acmefinacen-portal.net",
                "username_or_package": "acmefinacen-portal.net",
                "description": "Hypothetical permutation with no active DNS.",
                "external_url": "http://acmefinacen-portal.net",
                "logo_reference": None,
                "metadata_json": {
                    "technique": "character_transposition",
                    "is_resolved": False,
                    "dns_status": "nxdomain"
                }
            },
            "expected_threat": False,
            "expected_decision": "unregistered_candidate"
        },
        # Negative 4: Parked domain -> MUST NOT BE CONFIRMED THREAT
        {
            "candidate": {
                "candidate_type": "lookalike_domain",
                "platform": "domain",
                "display_name": "acmfinance.com",
                "username_or_package": "acmfinance.com",
                "description": "Domain for sale holding page.",
                "external_url": "http://acmfinance.com",
                "logo_reference": None,
                "metadata_json": {
                    "technique": "character_omission",
                    "is_resolved": True,
                    "dns_status": "active",
                    "is_parked": True,
                    "http_title": "Buy this domain - Sedo Parking"
                }
            },
            "expected_threat": False,
            "max_score": 35.0
        }
    ]

    tp, fp, tn, fn = 0, 0, 0, 0
    for tc in test_cases:
        res = evaluate_candidate(acme_brand_profile, acme_registered_assets, tc["candidate"])
        if tc["expected_threat"]:
            if res.is_threat:
                tp += 1
                assert res.risk_score >= tc.get("min_score", 40.0)
            else:
                fn += 1
        else:
            if not res.is_threat:
                tn += 1
                if "expected_decision" in tc:
                    assert res.decision == tc["expected_decision"]
                if "max_score" in tc:
                    assert res.risk_score <= tc["max_score"]
            else:
                fp += 1

    assert tp == 2
    assert tn == 4
    assert fp == 0
    assert fn == 0


def test_pipeline_2_phishing_urls(acme_brand_profile, acme_registered_assets):
    """
    Evaluates Capability 2: Phishing URLs and Fraudulent Websites
    """
    test_cases = [
        # Positive 1: URLhaus confirmed threat feed match with login path
        {
            "candidate": {
                "candidate_type": "phishing_url",
                "platform": "phishing",
                "display_name": "Acme Finance Phishing Kit",
                "username_or_package": "acme-finance-verify-login.pages.dev",
                "description": "Active credential harvester on pages.dev.",
                "external_url": "https://acme-finance-verify-login.pages.dev/auth/login",
                "logo_reference": "acme_official_logo_v1",
                "metadata_json": {
                    "feed_source": "abuse_ch_urlhaus",
                    "threat_type": "phishing_credential_harvester",
                    "has_credential_path": True,
                    "hostname": "acme-finance-verify-login.pages.dev",
                    "url_path": "/auth/login"
                }
            },
            "expected_threat": True,
            "min_score": 70.0,
            "expected_decision": "confirmed_phishing"
        },
        # Positive 2: OpenPhish seed phrase wallet drainer
        {
            "candidate": {
                "candidate_type": "phishing_url",
                "platform": "phishing",
                "display_name": "Acme Finance Wallet Drainer",
                "username_or_package": "secure-acmefinance-claim.com",
                "description": "Solliciting wallet seed phrases.",
                "external_url": "https://secure-acmefinance-claim.com/wallet-recovery",
                "logo_reference": "acme_official_logo_v1",
                "metadata_json": {
                    "feed_source": "openphish_community",
                    "threat_type": "phishing_wallet_drainer",
                    "has_credential_path": True,
                    "hostname": "secure-acmefinance-claim.com",
                    "url_path": "/wallet-recovery"
                }
            },
            "expected_threat": True,
            "min_score": 70.0,
            "expected_decision": "confirmed_phishing"
        },
        # Negative 1: Official Brand Login URL -> MUST BE EXCLUDED (0 risk)
        {
            "candidate": {
                "candidate_type": "phishing_url",
                "platform": "phishing",
                "display_name": "Official Acme Banking Login",
                "username_or_package": "acmefinance.com",
                "description": "Official customer authentication endpoint.",
                "external_url": "https://acmefinance.com/auth/login",
                "logo_reference": None,
                "metadata_json": {
                    "hostname": "acmefinance.com",
                    "url_path": "/auth/login"
                }
            },
            "expected_threat": False,
            "expected_decision": "confirmed_official_match"
        },
        # Negative 2: Benign external search query containing brand keyword
        {
            "candidate": {
                "candidate_type": "phishing_url",
                "platform": "phishing",
                "display_name": "Financial News Article",
                "username_or_package": "reputable-news.com",
                "description": "News article discussing Acme Finance market expansion.",
                "external_url": "https://reputable-news.com/markets/2026/acme-finance-earnings",
                "logo_reference": None,
                "metadata_json": {
                    "hostname": "reputable-news.com",
                    "url_path": "/markets/2026/acme-finance-earnings"
                }
            },
            "expected_threat": False,
            "max_score": 25.0
        }
    ]

    tp, fp, tn, fn = 0, 0, 0, 0
    for tc in test_cases:
        res = evaluate_candidate(acme_brand_profile, acme_registered_assets, tc["candidate"])
        if tc["expected_threat"]:
            if res.is_threat:
                tp += 1
                assert res.risk_score >= tc.get("min_score", 50.0)
                if "expected_decision" in tc:
                    assert res.decision == tc["expected_decision"]
            else:
                fn += 1
        else:
            if not res.is_threat:
                tn += 1
                if "expected_decision" in tc:
                    assert res.decision == tc["expected_decision"]
                if "max_score" in tc:
                    assert res.risk_score <= tc["max_score"]
            else:
                fp += 1

    assert tp == 2
    assert tn == 2
    assert fp == 0
    assert fn == 0


def test_pipeline_3_social_media_scam_accounts(acme_brand_profile, acme_registered_assets):
    """
    Evaluates Capability 3: Social Media Impersonation and Scam Accounts
    """
    test_cases = [
        # Positive 1: Fake customer support desk soliciting DMs
        {
            "candidate": {
                "candidate_type": "social_profile",
                "platform": "github",
                "display_name": "Acme Finance Support Desk",
                "username_or_package": "acme-finance-support",
                "description": "Official 24/7 customer support. Send direct message or whatsapp us for account recovery.",
                "external_url": "https://github.com/acme-finance-support",
                "logo_reference": "acme_official_logo_v1",
                "metadata_json": {
                    "follower_count": 12,
                    "claimed_verified": True
                }
            },
            "expected_threat": True,
            "min_score": 70.0
        },
        # Positive 2: Fraudulent giveaway / airdrop claims account soliciting seed phrases
        {
            "candidate": {
                "candidate_type": "social_profile",
                "platform": "reddit",
                "display_name": "Acme Finance Reward Claims",
                "username_or_package": "acmefinance_claims",
                "description": "Free airdrop bonus! Claim reward now. Never share your seed phrase except on official portal.",
                "external_url": "https://reddit.com/user/acmefinance_claims",
                "logo_reference": None,
                "metadata_json": {
                    "follower_count": 5,
                    "claimed_verified": False
                }
            },
            "expected_threat": True,
            "min_score": 60.0
        },
        # Negative 1: Official verified social handle -> MUST BE EXCLUDED (0 risk)
        {
            "candidate": {
                "candidate_type": "social_profile",
                "platform": "instagram",
                "display_name": "Acme Finance Official",
                "username_or_package": "acmefinance",
                "description": "Official enterprise banking profile.",
                "external_url": "https://instagram.com/acmefinance",
                "logo_reference": "acme_official_logo_v1",
                "metadata_json": {
                    "follower_count": 500000,
                    "claimed_verified": True
                }
            },
            "expected_threat": False,
            "expected_decision": "confirmed_official_match"
        },
        # Negative 2: Legitimate unrelated business using dictionary word
        {
            "candidate": {
                "candidate_type": "social_profile",
                "platform": "github",
                "display_name": "Acme Anvils Open Source",
                "username_or_package": "acmeanvils",
                "description": "Heavy industrial manufacturing forge and metal tools.",
                "external_url": "https://github.com/acmeanvils",
                "logo_reference": None,
                "metadata_json": {
                    "follower_count": 250,
                    "claimed_verified": False
                }
            },
            "expected_threat": False,
            "max_score": 35.0
        }
    ]

    tp, fp, tn, fn = 0, 0, 0, 0
    for tc in test_cases:
        res = evaluate_candidate(acme_brand_profile, acme_registered_assets, tc["candidate"])
        if tc["expected_threat"]:
            if res.is_threat:
                tp += 1
                assert res.risk_score >= tc.get("min_score", 50.0)
            else:
                fn += 1
        else:
            if not res.is_threat:
                tn += 1
                if "expected_decision" in tc:
                    assert res.decision == tc["expected_decision"]
                if "max_score" in tc:
                    assert res.risk_score <= tc["max_score"]
            else:
                fp += 1

    assert tp == 2
    assert tn == 2
    assert fp == 0
    assert fn == 0


def test_pipeline_4_mobile_applications(acme_brand_profile, acme_registered_assets):
    """
    Evaluates Capability 4: Malicious or Impersonating Mobile Applications
    """
    test_cases = [
        # Positive 1: Unauthorized fast loan app with package mimicry and publisher mismatch
        {
            "candidate": {
                "candidate_type": "mobile_app",
                "platform": "google_play",
                "display_name": "Acme QuickLoan Mobile Bank",
                "username_or_package": "com.acme.quickloan.fastpay",
                "publisher_or_developer": "Digital FinTech Softworks",
                "description": "High-interest quick personal loans and instant cash advances.",
                "external_url": "https://play.google.com/store/apps/details?id=com.acme.quickloan.fastpay",
                "logo_reference": "acme_official_logo_v1",
                "metadata_json": {
                    "downloads": 100,
                    "rating": 2.1,
                    "suspicious_permissions": True
                }
            },
            "expected_threat": True,
            "min_score": 60.0
        },
        # Positive 2: Cloned mobile wallet imitating brand title
        {
            "candidate": {
                "candidate_type": "mobile_app",
                "platform": "apple_app_store",
                "display_name": "Acme Finance Mobile Wallet",
                "username_or_package": "com.acmefinance.ios.unauthorized",
                "publisher_or_developer": "Apex Wealth Apps LTD",
                "description": "Digital portfolio tracker posing as Acme Financial subsidiary.",
                "external_url": "https://apps.apple.com/app/id984129412",
                "logo_reference": "acme_official_logo_v1",
                "metadata_json": {
                    "downloads": 50,
                    "rating": 1.8
                }
            },
            "expected_threat": True,
            "min_score": 60.0
        },
        # Negative 1: Official registered mobile application -> MUST BE EXCLUDED (0 risk)
        {
            "candidate": {
                "candidate_type": "mobile_app",
                "platform": "google_play",
                "display_name": "Acme Finance Official App",
                "username_or_package": "com.acme.finance.app",
                "publisher_or_developer": "Acme Financial Group LLC",
                "description": "Official online banking mobile application.",
                "external_url": "https://play.google.com/store/apps/details?id=com.acme.finance.app",
                "logo_reference": "acme_official_logo_v1",
                "metadata_json": {
                    "downloads": 1000000,
                    "rating": 4.8
                }
            },
            "expected_threat": False,
            "expected_decision": "confirmed_official_match"
        },
        # Negative 2: Legitimate enterprise tool by unrelated publisher
        {
            "candidate": {
                "candidate_type": "mobile_app",
                "platform": "google_play",
                "display_name": "Acme FieldDesk Portal",
                "username_or_package": "com.acme.fieldDeskApp",
                "publisher_or_developer": "Field Technologies",
                "description": "Enterprise field technician dispatch and equipment tracking.",
                "external_url": "https://play.google.com/store/apps/details?id=com.acme.fieldDeskApp",
                "logo_reference": None,
                "metadata_json": {
                    "downloads": 25000,
                    "rating": 4.2
                }
            },
            "expected_threat": False,
            "max_score": 40.0
        }
    ]

    tp, fp, tn, fn = 0, 0, 0, 0
    for tc in test_cases:
        res = evaluate_candidate(acme_brand_profile, acme_registered_assets, tc["candidate"])
        if tc["expected_threat"]:
            if res.is_threat:
                tp += 1
                assert res.risk_score >= tc.get("min_score", 50.0)
            else:
                fn += 1
        else:
            if not res.is_threat:
                tn += 1
                if "expected_decision" in tc:
                    assert res.decision == tc["expected_decision"]
                if "max_score" in tc:
                    assert res.risk_score <= tc["max_score"]
            else:
                fp += 1

    assert tp == 2
    assert tn == 2
    assert fp == 0
    assert fn == 0
