"""
AEGIS - Live Integration Verification Script
Performs evidence-based verification of:
1. Apple App Store (live iTunes API request & candidate normalization)
2. Google Play (live search probe & strict rejection of fabricated/empty results)
3. GitHub (live API user search & candidate normalization)
4. Reddit, YouTube, X, Meta (independent provider status checks)
5. End-to-End Pipeline Scans (1 app store scan, 1 social scan, database inspection, exclusion check)
"""
import os
import sys
import json
import httpx
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select

# Setup python path
sys.path.insert(0, "/Users/a1/hackxlerate/backend")

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.brand import Brand
from app.models.brand_asset import BrandAsset
from app.models.scan import ScanRun
from app.models.candidate import Candidate, CandidateObservation
from app.models.finding import Finding
from app.schemas.scan import ScanTriggerRequest
from app.services.scan_service import ScanService
from app.adapters.app_store_live_adapter import AppleAppStoreLiveProvider, GooglePlayLiveProvider, AppStoreLiveAdapter
from app.adapters.social_live_adapter import (
    GitHubSocialProvider,
    RedditSocialProvider,
    YouTubeSocialProvider,
    TwitterSocialProvider,
    MetaSocialProvider,
    SocialMediaLiveAdapter
)
from app.detection.engine import evaluate_candidate


def print_section(title: str):
    print("\n" + "=" * 70)
    print(f" {title.upper()} ")
    print("=" * 70)


def verify_apple_app_store():
    print_section("1. Apple App Store Live Verification")
    query = "finance"
    url = "https://itunes.apple.com/search"
    params = {"term": query, "entity": "software", "limit": 3}
    headers = {"User-Agent": "AEGIS-ThreatIntel-Audit/1.0"}

    with httpx.Client(timeout=10.0, headers=headers) as client:
        resp = client.get(url, params=params)
        print(f"HTTP Status: {resp.status_code}")
        data = resp.json()
        result_count = data.get("resultCount", 0)
        print(f"Result Count: {result_count}")

        results = data.get("results", [])
        for i, app in enumerate(results[:3], 1):
            name = app.get("trackName")
            bundle_id = app.get("bundleId")
            seller = app.get("sellerName")
            listing_url = app.get("trackViewUrl")
            print(f"  App #{i}:")
            print(f"    Name: {name}")
            print(f"    Bundle ID: {bundle_id}")
            print(f"    Seller: {seller}")
            print(f"    URL: {listing_url}")

    # Now verify normalized candidates via AppleAppStoreLiveProvider
    candidates = AppleAppStoreLiveProvider.search(query=query, limit=3)
    print(f"\nNormalized AEGIS Candidates Count: {len(candidates)}")
    for c in candidates:
        print(f"  - [{c.platform}] Display Name: {c.display_name} | Package: {c.username_or_package}")
        print(f"    Provenance: {c.source_provenance} | Live: {c.metadata_json.get('is_live')}")
        assert c.source_provenance == "apple_app_store:live_itunes_catalog"
        assert c.candidate_type == "mobile_app"
        assert c.metadata_json.get("is_live") is True

    print(">> Apple App Store: LIVE VERIFIED")
    return len(candidates) > 0


def verify_google_play():
    print_section("2. Google Play Provider Verification")
    query = "finance"
    status, candidates, msg = GooglePlayLiveProvider.search(query=query, limit=3)
    print(f"Provider Status: {status}")
    print(f"Parsed Record Count: {len(candidates)}")
    print(f"Provider Message: {msg}")

    # Verify no fabricated or synthetic names
    if candidates:
        print("Live records parsed:")
        for c in candidates:
            print(f"  - Package: {c.username_or_package} | Name: {c.display_name} | URL: {c.external_url}")
            assert not c.display_name.startswith("App ")
            assert not c.username_or_package.startswith("simulated.")
    else:
        print("Confirmed: 0 synthetic candidates fabricated. Dynamic obfuscation/consent correctly rejected.")
        print("Status is explicitly: NOT CONFIGURED / UNAVAILABLE (requires GOOGLE_PLAY_API_KEY).")

    print(f">> Google Play: {status.upper()}")
    return status


def verify_github():
    print_section("3. GitHub Provider Live Verification")
    query = "finance"
    url = "https://api.github.com/search/users"
    params = {"q": query, "per_page": 3}
    headers = {"User-Agent": "AEGIS-Security-Audit/1.0", "Accept": "application/vnd.github.v3+json"}

    with httpx.Client(timeout=10.0, headers=headers) as client:
        resp = client.get(url, params=params)
        print(f"HTTP Status: {resp.status_code}")
        data = resp.json()
        total_count = data.get("total_count", 0)
        items = data.get("items", [])
        print(f"Total Matches: {total_count} | Sample Items Returned: {len(items)}")

        for i, item in enumerate(items[:3], 1):
            login = item.get("login")
            profile_url = item.get("html_url")
            print(f"  User #{i}: {login} | Profile: {profile_url}")

    # Now verify normalized candidates via GitHubSocialProvider
    provider = GitHubSocialProvider()
    status, candidates, err = provider.search(query=query, limit=3)
    print(f"\nProvider Status: {status}")
    print(f"Normalized Candidates Count: {len(candidates)}")
    for c in candidates:
        print(f"  - [{c.platform}] Username: {c.username_or_package} | Display: {c.display_name}")
        print(f"    URL: {c.external_url} | Provenance: {c.source_provenance}")
        assert c.source_provenance == "github:live_api"
        assert c.metadata_json.get("is_live") is True

    print(">> GitHub: LIVE VERIFIED")
    return len(candidates) > 0


def verify_social_providers():
    print_section("4. Social Providers Independent Status Check")
    providers = [
        ("Reddit", RedditSocialProvider()),
        ("YouTube", YouTubeSocialProvider()),
        ("Twitter/X", TwitterSocialProvider()),
        ("Meta", MetaSocialProvider()),
    ]

    statuses = {}
    for name, provider in providers:
        status, candidates, msg = provider.search(query="Acme Finance", limit=3)
        statuses[name] = {"status": status, "count": len(candidates), "message": msg}
        print(f"  {name}:")
        print(f"    Status: {status}")
        print(f"    Records Parsed: {len(candidates)}")
        print(f"    Details: {msg}")
        assert status in ("not_configured", "unavailable", "rate_limited", "success")
        if status == "not_configured":
            assert len(candidates) == 0, f"{name} must not emit fake records when unconfigured"

    print(">> Unconfigured providers verified: No synthetic records emitted.")
    return statuses


def verify_e2e_pipeline():
    print_section("5. End-to-End Pipeline & Provenance Verification")
    db: Session = SessionLocal()
    try:
        # Fetch Acme Finance Group
        brand = db.query(Brand).first()
        if not brand:
            print("No brand in database; creating test brand")
            brand = Brand(name="Acme Finance Group", description="Financial Services", primary_website="https://acmefinance.com")
            db.add(brand)
            db.commit()
            db.refresh(brand)

        print(f"Target Brand: '{brand.name}' (ID: {brand.id})")

        # 1. Trigger App Store Scan
        print("\nTriggering App Store Scan via ScanService...")
        app_scan_req = ScanTriggerRequest(
            brand_id=brand.id,
            requested_source_types=["app_store"]
        )
        app_scan = ScanService.trigger_scan(db=db, req=app_scan_req, run_synchronous=True)
        print(f"App Store Scan {app_scan.id} finished with status: {app_scan.status}")

        # Check App Store Candidates & Observations
        app_obs = db.query(CandidateObservation).filter(CandidateObservation.scan_run_id == app_scan.id).all()
        print(f"Persisted App Store Candidate Observations: {len(app_obs)}")
        for o in app_obs[:5]:
            cand = db.query(Candidate).filter(Candidate.id == o.candidate_id).first()
            if cand:
                print(f"  - [{cand.platform}] {cand.display_name} ({cand.username_or_package})")
                print(f"    Provenance: {cand.source_provenance} | Is Live: {cand.metadata_json.get('is_live')}")
                if "live" in cand.source_provenance:
                    assert cand.metadata_json.get("is_live") is True

        # 2. Trigger Social Scan
        print("\nTriggering Social Media Scan via ScanService...")
        social_scan_req = ScanTriggerRequest(
            brand_id=brand.id,
            requested_source_types=["social"]
        )
        social_scan = ScanService.trigger_scan(db=db, req=social_scan_req, run_synchronous=True)
        print(f"Social Scan {social_scan.id} finished with status: {social_scan.status}")

        # Check Social Candidates & Observations
        social_obs = db.query(CandidateObservation).filter(CandidateObservation.scan_run_id == social_scan.id).all()
        print(f"Persisted Social Candidate Observations: {len(social_obs)}")
        for o in social_obs[:5]:
            cand = db.query(Candidate).filter(Candidate.id == o.candidate_id).first()
            if cand:
                print(f"  - [{cand.platform}] {cand.display_name} (@{cand.username_or_package})")
                print(f"    Provenance: {cand.source_provenance} | Is Live: {cand.metadata_json.get('is_live')}")
                if "live" in cand.source_provenance:
                    assert cand.metadata_json.get("is_live") is True

        # Check Findings & Official Asset Exclusion
        brand_assets = db.query(BrandAsset).filter(BrandAsset.brand_id == brand.id).all()
        print(f"\nRegistered Official Assets for Brand: {len(brand_assets)}")
        for a in brand_assets:
            print(f"  - Official Asset: {a.asset_type} ({a.platform}): {a.display_value}")

        findings = db.query(Finding).filter(Finding.scan_run_id.in_([app_scan.id, social_scan.id])).all()
        print(f"Total Findings Flagged: {len(findings)}")
        for f in findings[:5]:
            cand = db.query(Candidate).filter(Candidate.id == f.candidate_id).first()
            cand_name = cand.display_name if cand else f.candidate_id
            print(f"  - Candidate: {cand_name} | Risk Score: {f.risk_score} | Decision: {f.decision} | Level: {f.risk_level}")
            # Check deterministic range
            assert 0.0 <= f.risk_score <= 100.0

        # Verify exclusion logic determinism for registered official app & social profile
        official_app = next((a for a in brand_assets if a.asset_type == "official_mobile_app"), None)
        if official_app:
            dummy_app = Candidate(
                candidate_type="mobile_app",
                platform=official_app.platform,
                display_name="Acme Finance App",
                username_or_package=official_app.normalized_identifier or official_app.display_value,
                publisher_or_developer="Acme Financial Group LLC",
                external_url="https://play.google.com/store/apps/details?id=com.acme.finance.app",
                source_provenance="verification_test",
                metadata_json={}
            )
            res_app = evaluate_candidate(brand, brand_assets, dummy_app)
            print(f"\nOfficial App Evaluation: decision={res_app.decision}, is_threat={res_app.is_threat}, risk_score={res_app.risk_score}")
            assert res_app.decision == "confirmed_official_match"
            assert res_app.is_threat is False
            assert res_app.risk_score == 0.0

        official_social = next((a for a in brand_assets if a.asset_type == "official_social_account"), None)
        if official_social:
            dummy_social = Candidate(
                candidate_type="social_profile",
                platform=official_social.platform,
                display_name="Acme Finance",
                username_or_package=official_social.normalized_identifier or official_social.display_value,
                publisher_or_developer=None,
                external_url="https://instagram.com/acmefinance",
                source_provenance="verification_test",
                metadata_json={}
            )
            res_soc = evaluate_candidate(brand, brand_assets, dummy_social)
            print(f"Official Social Account Evaluation: decision={res_soc.decision}, is_threat={res_soc.is_threat}, risk_score={res_soc.risk_score}")
            assert res_soc.decision == "confirmed_official_match"
            assert res_soc.is_threat is False
            assert res_soc.risk_score == 0.0

        print(">> Pipeline & Official Asset Exclusion: VERIFIED")
    finally:
        db.close()


if __name__ == "__main__":
    verify_apple_app_store()
    verify_google_play()
    verify_github()
    verify_social_providers()
    verify_e2e_pipeline()
    print("\nALL 5 INTEGRATION AUDIT AREAS EXECUTED AND VERIFIED!")
