"""
Unit tests for AEGIS Live Adapters:
1. Apple App Store & Google Play Store Live Providers (AppStoreLiveAdapter).
2. GitHub, Reddit, YouTube, X, Meta Live Providers (SocialMediaLiveAdapter).
Verifies parsing, normalization, deduplication, unconfigured states, and deterministic scoring compatibility.
"""
import pytest
from unittest.mock import patch, MagicMock

from app.adapters.app_store_live_adapter import (
    AppleAppStoreLiveProvider,
    GooglePlayLiveProvider,
    AppStoreLiveAdapter
)
from app.adapters.social_live_adapter import (
    GitHubSocialProvider,
    RedditSocialProvider,
    YouTubeSocialProvider,
    TwitterSocialProvider,
    MetaSocialProvider,
    SocialMediaLiveAdapter
)
from app.detection.engine import evaluate_candidate
from app.models.brand import Brand
from app.models.brand_asset import BrandAsset


def test_apple_app_store_parsing():
    """Verify Apple App Store provider parses iTunes JSON response into normalized candidate records."""
    mock_itunes_resp = MagicMock()
    mock_itunes_resp.status_code = 200
    mock_itunes_resp.json.return_value = {
        "resultCount": 1,
        "results": [
            {
                "trackId": 984129412,
                "bundleId": "com.acme.finance.wallet",
                "trackName": "Acme Finance Wallet",
                "sellerName": "Shady App Dev LLC",
                "description": "Store and manage crypto assets.",
                "trackViewUrl": "https://apps.apple.com/app/id984129412",
                "artworkUrl512": "https://is1-ssl.mzstatic.com/image/thumb/icon.png",
                "version": "1.0.4",
                "averageUserRating": 2.5,
                "userRatingCount": 12,
                "primaryGenreName": "Finance",
                "currentVersionReleaseDate": "2026-01-15T12:00:00Z"
            }
        ]
    }

    with patch("httpx.Client.get", return_value=mock_itunes_resp):
        candidates = AppleAppStoreLiveProvider.search(query="acme finance")
        assert len(candidates) == 1
        cand = candidates[0]
        assert cand.candidate_type == "mobile_app"
        assert cand.platform == "apple_app_store"
        assert cand.display_name == "Acme Finance Wallet"
        assert cand.username_or_package == "com.acme.finance.wallet"
        assert cand.publisher_or_developer == "Shady App Dev LLC"
        assert cand.source_provenance == "apple_app_store:live_itunes_catalog"
        assert cand.metadata_json["is_live"] is True
        assert cand.metadata_json["version"] == "1.0.4"


def test_google_play_store_parsing():
    """Verify Google Play provider parses structured HTML when available and rejects unconfigured dynamic pages."""
    mock_structured_play_html = """
    <html>
      <body>
        <div>
          <a href="/store/apps/details?id=com.acme.fastloan.scam">
            <span class="DdUgx">Acme Fast Loan</span>
            <span class="wIntEg">Fast Loan Dev LLC</span>
          </a>
          <a href="/store/apps/details?id=com.acme.payapp">
            <span class="DdUgx">Acme Pay</span>
            <span class="wIntEg">FinTech Mobile Group</span>
          </a>
        </div>
      </body>
    </html>
    """
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.text = mock_structured_play_html
    mock_resp.url = "https://play.google.com/store/search?q=acme&c=apps"

    with patch("httpx.Client.get", return_value=mock_resp):
        status, candidates, msg = GooglePlayLiveProvider.search(query="acme")
        assert status == "live_verified"
        assert len(candidates) == 2
        packages = [c.username_or_package for c in candidates]
        assert "com.acme.fastloan.scam" in packages
        assert "com.acme.payapp" in packages
        for c in candidates:
            assert c.candidate_type == "mobile_app"
            assert c.platform == "google_play"
            assert c.source_provenance == "google_play:live_catalog"
            assert c.metadata_json["is_live"] is True

    # Test rejection of dynamic obfuscated or consent responses without API key
    mock_obfuscated_resp = MagicMock()
    mock_obfuscated_resp.status_code = 200
    mock_obfuscated_resp.text = "<html><body><script>/* dynamic client bundle */</script></body></html>"
    mock_obfuscated_resp.url = "https://play.google.com/store/search?q=acme&c=apps"

    with patch("httpx.Client.get", return_value=mock_obfuscated_resp):
        status, candidates, msg = GooglePlayLiveProvider.search(query="acme")
        assert status == "not_configured"
        assert len(candidates) == 0
        assert "GOOGLE_PLAY_API_KEY" in msg


def test_app_store_live_adapter_deduplication():
    """Verify AppStoreLiveAdapter deduplicates records with identical bundle IDs."""
    adapter = AppStoreLiveAdapter()
    # Mocking network call to trigger verified indicators and test deduplication logic
    with patch("httpx.Client.get", side_effect=Exception("Offline")):
        res = adapter.collect(brand_name="Acme Finance", brand_id="test_brand_id")
        assert res.status in ("success", "partial")
        assert res.records_collected > 0
        # Assert package IDs are unique per platform
        keys = [(c.platform, c.username_or_package) for c in res.candidates]
        assert len(keys) == len(set(keys))


def test_github_social_provider_parsing():
    """Verify GitHub provider parses user search results into normalized candidate records."""
    mock_gh_resp = MagicMock()
    mock_gh_resp.status_code = 200
    mock_gh_resp.json.return_value = {
        "total_count": 1,
        "items": [
            {
                "id": 1029384,
                "login": "acmefinance-help",
                "html_url": "https://github.com/acmefinance-help",
                "avatar_url": "https://avatars.githubusercontent.com/u/1029384",
                "type": "Organization",
                "site_admin": False
            }
        ]
    }

    with patch("httpx.Client.get", return_value=mock_gh_resp):
        provider = GitHubSocialProvider()
        status, candidates, err = provider.search(query="acmefinance")
        assert status == "success"
        assert len(candidates) == 1
        cand = candidates[0]
        assert cand.candidate_type == "social_profile"
        assert cand.platform == "github"
        assert cand.username_or_package == "acmefinance-help"
        assert cand.source_provenance == "github:live_api"
        assert cand.metadata_json["is_live"] is True


def test_social_providers_unconfigured_statuses():
    """Verify social providers return explicit 'not_configured' status when API keys are absent."""
    with patch("app.core.config.settings.YOUTUBE_API_KEY", ""), \
         patch("app.core.config.settings.TWITTER_BEARER_TOKEN", ""), \
         patch("app.core.config.settings.META_ACCESS_TOKEN", ""):

        yt_provider = YouTubeSocialProvider()
        yt_status, yt_cands, yt_msg = yt_provider.search(query="Acme")
        assert yt_status == "not_configured"
        assert "YOUTUBE_API_KEY" in yt_msg
        assert len(yt_cands) == 0

        tw_provider = TwitterSocialProvider()
        tw_status, tw_cands, tw_msg = tw_provider.search(query="Acme")
        assert tw_status == "not_configured"
        assert "TWITTER_BEARER_TOKEN" in tw_msg
        assert len(tw_cands) == 0

        meta_provider = MetaSocialProvider()
        m_status, m_cands, m_msg = meta_provider.search(query="Acme")
        assert m_status == "not_configured"
        assert "META_ACCESS_TOKEN" in m_msg
        assert len(m_cands) == 0


def test_official_asset_exclusion_with_live_candidates():
    """Verify that official asset exclusion correctly exempts registered official apps from findings."""
    brand = Brand(name="Acme Finance", description="Banking", primary_website="https://acmefinance.com")
    brand_assets = [
        BrandAsset(
            asset_type="official_mobile_app",
            platform="apple_app_store",
            display_value="com.acme.finance.ios",
            normalized_identifier="com.acme.finance.ios"
        )
    ]

    # Candidate matching official bundle ID
    official_candidate = MagicMock()
    official_candidate.candidate_type = "mobile_app"
    official_candidate.platform = "apple_app_store"
    official_candidate.display_name = "Acme Finance Mobile"
    official_candidate.username_or_package = "com.acme.finance.ios"
    official_candidate.publisher_or_developer = "Acme Corp"
    official_candidate.description = "Official mobile application"
    official_candidate.logo_reference = None
    official_candidate.metadata_json = {}

    det = evaluate_candidate(brand, brand_assets, official_candidate)
    assert det.decision == "confirmed_official_match"
    assert det.is_threat is False
    assert det.risk_score == 0.0
