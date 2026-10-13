"""
AEGIS Comprehensive 100-Case Evaluation Corpus.
Evaluates 25 labelled test cases per capability across:
1. Lookalike Domains and Fake Brand Websites (25 cases)
2. Phishing URLs and Fraudulent Websites (25 cases)
3. Social Media Impersonation and Scam Accounts (25 cases)
4. Malicious or Impersonating Mobile Applications (25 cases)
"""
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
        },
        {
            "id": "asset-dom-2",
            "asset_type": "official_domain",
            "platform": "web",
            "display_value": "portal.acmefinance.com",
            "url": "https://portal.acmefinance.com"
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
            "id": "asset-social-3",
            "asset_type": "official_social_account",
            "platform": "twitter",
            "normalized_identifier": "acmefinance",
            "display_value": "@acmefinance",
            "url": "https://twitter.com/acmefinance"
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


# -------------------------------------------------------------
# 1. LOOKALIKE DOMAINS (25 CASES)
# -------------------------------------------------------------
def get_domain_cases():
    return [
        # POSITIVES (10 cases)
        {"id": "d_pos_1", "name": "acmefinance-verify-login.online", "tech": "combosquatting_suffix", "resolved": True, "mx": True, "parked": False, "exp_threat": True, "min_score": 50.0},
        {"id": "d_pos_2", "name": "acmefinaance.com", "tech": "character_duplication", "resolved": True, "mx": True, "parked": False, "exp_threat": True, "min_score": 50.0},
        {"id": "d_pos_3", "name": "auth-acmefinance.xyz", "tech": "combosquatting_prefix", "resolved": True, "mx": True, "parked": False, "exp_threat": True, "min_score": 50.0},
        {"id": "d_pos_4", "name": "acmefinace.com", "tech": "character_omission", "resolved": True, "mx": False, "parked": False, "exp_threat": True, "min_score": 40.0},
        {"id": "d_pos_5", "name": "portal-acmefinance.net", "tech": "combosquatting_prefix", "resolved": True, "mx": True, "parked": False, "exp_threat": True, "min_score": 50.0},
        {"id": "d_pos_6", "name": "acmefinanc-support.top", "tech": "combosquatting_suffix", "resolved": True, "mx": True, "parked": False, "exp_threat": True, "min_score": 50.0},
        {"id": "d_pos_7", "name": "acmefinance-claims.app", "tech": "combosquatting_suffix", "resolved": True, "mx": True, "parked": False, "exp_threat": True, "min_score": 50.0},
        {"id": "d_pos_8", "name": "acmefinance-secure-pay.live", "tech": "combosquatting_suffix", "resolved": True, "mx": True, "parked": False, "exp_threat": True, "min_score": 50.0},
        {"id": "d_pos_9", "name": "acmefinnance.com", "tech": "character_duplication", "resolved": True, "mx": True, "parked": False, "exp_threat": True, "min_score": 50.0},
        {"id": "d_pos_10", "name": "login-acmefinance-portal.com", "tech": "combosquatting_affix", "resolved": True, "mx": True, "parked": False, "exp_threat": True, "min_score": 50.0},

        # NEGATIVES (15 cases)
        {"id": "d_neg_1", "name": "acmefinance.com", "tech": "exact_official", "resolved": True, "mx": True, "parked": False, "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "d_neg_2", "name": "portal.acmefinance.com", "tech": "official_subdomain", "resolved": True, "mx": True, "parked": False, "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "d_neg_3", "name": "api.acmefinance.com", "tech": "official_subdomain", "resolved": True, "mx": False, "parked": False, "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "d_neg_4", "name": "acmefinacen-portal.net", "tech": "nxdomain_candidate", "resolved": False, "mx": False, "parked": False, "exp_threat": False, "exp_decision": "unregistered_candidate", "max_score": 20.0},
        {"id": "d_neg_5", "name": "acmfinance-typo.org", "tech": "nxdomain_candidate", "resolved": False, "mx": False, "parked": False, "exp_threat": False, "exp_decision": "unregistered_candidate", "max_score": 20.0},
        {"id": "d_neg_6", "name": "acmefinance-holding.biz", "tech": "nxdomain_candidate", "resolved": False, "mx": False, "parked": False, "exp_threat": False, "exp_decision": "unregistered_candidate", "max_score": 20.0},
        {"id": "d_neg_7", "name": "acmfinance.com", "tech": "parked_holding", "resolved": True, "mx": False, "parked": True, "title": "Buy this domain - Sedo", "exp_threat": False, "max_score": 35.0},
        {"id": "d_neg_8", "name": "acmefinancelog.com", "tech": "parked_holding", "resolved": True, "mx": False, "parked": True, "title": "Domain Parked with GoDaddy", "exp_threat": False, "max_score": 35.0},
        {"id": "d_neg_9", "name": "acmetools.com", "tech": "unrelated_hardware", "resolved": True, "mx": True, "parked": False, "title": "Acme Tools Construction Hardware", "exp_threat": False, "max_score": 35.0},
        {"id": "d_neg_10", "name": "acmepacking.com", "tech": "unrelated_manufacturing", "resolved": True, "mx": True, "parked": False, "title": "Acme Packing Box Supply", "exp_threat": False, "max_score": 35.0},
        {"id": "d_neg_11", "name": "acmeanvils.com", "tech": "unrelated_heavy_industry", "resolved": True, "mx": True, "parked": False, "title": "Acme Anvils Metal Forge", "exp_threat": False, "max_score": 35.0},
        {"id": "d_neg_12", "name": "acmebrick.com", "tech": "unrelated_masonry", "resolved": True, "mx": True, "parked": False, "title": "Acme Brick Masonry Company", "exp_threat": False, "max_score": 35.0},
        {"id": "d_neg_13", "name": "finance-daily-news.com", "tech": "unrelated_news", "resolved": True, "mx": True, "parked": False, "title": "Global Financial Markets Daily", "exp_threat": False, "max_score": 35.0},
        {"id": "d_neg_14", "name": "enterprise-fintech-hub.org", "tech": "unrelated_industry_blog", "resolved": True, "mx": False, "parked": False, "title": "FinTech Hub Insights", "exp_threat": False, "max_score": 30.0},
        {"id": "d_neg_15", "name": "acmefinancecorp-nx.info", "tech": "nxdomain_candidate", "resolved": False, "mx": False, "parked": False, "exp_threat": False, "exp_decision": "unregistered_candidate", "max_score": 20.0}
    ]


def test_25_lookalike_domain_cases(brand_profile, registered_assets):
    cases = get_domain_cases()
    assert len(cases) == 25
    tp, fp, tn, fn = 0, 0, 0, 0

    for c in cases:
        cand = {
            "candidate_type": "lookalike_domain",
            "platform": "domain",
            "display_name": c["name"],
            "username_or_package": c["name"],
            "description": f"Domain candidate: {c['tech']}",
            "external_url": f"https://{c['name']}",
            "logo_reference": None,
            "metadata_json": {
                "technique": c["tech"],
                "is_resolved": c["resolved"],
                "resolved_ips": ["104.21.72.19"] if c["resolved"] else [],
                "dns_status": "active" if c["resolved"] else "nxdomain",
                "has_mx": c.get("mx", False),
                "is_parked": c.get("parked", False),
                "http_title": c.get("title", "")
            }
        }
        res = evaluate_candidate(brand_profile, registered_assets, cand)
        if c["exp_threat"]:
            if res.is_threat:
                tp += 1
                assert res.risk_score >= c.get("min_score", 40.0), f"{c['id']} score {res.risk_score} < min"
            else:
                fn += 1
        else:
            if not res.is_threat:
                tn += 1
                if "exp_decision" in c:
                    assert res.decision == c["exp_decision"], f"{c['id']} got {res.decision}"
                if "max_score" in c:
                    assert res.risk_score <= c["max_score"], f"{c['id']} score {res.risk_score} > max"
            else:
                fp += 1

    assert tp == 10
    assert tn == 15
    assert fp == 0
    assert fn == 0


# -------------------------------------------------------------
# 2. PHISHING URLS (25 CASES)
# -------------------------------------------------------------
def get_phishing_cases():
    return [
        # POSITIVES (10 cases)
        {"id": "p_pos_1", "url": "https://acme-finance-verify-login.pages.dev/auth/login", "host": "acme-finance-verify-login.pages.dev", "path": "/auth/login", "feed": "abuse_ch_urlhaus", "exp_threat": True, "min_score": 50.0},
        {"id": "p_pos_2", "url": "https://secure-acmefinance-claim.com/wallet-recovery", "host": "secure-acmefinance-claim.com", "path": "/wallet-recovery", "feed": "openphish_community", "exp_threat": True, "min_score": 50.0},
        {"id": "p_pos_3", "url": "https://acme-bank-support-login.net/banking/auth", "host": "acme-bank-support-login.net", "path": "/banking/auth", "feed": "threat_intel_osint", "exp_threat": True, "min_score": 50.0},
        {"id": "p_pos_4", "url": "https://portal-acmefinance-signin.xyz/login.php", "host": "portal-acmefinance-signin.xyz", "path": "/login.php", "feed": "abuse_ch_urlhaus", "exp_threat": True, "min_score": 50.0},
        {"id": "p_pos_5", "url": "https://acmefinance-verify.online/account/verify", "host": "acmefinance-verify.online", "path": "/account/verify", "feed": "openphish_community", "exp_threat": True, "min_score": 50.0},
        {"id": "p_pos_6", "url": "https://acme-finance-claims-airdrop.top/seed-claim", "host": "acme-finance-claims-airdrop.top", "path": "/seed-claim", "feed": "threat_intel_osint", "exp_threat": True, "min_score": 50.0},
        {"id": "p_pos_7", "url": "https://auth-acmefinance-portal.site/signin", "host": "auth-acmefinance-portal.site", "path": "/signin", "feed": "abuse_ch_urlhaus", "exp_threat": True, "min_score": 50.0},
        {"id": "p_pos_8", "url": "https://acmefinance-security-check.live/update/password", "host": "acmefinance-security-check.live", "path": "/update/password", "feed": "abuse_ch_urlhaus", "exp_threat": True, "min_score": 50.0},
        {"id": "p_pos_9", "url": "https://login-acmefinance-ebanking.com/auth", "host": "login-acmefinance-ebanking.com", "path": "/auth", "feed": "openphish_community", "exp_threat": True, "min_score": 50.0},
        {"id": "p_pos_10", "url": "https://acmefinance-direct-wire.online/payment/confirm", "host": "acmefinance-direct-wire.online", "path": "/payment/confirm", "feed": "threat_intel_osint", "exp_threat": True, "min_score": 50.0},

        # NEGATIVES (15 cases)
        {"id": "p_neg_1", "url": "https://acmefinance.com/auth/login", "host": "acmefinance.com", "path": "/auth/login", "feed": None, "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "p_neg_2", "url": "https://portal.acmefinance.com/signin", "host": "portal.acmefinance.com", "path": "/signin", "feed": None, "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "p_neg_3", "url": "https://acmefinance.com/careers/apply", "host": "acmefinance.com", "path": "/careers/apply", "feed": None, "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "p_neg_4", "url": "https://reputable-news.com/markets/2026/acme-finance-earnings", "host": "reputable-news.com", "path": "/markets/2026/acme-finance-earnings", "feed": None, "exp_threat": False, "max_score": 25.0},
        {"id": "p_neg_5", "url": "https://techcrunch.com/article/acme-finance-api-launch", "host": "techcrunch.com", "path": "/article/acme-finance-api-launch", "feed": None, "exp_threat": False, "max_score": 25.0},
        {"id": "p_neg_6", "url": "https://bloomberg.com/news/articles/2026-10-10/acme-finance-q3", "host": "bloomberg.com", "path": "/news/articles/2026-10-10/acme-finance-q3", "feed": None, "exp_threat": False, "max_score": 25.0},
        {"id": "p_neg_7", "url": "https://google.com/search?q=acme+finance+login+portal", "host": "google.com", "path": "/search", "feed": None, "exp_threat": False, "max_score": 25.0},
        {"id": "p_neg_8", "url": "https://bing.com/search?q=acme+finance+stock+quote", "host": "bing.com", "path": "/search", "feed": None, "exp_threat": False, "max_score": 25.0},
        {"id": "p_neg_9", "url": "https://wikipedia.org/wiki/Acme_Corporation", "host": "wikipedia.org", "path": "/wiki/Acme_Corporation", "feed": None, "exp_threat": False, "max_score": 25.0},
        {"id": "p_neg_10", "url": "https://developer.mozilla.org/en-US/docs/Web/API", "host": "developer.mozilla.org", "path": "/en-US/docs/Web/API", "feed": None, "exp_threat": False, "max_score": 20.0},
        {"id": "p_neg_11", "url": "https://fintechweekly.com/articles/top-banking-apis", "host": "fintechweekly.com", "path": "/articles/top-banking-apis", "feed": None, "exp_threat": False, "max_score": 20.0},
        {"id": "p_neg_12", "url": "https://investor-relations-hub.com/acme/press-release", "host": "investor-relations-hub.com", "path": "/acme/press-release", "feed": None, "exp_threat": False, "max_score": 25.0},
        {"id": "p_neg_13", "url": "https://acmefinance.com/terms-and-conditions", "host": "acmefinance.com", "path": "/terms-and-conditions", "feed": None, "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "p_neg_14", "url": "https://acmefinance.com/privacy-policy", "host": "acmefinance.com", "path": "/privacy-policy", "feed": None, "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "p_neg_15", "url": "https://github.com/topics/fintech-banking", "host": "github.com", "path": "/topics/fintech-banking", "feed": None, "exp_threat": False, "max_score": 20.0}
    ]


def test_25_phishing_url_cases(brand_profile, registered_assets):
    cases = get_phishing_cases()
    assert len(cases) == 25
    tp, fp, tn, fn = 0, 0, 0, 0

    for c in cases:
        cand = {
            "candidate_type": "phishing_url",
            "platform": "phishing",
            "display_name": f"Candidate {c['id']}",
            "username_or_package": c["host"],
            "description": f"URL candidate test case {c['id']}",
            "external_url": c["url"],
            "logo_reference": "acme_official_logo_v1" if c["exp_threat"] else None,
            "metadata_json": {
                "feed_source": c["feed"],
                "threat_type": "phishing_credential_harvester" if c["exp_threat"] else "benign_web",
                "has_credential_path": True if c.get("path") in ["/auth/login", "/wallet-recovery", "/banking/auth", "/login.php", "/account/verify", "/seed-claim", "/signin", "/update/password", "/auth", "/payment/confirm"] else False,
                "hostname": c["host"],
                "url_path": c["path"]
            }
        }
        res = evaluate_candidate(brand_profile, registered_assets, cand)
        if c["exp_threat"]:
            if res.is_threat:
                tp += 1
                assert res.risk_score >= c.get("min_score", 50.0), f"{c['id']} score {res.risk_score} < min"
            else:
                fn += 1
        else:
            if not res.is_threat:
                tn += 1
                if "exp_decision" in c:
                    assert res.decision == c["exp_decision"], f"{c['id']} got {res.decision}"
                if "max_score" in c:
                    assert res.risk_score <= c["max_score"], f"{c['id']} score {res.risk_score} > max"
            else:
                fp += 1

    assert tp == 10
    assert tn == 15
    assert fp == 0
    assert fn == 0


# -------------------------------------------------------------
# 3. SOCIAL MEDIA SCAM ACCOUNTS (25 CASES)
# -------------------------------------------------------------
def get_social_cases():
    return [
        # POSITIVES (10 cases)
        {"id": "s_pos_1", "platform": "github", "handle": "acme-finance-support", "name": "Acme Finance Support Desk", "desc": "Official 24/7 customer support. Send direct message or whatsapp us for account recovery.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 50.0},
        {"id": "s_pos_2", "platform": "reddit", "handle": "acmefinance_claims", "name": "Acme Finance Reward Claims", "desc": "Free airdrop bonus! Claim reward now. Send your seed phrase to support agent.", "logo": None, "exp_threat": True, "min_score": 50.0},
        {"id": "s_pos_3", "platform": "twitter", "handle": "acme_finance_help", "name": "Acme Finance Helpdesk Live", "desc": "Urgent suspension alert! Verify your account immediately by messaging support.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 50.0},
        {"id": "s_pos_4", "platform": "instagram", "handle": "acmefinance_giveaways", "name": "Acme Finance Official Giveaway", "desc": "Exclusive $5,000 crypto bonus giveaway for Acme clients! DM to claim.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 50.0},
        {"id": "s_pos_5", "platform": "github", "handle": "acmefinance-recovery", "name": "Acme Finance Security Team", "desc": "Lost access? Direct message our emergency telegram recovery agent.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 50.0},
        {"id": "s_pos_6", "platform": "twitter", "handle": "acme_loan_agent", "name": "Acme Fast Loans Official", "desc": "Instant personal loans with zero credit check. Fast cash disbursement via telegram.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 40.0},
        {"id": "s_pos_7", "platform": "reddit", "handle": "acmefinance_airdrop", "name": "Acme Finance Airdrop Portal", "desc": "Claim free tokens today. Never share password except with our official bot.", "logo": None, "exp_threat": True, "min_score": 40.0},
        {"id": "s_pos_8", "platform": "instagram", "handle": "acme_finance_verification", "name": "Acme Finance Compliance", "desc": "Account locked due to compliance review. WhatsApp our manager to verify.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 50.0},
        {"id": "s_pos_9", "platform": "github", "handle": "acmefinance-bot-support", "name": "Acme Customer Service Bot", "desc": "Automated recovery bot. Provide private keys or seed phrase to reset 2FA.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 50.0},
        {"id": "s_pos_10", "platform": "twitter", "handle": "acmefinance_vip_club", "name": "Acme Finance High Yield Club", "desc": "Guaranteed 25% weekly returns with Acme Finance wealth managers. Send BTC to join.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 50.0},

        # NEGATIVES (15 cases)
        {"id": "s_neg_1", "platform": "instagram", "handle": "acmefinance", "name": "Acme Finance Official", "desc": "Official enterprise banking profile.", "logo": "acme_official_logo_v1", "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "s_neg_2", "platform": "github", "handle": "acmefinance", "name": "Acme Finance Engineering", "desc": "Official developer repositories.", "logo": "acme_official_logo_v1", "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "s_neg_3", "platform": "twitter", "handle": "acmefinance", "name": "Acme Finance Verified", "desc": "Official enterprise banking handle.", "logo": "acme_official_logo_v1", "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "s_neg_4", "platform": "github", "handle": "acmeanvils", "name": "Acme Anvils Open Source", "desc": "Heavy industrial manufacturing forge and metal tools.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "s_neg_5", "platform": "github", "handle": "acmetoolco", "name": "Acme Tool Company", "desc": "Power tools, drill presses, and construction equipment.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "s_neg_6", "platform": "twitter", "handle": "acme_brick_masonry", "name": "Acme Brick Company", "desc": "Building commercial brick facades since 1891.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "s_neg_7", "platform": "reddit", "handle": "acme_fintech_fan", "name": "Fintech Enthusiast", "desc": "Community fan discussing Acme Finance and other modern banking APIs.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "s_neg_8", "platform": "github", "handle": "acmeproductions", "name": "Acme Movie Productions", "desc": "Independent filmmaking studio in Los Angeles.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "s_neg_9", "platform": "instagram", "handle": "acmepizza", "name": "Acme Woodfire Pizza", "desc": "Best artisan sourdough pizza in Brooklyn.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "s_neg_10", "platform": "twitter", "handle": "global_finance_daily", "name": "Global Finance Daily", "desc": "Macroeconomic updates and banking sector news.", "logo": None, "exp_threat": False, "max_score": 30.0},
        {"id": "s_neg_11", "platform": "github", "handle": "financial-nlp-toolkit", "name": "FinNLP Labs", "desc": "Open source natural language processing for financial sentiment.", "logo": None, "exp_threat": False, "max_score": 30.0},
        {"id": "s_neg_12", "platform": "reddit", "handle": "banking_tech_news", "name": "FinTech Weekly Mod", "desc": "Moderator of r/bankingtechnology.", "logo": None, "exp_threat": False, "max_score": 30.0},
        {"id": "s_neg_13", "platform": "github", "handle": "acmepackaging-dev", "name": "Acme Packaging", "desc": "Warehouse inventory management scripts.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "s_neg_14", "platform": "twitter", "handle": "acme_consulting_group", "name": "Acme HR Consulting", "desc": "Corporate talent acquisition and benefits advisory.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "s_neg_15", "platform": "instagram", "handle": "acmeflowers", "name": "Acme Botanical Florist", "desc": "Fresh wedding flowers and event decor.", "logo": None, "exp_threat": False, "max_score": 35.0}
    ]


def test_25_social_media_cases(brand_profile, registered_assets):
    cases = get_social_cases()
    assert len(cases) == 25
    tp, fp, tn, fn = 0, 0, 0, 0

    for c in cases:
        cand = {
            "candidate_type": "social_profile",
            "platform": c["platform"],
            "display_name": c["name"],
            "username_or_package": c["handle"],
            "description": c["desc"],
            "external_url": f"https://{c['platform']}.com/{c['handle']}",
            "logo_reference": c["logo"],
            "metadata_json": {
                "follower_count": 100000 if c.get("exp_decision") == "confirmed_official_match" else 15,
                "claimed_verified": c.get("exp_decision") == "confirmed_official_match"
            }
        }
        res = evaluate_candidate(brand_profile, registered_assets, cand)
        if c["exp_threat"]:
            if res.is_threat:
                tp += 1
                assert res.risk_score >= c.get("min_score", 40.0), f"{c['id']} score {res.risk_score} < min"
            else:
                fn += 1
        else:
            if not res.is_threat:
                tn += 1
                if "exp_decision" in c:
                    assert res.decision == c["exp_decision"], f"{c['id']} got {res.decision}"
                if "max_score" in c:
                    assert res.risk_score <= c["max_score"], f"{c['id']} score {res.risk_score} > max"
            else:
                fp += 1

    assert tp == 10
    assert tn == 15
    assert fp == 0
    assert fn == 0


# -------------------------------------------------------------
# 4. MOBILE APPLICATIONS (25 CASES)
# -------------------------------------------------------------
def get_mobile_cases():
    return [
        # POSITIVES (10 cases)
        {"id": "m_pos_1", "platform": "google_play", "pkg": "com.acme.quickloan.fastpay", "title": "Acme QuickLoan Mobile Bank", "pub": "Digital FinTech Softworks", "desc": "High-interest quick personal loans and instant cash advances.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},
        {"id": "m_pos_2", "platform": "apple_app_store", "pkg": "com.acmefinance.ios.unauthorized", "title": "Acme Finance Mobile Wallet", "pub": "Apex Wealth Apps LTD", "desc": "Digital portfolio tracker posing as Acme Financial subsidiary.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},
        {"id": "m_pos_3", "platform": "google_play", "pkg": "com.acmefinance.wallet.clone", "title": "Acme Finance Official Wallet", "pub": "Crypto Clone Factory", "desc": "Store Acme Finance reward tokens and digital assets.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},
        {"id": "m_pos_4", "platform": "google_play", "pkg": "com.acme.fastcredit.cash", "title": "Acme Finance Fast Credit", "pub": "PayDay Lending LLC", "desc": "Instant $1,000 cash advance for Acme bank account holders.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},
        {"id": "m_pos_5", "platform": "apple_app_store", "pkg": "com.acme.ebanking.fake", "title": "Acme Finance eBanking Portal", "pub": "Offshore Dev Group", "desc": "Mobile banking client for Acme Finance accounts.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},
        {"id": "m_pos_6", "platform": "google_play", "pkg": "com.acmefinance.crypto.claims", "title": "Acme Finance Crypto Claims", "pub": "Airdrop Claim Studio", "desc": "Claim Acme Finance anniversary airdrop bonus.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},
        {"id": "m_pos_7", "platform": "google_play", "pkg": "com.acme.banking.transfer", "title": "Acme Finance Wire Transfer", "pub": "Global Mobile Pay", "desc": "International money transfer service mimicking Acme Finance.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},
        {"id": "m_pos_8", "platform": "apple_app_store", "pkg": "com.acmefinance.wealth.tracker", "title": "Acme Wealth Management App", "pub": "Apex Fund Advisors", "desc": "Wealth advisory portal for Acme Finance premier customers.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},
        {"id": "m_pos_9", "platform": "google_play", "pkg": "com.acme.instantloan.pay", "title": "Acme Finance MicroLoans", "pub": "Instant Loan Studio", "desc": "Quick collateral-free loans for Acme account owners.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},
        {"id": "m_pos_10", "platform": "apple_app_store", "pkg": "com.acmefinance.card.manager", "title": "Acme Finance Card Manager", "pub": "Shady App Dev LLC", "desc": "Credit card management utility imitating Acme Finance.", "logo": "acme_official_logo_v1", "exp_threat": True, "min_score": 60.0},

        # NEGATIVES (15 cases)
        {"id": "m_neg_1", "platform": "google_play", "pkg": "com.acme.finance.app", "title": "Acme Finance Official App", "pub": "Acme Financial Group LLC", "desc": "Official online banking mobile application.", "logo": "acme_official_logo_v1", "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "m_neg_2", "platform": "apple_app_store", "pkg": "com.acme.finance.ios", "title": "Acme Finance iOS Client", "pub": "Acme Financial Group LLC", "desc": "Official iOS banking client.", "logo": "acme_official_logo_v1", "exp_threat": False, "exp_decision": "confirmed_official_match"},
        {"id": "m_neg_3", "platform": "google_play", "pkg": "com.acme.fieldDeskApp", "title": "Acme FieldDesk Portal", "pub": "Field Technologies", "desc": "Enterprise field technician dispatch and equipment tracking.", "logo": None, "exp_threat": False, "max_score": 40.0},
        {"id": "m_neg_4", "platform": "google_play", "pkg": "com.acme.warehouse.scanner", "title": "Acme Warehouse Scanner", "pub": "Logistics Systems Corp", "desc": "Barcode scanner for factory packaging lines.", "logo": None, "exp_threat": False, "max_score": 40.0},
        {"id": "m_neg_5", "platform": "apple_app_store", "pkg": "com.acmetools.hardware", "title": "Acme Tools Mobile Catalog", "pub": "Acme Tools Inc", "desc": "Browse power drills and construction machinery.", "logo": None, "exp_threat": False, "max_score": 40.0},
        {"id": "m_neg_6", "platform": "google_play", "pkg": "com.acme.dispatch.driver", "title": "Acme Dispatch Fleet", "pub": "Fleet Tracking Soft", "desc": "Driver navigation and freight delivery manifests.", "logo": None, "exp_threat": False, "max_score": 40.0},
        {"id": "m_neg_7", "platform": "google_play", "pkg": "com.acmepizza.ordering", "title": "Acme Pizza Express", "pub": "Restaurant App Group", "desc": "Order takeaway pizza and pasta online.", "logo": None, "exp_threat": False, "max_score": 40.0},
        {"id": "m_neg_8", "platform": "apple_app_store", "pkg": "com.finance.daily.calculator", "title": "Finance Calculator Pro", "pub": "Math Tools LLC", "desc": "Calculate compound interest and mortgage amortizations.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "m_neg_9", "platform": "google_play", "pkg": "com.personal.wealth.budget", "title": "Wealth Budget Tracker", "pub": "Budget Studio", "desc": "Track monthly grocery and utility expenses.", "logo": None, "exp_threat": False, "max_score": 35.0},
        {"id": "m_neg_10", "platform": "google_play", "pkg": "com.acme.brick.catalog", "title": "Acme Brick Color Selector", "pub": "Acme Brick Co", "desc": "Explore masonry patterns for home builders.", "logo": None, "exp_threat": False, "max_score": 40.0},
        {"id": "m_neg_11", "platform": "apple_app_store", "pkg": "com.acme.packaging.inventory", "title": "Acme Box Inventory", "pub": "Corrugated Systems", "desc": "Warehouse box dimension lookup.", "logo": None, "exp_threat": False, "max_score": 40.0},
        {"id": "m_neg_12", "platform": "google_play", "pkg": "com.acmeanvils.forge.guide", "title": "Blacksmith Anvil Guide", "pub": "Forge Craft Publishing", "desc": "Reference handbook for ironworking and metal casting.", "logo": None, "exp_threat": False, "max_score": 40.0},
        {"id": "m_neg_13", "platform": "apple_app_store", "pkg": "com.global.banking.news", "title": "Banking Sector Monitor", "pub": "Market News Media", "desc": "Daily headlines from international finance.", "logo": None, "exp_threat": False, "max_score": 30.0},
        {"id": "m_neg_14", "platform": "google_play", "pkg": "com.acme.games.runner", "title": "Acme Road Runner Dash", "pub": "Cartoon Arcade Games", "desc": "Classic desert running platformer game.", "logo": None, "exp_threat": False, "max_score": 40.0},
        {"id": "m_neg_15", "platform": "google_play", "pkg": "com.acme.cleaning.scheduler", "title": "Acme Commercial Cleaning", "pub": "Service Pro Systems", "desc": "Office janitorial appointment booking.", "logo": None, "exp_threat": False, "max_score": 40.0}
    ]


def test_25_mobile_app_cases(brand_profile, registered_assets):
    cases = get_mobile_cases()
    assert len(cases) == 25
    tp, fp, tn, fn = 0, 0, 0, 0

    for c in cases:
        cand = {
            "candidate_type": "mobile_app",
            "platform": c["platform"],
            "display_name": c["title"],
            "username_or_package": c["pkg"],
            "publisher_or_developer": c["pub"],
            "description": c["desc"],
            "external_url": f"https://store.example.com/app?id={c['pkg']}",
            "logo_reference": c["logo"],
            "metadata_json": {
                "downloads": 1000000 if c.get("exp_decision") == "confirmed_official_match" else 150,
                "rating": 4.8 if c.get("exp_decision") == "confirmed_official_match" else 2.1,
                "suspicious_permissions": True if c["exp_threat"] else False
            }
        }
        res = evaluate_candidate(brand_profile, registered_assets, cand)
        if c["exp_threat"]:
            if res.is_threat:
                tp += 1
                assert res.risk_score >= c.get("min_score", 40.0), f"{c['id']} score {res.risk_score} < min"
            else:
                fn += 1
        else:
            if not res.is_threat:
                tn += 1
                if "exp_decision" in c:
                    assert res.decision == c["exp_decision"], f"{c['id']} got {res.decision}"
                if "max_score" in c:
                    assert res.risk_score <= c["max_score"], f"{c['id']} score {res.risk_score} > max"
            else:
                fp += 1

    assert tp == 10
    assert tn == 15
    assert fp == 0
    assert fn == 0
