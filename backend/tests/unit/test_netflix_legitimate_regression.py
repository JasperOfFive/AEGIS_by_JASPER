import pytest
from app.detection.engine import evaluate_candidate
from app.detection.official_exclusion import evaluate_official_exclusion, ExclusionDecision
from app.adapters.lookalike_domain_adapter import LookalikeDomainAdapter
from app.adapters.threat_intel_adapter import ThreatIntelFeedAdapter
from app.adapters.app_store_live_adapter import AppStoreLiveAdapter
from app.adapters.social_live_adapter import SocialMediaLiveAdapter
from app.schemas.finding import FindingResponse
from app.schemas.scan import ScanRunResponse


@pytest.fixture
def netflix_brand():
    return {
        "id": "e9405fb6-2d17-42a3-9fd2-73c3e1209206",
        "name": "Netflix",
        "description": "Global streaming entertainment service. Monitor for fake Netflix login pages, phishing URLs, lookalike domains, and brand impersonation.",
        "primary_website": "https://netflix.com"
    }


@pytest.fixture
def official_netflix_apple_candidate():
    return {
        "candidate_type": "mobile_app",
        "platform": "apple_app_store",
        "display_name": "Netflix",
        "username_or_package": "com.netflix.Netflix",
        "publisher_or_developer": "Netflix, Inc.",
        "description": "Looking for the most talked about TV shows and movies from around the world? They're all on Netflix.",
        "external_url": "https://apps.apple.com/us/app/netflix/id363590051?uo=4",
        "logo_reference": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/AppIcon-512x512bb.jpg",
        "source_provenance": "apple_app_store:live_itunes_catalog",
        "metadata_json": {
            "track_id": 363590051,
            "artist_id": 363590054,
            "version": "26.1.0",
            "price": 0.0,
            "rating": 4.75,
            "rating_count": 7437204,
            "seller_url": "http://www.netflix.com",
            "developer_website": "http://www.netflix.com",
            "primary_genre": "Entertainment",
            "is_live": True,
            "provider": "apple_itunes_search_api"
        }
    }


def test_official_netflix_apple_listing_confirmed_official(netflix_brand, official_netflix_apple_candidate):
    """
    REGRESSION TEST: The authentic Netflix Apple App Store listing must NEVER be flagged
    as potential_impersonation. It must be recognized as confirmed_official_match with risk score 0.0.
    """
    # 1. Direct official exclusion evaluation
    excl = evaluate_official_exclusion(
        brand_name=netflix_brand["name"],
        brand_website=netflix_brand["primary_website"],
        registered_assets=[],
        candidate=official_netflix_apple_candidate
    )
    assert excl.decision == ExclusionDecision.CONFIRMED_OFFICIAL_MATCH
    assert excl.is_excluded_from_findings is True
    assert "Verified official mobile application" in excl.reason
    assert "com.netflix.Netflix" in excl.reason

    # 2. Complete engine evaluation
    res = evaluate_candidate(
        brand=netflix_brand,
        brand_assets=[],
        candidate=official_netflix_apple_candidate
    )
    assert res.decision == "confirmed_official_match"
    assert res.is_threat is False
    assert res.risk_score == 0.0
    assert res.risk_level == "low"
    assert "Not an impersonation threat" in res.evidence_summary


def test_legitimate_netflix_url_not_flagged(netflix_brand):
    """
    REGRESSION TEST: Legitimate Netflix domains and login pages must NEVER be flagged as threats.
    """
    official_candidates = [
        {
            "candidate_type": "domain",
            "platform": "web",
            "display_name": "netflix.com",
            "username_or_package": "netflix.com",
            "external_url": "https://netflix.com",
            "metadata_json": {"is_resolved": True, "dns_status": "active"}
        },
        {
            "candidate_type": "phishing_url",
            "platform": "phishing",
            "display_name": "Netflix Official Login",
            "username_or_package": "www.netflix.com",
            "external_url": "https://www.netflix.com/login",
            "metadata_json": {"hostname": "www.netflix.com", "url_path": "/login"}
        },
        {
            "candidate_type": "domain",
            "platform": "web",
            "display_name": "help.netflix.com",
            "username_or_package": "help.netflix.com",
            "external_url": "https://help.netflix.com",
            "metadata_json": {"is_resolved": True, "dns_status": "active"}
        }
    ]

    for cand in official_candidates:
        res = evaluate_candidate(netflix_brand, [], cand)
        assert res.decision == "confirmed_official_match"
        assert res.is_threat is False
        assert res.risk_score == 0.0


def test_genuine_fake_netflix_app_detected(netflix_brand):
    """
    REGRESSION TEST: A rogue third-party app imitating Netflix MUST still be detected
    with high risk score and potential_impersonation verdict.
    """
    rogue_app = {
        "candidate_type": "mobile_app",
        "platform": "apple_app_store",
        "display_name": "Netflix Streamer Free Movies",
        "username_or_package": "com.roguestream.netflixfree",
        "publisher_or_developer": "Rogue Media Studio LLC",
        "description": "Watch unlimited free Netflix streaming movies and account logins.",
        "external_url": "https://apps.apple.com/app/id999999999",
        "logo_reference": "netflix_stolen_icon",
        "source_provenance": "apple_app_store:unverified",
        "metadata_json": {
            "downloads": 50,
            "rating": 2.1,
            "suspicious_permissions": True,
            "is_live": False
        }
    }

    res = evaluate_candidate(netflix_brand, [], rogue_app)
    assert res.is_threat is True
    assert res.decision in ("potential_impersonation", "suspicious_needs_review")
    assert res.risk_score >= 45.0
    assert any("Developer/Publisher" in r for r in res.detection_reasons)


def test_genuine_netflix_phishing_url_detected(netflix_brand):
    """
    REGRESSION TEST: A confirmed Netflix phishing URL from feed intelligence must be flagged
    as confirmed_phishing or suspicious with high risk score.
    """
    phishing_cand = {
        "candidate_type": "phishing_url",
        "platform": "phishing",
        "display_name": "Netflix Phishing Kit (netflix-verify-login.pages.dev)",
        "username_or_package": "netflix-verify-login.pages.dev",
        "external_url": "https://netflix-verify-login.pages.dev/login/auth",
        "source_provenance": "openphish:community_feed",
        "metadata_json": {
            "feed": "openphish_community",
            "feed_source": "openphish",
            "is_live_ingest": True,
            "indicator_url": "https://netflix-verify-login.pages.dev/login/auth",
            "threat_type": "phishing_credential_harvester",
            "has_credential_path": True,
            "hostname": "netflix-verify-login.pages.dev",
            "url_path": "/login/auth"
        }
    }

    res = evaluate_candidate(netflix_brand, [], phishing_cand)
    assert res.is_threat is True
    assert res.decision == "confirmed_phishing"
    assert res.risk_score >= 60.0
    assert any("credential harvesting" in r.lower() or "threat intelligence" in r.lower() for r in res.detection_reasons)


def test_no_cross_brand_candidate_leakage():
    """
    REGRESSION TEST: Adapters must never inject other-brand sample indicators (e.g. Acme)
    when collecting candidates for Netflix.
    """
    # 1. Lookalike domain adapter
    domain_adapter = LookalikeDomainAdapter()
    d_res = domain_adapter.collect(brand_name="Netflix", brand_id="net-1")
    for cand in d_res.candidates:
        assert "acme" not in cand.username_or_package.lower(), f"Leaked Acme domain: {cand.username_or_package}"
        assert "acme" not in cand.display_name.lower(), f"Leaked Acme domain display: {cand.display_name}"

    # 2. Threat intel adapter
    threat_adapter = ThreatIntelFeedAdapter()
    t_res = threat_adapter.collect(brand_name="Netflix", brand_id="net-1")
    for cand in t_res.candidates:
        assert "acme" not in cand.external_url.lower(), f"Leaked Acme threat URL: {cand.external_url}"

    # 3. App store adapter
    app_adapter = AppStoreLiveAdapter()
    a_res = app_adapter.collect(brand_name="Netflix", brand_id="net-1", simulate_failure=True)
    assert a_res.records_collected == 0, "Simulated failure should have 0 candidates"

    # 4. Social media adapter
    social_adapter = SocialMediaLiveAdapter()
    s_res = social_adapter.collect(brand_name="Netflix", brand_id="net-1")
    for cand in s_res.candidates:
        assert "acme" not in cand.username_or_package.lower(), f"Leaked Acme social handle: {cand.username_or_package}"


def test_api_finding_and_scan_schema_includes_brand_name():
    """
    REGRESSION TEST: FindingResponse and ScanRunResponse must expose brand_name
    to prevent frontend adapters from falling back to hardcoded demo brands.
    """
    finding_data = {
        "id": "f-123",
        "brand_id": "b-456",
        "brand_name": "Netflix",
        "candidate_id": "c-789",
        "scan_run_id": "s-012",
        "risk_score": 0.0,
        "risk_level": "low",
        "decision": "confirmed_official_match",
        "detection_reasons": ["Verified official listing"],
        "signal_breakdown": [],
        "evidence_summary": "Official listing",
        "review_status": "false_positive",
        "first_detected_at": "2026-10-14T03:00:00Z",
        "last_detected_at": "2026-10-14T03:00:00Z"
    }

    resp = FindingResponse.model_validate(finding_data)
    assert resp.brand_name == "Netflix"
    assert resp.brand_id == "b-456"

    scan_data = {
        "id": "s-012",
        "brand_id": "b-456",
        "brand_name": "Netflix",
        "requested_source_types": ["domain", "threat_intel"],
        "status": "completed",
        "total_candidates_found": 16,
        "total_findings_flagged": 11,
        "created_at": "2026-10-14T03:00:00Z",
        "source_results": []
    }
    scan_resp = ScanRunResponse.model_validate(scan_data)
    assert scan_resp.brand_name == "Netflix"


@pytest.fixture
def official_netflix_google_play_candidate():
    return {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Netflix",
        "username_or_package": "com.netflix.ninja",
        "publisher_or_developer": "Netflix, Inc.",
        "description": "Looking for the most talked about TV shows and movies from around the world? They're all on Netflix.",
        "external_url": "https://play.google.com/store/apps/details?id=com.netflix.ninja",
        "logo_reference": "https://play-lh.googleusercontent.com/icon.png",
        "source_provenance": "google_play:live_catalog",
        "metadata_json": {
            "package_id": "com.netflix.ninja",
            "developer_website": "http://www.netflix.com",
            "developer_email": "playstore@netflix.com",
            "developer_id": "6891422865930303475",
            "score": 3.64,
            "installs": "500,000,000+",
            "ratings": 105873,
            "genre": "Entertainment",
            "free": True,
            "currency": "USD",
            "price": 0,
            "is_live": True,
            "provider": "google_play_scraper",
            "status": "LIVE"
        }
    }


def test_official_netflix_google_play_app_confirmed_official(netflix_brand, official_netflix_google_play_candidate):
    """
    REGRESSION TEST: The authentic Netflix Google Play app (com.netflix.ninja) must NEVER be flagged
    as potential_impersonation. It must be recognized as confirmed_official_match with risk score 0.0.
    """
    # 1. Direct official exclusion evaluation
    excl = evaluate_official_exclusion(
        brand_name=netflix_brand["name"],
        brand_website=netflix_brand["primary_website"],
        registered_assets=[],
        candidate=official_netflix_google_play_candidate
    )
    assert excl is not None
    assert excl.decision == ExclusionDecision.CONFIRMED_OFFICIAL_MATCH
    assert excl.is_excluded_from_findings is True
    assert "Verified official mobile application" in excl.reason
    assert "com.netflix.ninja" in excl.reason
    assert "500,000,000+ installs" in excl.reason

    # 2. Complete engine evaluation
    res = evaluate_candidate(
        brand=netflix_brand,
        brand_assets=[],
        candidate=official_netflix_google_play_candidate
    )
    assert res.decision == "confirmed_official_match"
    assert res.is_threat is False
    assert res.risk_score == 0.0
    assert res.risk_level == "low"
    assert "Not an impersonation threat" in res.evidence_summary


def test_unverified_app_not_automatically_declared_official(netflix_brand):
    """
    REGRESSION TEST: Apps with incomplete, inconclusive, or suspicious telemetry
    must NEVER be automatically declared confirmed_official_match.
    """
    # Case A: Third-party publisher with deceptive brand affix ("Netflix Fan Club")
    fan_app = {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Netflix Stream Helper",
        "username_or_package": "com.netflix.fanhelper",
        "publisher_or_developer": "Netflix Fan Club",
        "description": "Watch guides for Netflix streaming movies.",
        "external_url": "https://play.google.com/store/apps/details?id=com.netflix.fanhelper",
        "metadata_json": {"installs": "500", "is_live": True}
    }
    excl_a = evaluate_official_exclusion(netflix_brand["name"], netflix_brand["primary_website"], [], fan_app)
    assert excl_a.is_excluded_from_findings is False, "App with unverified publisher affix should not be excluded as official"
    assert excl_a.decision != ExclusionDecision.CONFIRMED_OFFICIAL_MATCH
    res_a = evaluate_candidate(netflix_brand, [], fan_app)
    assert res_a.decision == "potential_impersonation"
    assert res_a.is_threat is True
    assert res_a.risk_score >= 40.0

    # Case B: Inconclusive app - publisher matches but no catalog proof (e.g. low installs, no verified website)
    inconclusive_app = {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Netflix Private Beta",
        "username_or_package": "com.netflix.pvtbeta",
        "publisher_or_developer": "Netflix, Inc.",
        "description": "Private test build.",
        "external_url": "https://play.google.com/store/apps/details?id=com.netflix.pvtbeta",
        "metadata_json": {"installs": "50", "is_live": True}
    }
    excl_b = evaluate_official_exclusion(netflix_brand["name"], netflix_brand["primary_website"], [], inconclusive_app)
    assert excl_b.is_excluded_from_findings is False, "Inconclusive telemetry without catalog proof should not be confirmed official"
    assert excl_b.decision != ExclusionDecision.CONFIRMED_OFFICIAL_MATCH
    res_b = evaluate_candidate(netflix_brand, [], inconclusive_app)
    # Should be classified as inconclusive/unverified (insufficient_evidence), NOT malicious and NOT confirmed_official_match
    assert res_b.decision == "insufficient_evidence"
    assert res_b.is_threat is False
    assert res_b.risk_score < 40.0

    # Case C: Rogue developer adopting brand package namespace with supporting evidence
    rogue_namespace_app = {
        "candidate_type": "mobile_app",
        "platform": "google_play",
        "display_name": "Netflix - Watch Free Movies",
        "username_or_package": "com.netflix.freemovies",
        "publisher_or_developer": "SuperStream Media LLC",
        "description": "Watch Netflix movies free with login credentials.",
        "external_url": "https://play.google.com/store/apps/details?id=com.netflix.freemovies",
        "metadata_json": {"downloads": 50, "is_live": True, "suspicious_permissions": True}
    }
    excl_c = evaluate_official_exclusion(netflix_brand["name"], netflix_brand["primary_website"], [], rogue_namespace_app)
    assert excl_c.is_excluded_from_findings is False
    assert excl_c.decision != ExclusionDecision.CONFIRMED_OFFICIAL_MATCH
    res_c = evaluate_candidate(netflix_brand, [], rogue_namespace_app)
    assert res_c.decision == "potential_impersonation"
    assert res_c.is_threat is True
    assert res_c.risk_score >= 40.0


def test_updated_decisions_survive_database_reload():
    """
    REGRESSION TEST: The persisted remediation decisions in aegis.db must survive
    reloading from the database and maintain accurate verdicts, scores, and brand associations.
    """
    import sqlite3
    import os

    db_path = "backend/aegis.db"
    assert os.path.exists(db_path), f"Database not found at {db_path}"

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # 1. Verify Google Play Netflix listing (com.netflix.ninja)
    cur.execute("""
        SELECT f.id, f.risk_score, f.risk_level, f.decision, f.review_status, f.brand_id,
               c.canonical_identifier, c.publisher_or_developer, c.platform, b.name
        FROM findings f
        JOIN candidates c ON f.candidate_id = c.id
        JOIN brands b ON f.brand_id = b.id
        WHERE f.id = '19f4cdde-9de1-4d37-98e3-3cda77b13810'
    """)
    row = cur.fetchone()
    assert row is not None, "Google Play Netflix finding not found in database"
    f_id, score, level, decision, status, brand_id, pkg, pub, platform, brand_name = row

    assert f_id == "19f4cdde-9de1-4d37-98e3-3cda77b13810"
    assert score == 0.0
    assert level == "low"
    assert decision == "confirmed_official_match"
    assert status == "false_positive"
    assert pkg == "com.netflix.ninja"
    assert pub == "Netflix, Inc."
    assert platform == "google_play"
    assert brand_name == "Netflix"

    # 2. Verify Apple App Store Netflix listing (com.netflix.Netflix)
    cur.execute("""
        SELECT f.id, f.risk_score, f.risk_level, f.decision, f.review_status, f.brand_id,
               c.canonical_identifier, c.publisher_or_developer, c.platform, b.name
        FROM findings f
        JOIN candidates c ON f.candidate_id = c.id
        JOIN brands b ON f.brand_id = b.id
        WHERE f.id = '6842756b-9d1b-4b90-b2e0-2cfa29a70122'
    """)
    apple_row = cur.fetchone()
    assert apple_row is not None, "Apple App Store Netflix finding not found in database"
    assert apple_row[1] == 0.0
    assert apple_row[2] == "low"
    assert apple_row[3] == "confirmed_official_match"
    assert apple_row[4] == "false_positive"
    assert apple_row[6] == "com.netflix.Netflix"
    assert apple_row[9] == "Netflix"

    # 3. Verify audit review logs exist for both
    cur.execute("SELECT COUNT(*) FROM reviews WHERE finding_id = '19f4cdde-9de1-4d37-98e3-3cda77b13810'")
    assert cur.fetchone()[0] >= 1, "Audit review log missing for Google Play finding"

    cur.execute("SELECT COUNT(*) FROM reviews WHERE finding_id = '6842756b-9d1b-4b90-b2e0-2cfa29a70122'")
    assert cur.fetchone()[0] >= 1, "Audit review log missing for Apple App Store finding"

    conn.close()
