from dataclasses import dataclass
from enum import Enum
from typing import List, Optional, Any
from app.detection.normalization import (
    normalize_username,
    normalize_package_id,
    normalize_domain,
    normalize_text
)


class ExclusionDecision(str, Enum):
    CONFIRMED_OFFICIAL_MATCH = "confirmed_official_match"
    LIKELY_OFFICIAL_MATCH = "likely_official_match"
    POTENTIAL_IMPERSONATION = "potential_impersonation"
    SUSPICIOUS_NEEDS_REVIEW = "suspicious_needs_review"
    CONFIRMED_PHISHING = "confirmed_phishing"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"


@dataclass
class ExclusionResult:
    decision: ExclusionDecision
    is_excluded_from_findings: bool
    matched_asset_id: Optional[str]
    matched_asset_type: Optional[str]
    matched_asset_value: Optional[str]
    reason: str


def evaluate_official_exclusion(
    brand_name: str,
    brand_website: Optional[str],
    registered_assets: List[Any], # list of BrandAsset instances or dicts
    candidate: Any                # Candidate instance or dict
) -> ExclusionResult:
    """
    Evaluate whether a discovered candidate is an official brand asset.
    Strictly prevents flagging legitimate brand assets as threats.
    Never relies solely on display-name similarity.
    """
    # Extract candidate fields
    c_type = getattr(candidate, "candidate_type", None) or (candidate.get("candidate_type") if isinstance(candidate, dict) else "")
    c_platform = (getattr(candidate, "platform", None) or (candidate.get("platform") if isinstance(candidate, dict) else "") or "").lower()
    c_user_pkg = getattr(candidate, "username_or_package", None) or (candidate.get("username_or_package") if isinstance(candidate, dict) else "") or ""
    c_pub = getattr(candidate, "publisher_or_developer", None) or (candidate.get("publisher_or_developer") if isinstance(candidate, dict) else "") or ""
    c_url = getattr(candidate, "external_url", None) or (candidate.get("external_url") if isinstance(candidate, dict) else "") or ""
    c_name = getattr(candidate, "display_name", None) or (candidate.get("display_name") if isinstance(candidate, dict) else "") or ""

    norm_c_user = normalize_username(c_user_pkg)
    norm_c_pkg = normalize_package_id(c_user_pkg)
    norm_c_pub = normalize_text(c_pub)
    norm_brand_domain = normalize_domain(brand_website or "")

    # Extract candidate domain for domain/phishing candidates
    from urllib.parse import urlparse
    c_domain_val = norm_c_user
    if c_url and isinstance(c_url, str):
        parsed_c_url = urlparse(c_url)
        if parsed_c_url.netloc:
            c_domain_val = normalize_domain(parsed_c_url.netloc)

    # Direct match against primary brand website
    if norm_brand_domain and c_domain_val:
        if c_domain_val == norm_brand_domain or c_domain_val.endswith(f".{norm_brand_domain}"):
            return ExclusionResult(
                decision=ExclusionDecision.CONFIRMED_OFFICIAL_MATCH,
                is_excluded_from_findings=True,
                matched_asset_id=None,
                matched_asset_type="official_domain",
                matched_asset_value=norm_brand_domain,
                reason=f"Candidate domain '{c_domain_val}' matches primary official brand website domain."
            )

    for asset in registered_assets:
        a_id = getattr(asset, "id", None) or (asset.get("id") if isinstance(asset, dict) else None)
        a_type = getattr(asset, "asset_type", None) or (asset.get("asset_type") if isinstance(asset, dict) else "")
        a_plat = (getattr(asset, "platform", None) or (asset.get("platform") if isinstance(asset, dict) else "") or "").lower()
        a_norm_id = getattr(asset, "normalized_identifier", None) or (asset.get("normalized_identifier") if isinstance(asset, dict) else "")
        a_val = getattr(asset, "display_value", None) or (asset.get("display_value") if isinstance(asset, dict) else "")
        a_url = getattr(asset, "url", None) or (asset.get("url") if isinstance(asset, dict) else "")

        # 0. Official Domain Check
        if a_type == "official_domain":
            norm_a_dom = normalize_domain(a_val or a_url or "")
            if norm_a_dom and c_domain_val:
                if c_domain_val == norm_a_dom or c_domain_val.endswith(f".{norm_a_dom}"):
                    return ExclusionResult(
                        decision=ExclusionDecision.CONFIRMED_OFFICIAL_MATCH,
                        is_excluded_from_findings=True,
                        matched_asset_id=str(a_id) if a_id else None,
                        matched_asset_type=a_type,
                        matched_asset_value=a_val,
                        reason=f"Candidate domain '{c_domain_val}' matches registered official brand domain '{norm_a_dom}'."
                    )

        # 1. Official Social Account Check
        if a_type == "official_social_account" and c_type == "social_profile":
            # Must match platform or compatible platform label
            if a_plat == c_platform or not a_plat:
                # Compare exact normalized account handle
                if normalize_username(a_norm_id) == norm_c_user and norm_c_user != "":
                    return ExclusionResult(
                        decision=ExclusionDecision.CONFIRMED_OFFICIAL_MATCH,
                        is_excluded_from_findings=True,
                        matched_asset_id=str(a_id) if a_id else None,
                        matched_asset_type=a_type,
                        matched_asset_value=a_val,
                        reason=f"Candidate exactly matches registered official social handle '{a_val}' on {c_platform.capitalize()}."
                    )
                # Compare exact profile URL if registered
                if a_url and c_url and a_url.rstrip("/").lower() == c_url.rstrip("/").lower():
                    return ExclusionResult(
                        decision=ExclusionDecision.CONFIRMED_OFFICIAL_MATCH,
                        is_excluded_from_findings=True,
                        matched_asset_id=str(a_id) if a_id else None,
                        matched_asset_type=a_type,
                        matched_asset_value=a_url,
                        reason=f"Candidate URL exactly matches registered official social URL on {c_platform.capitalize()}."
                    )

        # 2. Official Mobile App Check
        if a_type == "official_mobile_app" and c_type == "mobile_app":
            if a_plat == c_platform or not a_plat:
                # Compare exact package ID / bundle ID
                if normalize_package_id(a_norm_id) == norm_c_pkg and norm_c_pkg != "":
                    lifecycle = (getattr(asset, "lifecycle_status", None) or (asset.get("lifecycle_status") if isinstance(asset, dict) else "active") or "active").lower()
                    if lifecycle == "retired":
                        match_reason = f"Candidate package ID '{c_user_pkg}' matches registered official retired brand asset (decommissioned/archived). Not an impersonation threat."
                    elif lifecycle == "legacy":
                        match_reason = f"Candidate package ID '{c_user_pkg}' matches registered official legacy brand asset. Not an impersonation threat."
                    else:
                        match_reason = f"Candidate application package ID '{c_user_pkg}' exactly matches registered active official mobile application asset."

                    return ExclusionResult(
                        decision=ExclusionDecision.CONFIRMED_OFFICIAL_MATCH,
                        is_excluded_from_findings=True,
                        matched_asset_id=str(a_id) if a_id else None,
                        matched_asset_type=a_type,
                        matched_asset_value=a_val,
                        reason=match_reason
                    )
                # Compare exact listing URL
                if a_url and c_url and a_url.rstrip("/").lower() == c_url.rstrip("/").lower():
                    return ExclusionResult(
                        decision=ExclusionDecision.CONFIRMED_OFFICIAL_MATCH,
                        is_excluded_from_findings=True,
                        matched_asset_id=str(a_id) if a_id else None,
                        matched_asset_type=a_type,
                        matched_asset_value=a_url,
                        reason=f"Candidate app store URL matches registered official app listing."
                    )

        # 3. Official Developer / Publisher Check
        if a_type == "official_publisher" and c_type == "mobile_app":
            if normalize_text(a_norm_id) == norm_c_pub and norm_c_pub != "":
                # If developer matches and app listing links to official brand domain
                metadata = getattr(candidate, "metadata_json", {}) or (candidate.get("metadata_json") if isinstance(candidate, dict) else {})
                dev_website = metadata.get("developer_website") or ""
                if norm_brand_domain and norm_brand_domain == normalize_domain(dev_website):
                    return ExclusionResult(
                        decision=ExclusionDecision.LIKELY_OFFICIAL_MATCH,
                        is_excluded_from_findings=True,
                        matched_asset_id=str(a_id) if a_id else None,
                        matched_asset_type=a_type,
                        matched_asset_value=a_val,
                        reason=f"Candidate published by registered official publisher '{a_val}' and developer website matches brand domain."
                    )

    # 4. Deterministic, Evidence-Backed Legitimate-App Verification Rule
    # When an app is confirmed to be the official listing for its publisher and brand,
    # it must not be classified as that brand's impersonator.
    # Do not treat publisher text alone as proof; verify it using trusted catalog identifiers.
    catalog_verification = verify_legitimate_catalog_app(
        brand_name=brand_name,
        brand_website=brand_website,
        candidate=candidate
    )
    if catalog_verification:
        return catalog_verification

    # Not excluded as official
    return ExclusionResult(
        decision=ExclusionDecision.POTENTIAL_IMPERSONATION,
        is_excluded_from_findings=False,
        matched_asset_id=None,
        matched_asset_type=None,
        matched_asset_value=None,
        reason="Candidate does not match any registered official identifiers or verified catalog credentials."
    )


def verify_legitimate_catalog_app(
    brand_name: str,
    brand_website: Optional[str],
    candidate: Any
) -> Optional[ExclusionResult]:
    """
    Deterministic, evidence-backed legitimate-app verification rule.
    Verifies that a discovered mobile app is the authentic, official listing for
    the brand and publisher using authoritative store catalog identifiers.
    Never relies solely on publisher text; requires corroborating catalog proof.
    """
    c_type = getattr(candidate, "candidate_type", None) or (candidate.get("candidate_type") if isinstance(candidate, dict) else "")
    if c_type != "mobile_app":
        return None

    c_platform = (getattr(candidate, "platform", None) or (candidate.get("platform") if isinstance(candidate, dict) else "") or "").lower()
    c_user_pkg = getattr(candidate, "username_or_package", None) or (candidate.get("username_or_package") if isinstance(candidate, dict) else "") or ""
    c_pub = getattr(candidate, "publisher_or_developer", None) or (candidate.get("publisher_or_developer") if isinstance(candidate, dict) else "") or ""
    c_url = getattr(candidate, "external_url", None) or (candidate.get("external_url") if isinstance(candidate, dict) else "") or ""
    c_meta = getattr(candidate, "metadata_json", {}) or (candidate.get("metadata_json") if isinstance(candidate, dict) else {}) or {}
    c_prov = (getattr(candidate, "source_provenance", "") or (candidate.get("source_provenance") if isinstance(candidate, dict) else "") or "").lower()

    norm_brand = normalize_text(brand_name)
    norm_c_pub = normalize_text(c_pub)
    norm_brand_domain = normalize_domain(brand_website or "")

    # 1. Publisher entity verification against brand identity
    # Rejects unauthorized developers and entities containing suspicious/third-party keywords
    UNVERIFIED_PUBLISHER_AFFIXES = {
        "guide", "fan", "free", "tips", "mod", "tricks", "hack", "streamer",
        "player", "unofficial", "helper", "community", "club", "tube", "zone",
        "hub", "apk", "downloader", "download", "movies", "tv", "cheats", "tools"
    }

    publisher_words = set(norm_c_pub.split())
    if publisher_words & UNVERIFIED_PUBLISHER_AFFIXES:
        return None

    publisher_matches_brand = False
    if norm_brand and norm_c_pub:
        brand_tokens = [tok for tok in norm_brand.split() if len(tok) >= 3]
        if norm_brand in norm_c_pub or norm_c_pub in norm_brand:
            publisher_matches_brand = True
        elif brand_tokens and all(tok in norm_c_pub for tok in brand_tokens):
            publisher_matches_brand = True

    if not publisher_matches_brand:
        return None

    domain_proofs: List[str] = []
    catalog_proofs: List[str] = []
    namespace_proofs: List[str] = []

    # 2. Store catalog developer website / seller URL matches brand domain
    dev_site = (
        c_meta.get("seller_url") or
        c_meta.get("sellerUrl") or
        c_meta.get("developer_website") or
        c_meta.get("developerWebsite") or
        c_meta.get("developer_url") or
        ""
    )
    norm_dev_dom = normalize_domain(dev_site) if dev_site else ""
    if norm_brand_domain and norm_dev_dom:
        if norm_dev_dom == norm_brand_domain or norm_dev_dom.endswith(f".{norm_brand_domain}"):
            domain_proofs.append(f"Developer website ('{norm_dev_dom}') matches official brand domain ('{norm_brand_domain}')")

    # Developer contact email domain matches official brand domain (e.g. playstore@netflix.com)
    dev_email = (
        c_meta.get("developer_email") or
        c_meta.get("developerEmail") or
        ""
    ).lower().strip()
    if dev_email and norm_brand_domain:
        if dev_email.endswith(f"@{norm_brand_domain}") or dev_email.endswith(f".{norm_brand_domain}"):
            domain_proofs.append(f"Developer email ('{dev_email}') matches official brand domain ('{norm_brand_domain}')")

    # 3. Reverse-DNS package / bundle ID matches brand domain or canonical namespace
    if norm_brand_domain and c_user_pkg:
        dom_parts = norm_brand_domain.split(".")
        if len(dom_parts) >= 2:
            rev_prefix = ".".join(reversed(dom_parts))
            pkg_lower = c_user_pkg.lower()
            if pkg_lower.startswith(rev_prefix) or pkg_lower.startswith(f"com.{dom_parts[0]}"):
                namespace_proofs.append(f"Bundle ID '{c_user_pkg}' conforms to brand reverse-DNS prefix '{rev_prefix}'")
    elif c_user_pkg and norm_brand:
        brand_slug = normalize_username(brand_name)
        if c_user_pkg.lower().startswith(f"com.{brand_slug}"):
            namespace_proofs.append(f"Bundle ID '{c_user_pkg}' conforms to canonical brand namespace 'com.{brand_slug}'")

    # 4. Official Apple App Store listing ID & developer telemetry
    track_id = c_meta.get("track_id") or c_meta.get("trackId")
    artist_id = c_meta.get("artist_id") or c_meta.get("artistId")
    rating_count = c_meta.get("rating_count") or c_meta.get("userRatingCount") or 0
    is_live_apple_catalog = (
        "apple_itunes_search_api" in str(c_meta) or
        "live_itunes_catalog" in c_prov or
        "apple_itunes_catalog" in str(c_meta) or
        c_meta.get("is_live", False)
    )

    if c_platform == "apple_app_store":
        if track_id and is_live_apple_catalog:
            telemetry_str = f"Apple Track ID {track_id}"
            if artist_id:
                telemetry_str += f", Apple Developer ID: {artist_id}"
            if rating_count and rating_count >= 1000:
                telemetry_str += f", {rating_count:,} verified store ratings"
            
            if rating_count and rating_count >= 10000:
                catalog_proofs.append(f"Official Apple App Store catalog verified ({telemetry_str})")
            else:
                catalog_proofs.append(f"Verified Apple iTunes Track ID {track_id}")

    # 5. Official Google Play Store listing ID & verified install volume / ratings
    if c_platform == "google_play":
        installs_raw = str(c_meta.get("installs") or "")
        clean_installs = "".join(ch for ch in installs_raw if ch.isdigit())
        install_count = int(clean_installs) if clean_installs else 0
        play_ratings = c_meta.get("ratings") or c_meta.get("rating_count") or 0

        is_live_play = (
            "google_play_scraper" in str(c_meta) or
            "google_play:live_catalog" in c_prov or
            "google_play_catalog" in str(c_meta) or
            c_meta.get("is_live", False)
        )
        if is_live_play:
            if install_count >= 1_000_000:
                catalog_proofs.append(f"Google Play verified catalog distribution with {installs_raw} installs")
            elif play_ratings and play_ratings >= 10_000:
                catalog_proofs.append(f"Google Play verified catalog ratings ({play_ratings:,} ratings)")

    # Strict multi-factor verification rule:
    # Reverse-DNS package naming alone is insufficient without authoritative domain ownership
    # or established store catalog proof.
    # Conclusive verification requires:
    # 1. Matching publisher entity without unverified affixes
    # AND EITHER:
    #   - Valid domain ownership proof (website/email) corroborated by namespace or catalog proof
    #   - Established catalog distribution proof corroborated by reverse-DNS namespace proof
    is_conclusive = False
    if domain_proofs and (namespace_proofs or catalog_proofs):
        is_conclusive = True
    elif catalog_proofs and namespace_proofs:
        is_conclusive = True

    if is_conclusive:
        all_proofs = domain_proofs + catalog_proofs + namespace_proofs
        proof_summary = "; ".join(all_proofs)
        reason = (
            f"Verified official mobile application for '{brand_name}' on {c_platform.replace('_', ' ').title()}: "
            f"Developer '{c_pub}' verified against official entity, corroborated by trusted catalog proof: {proof_summary}. "
            f"Not an impersonation threat."
        )
        return ExclusionResult(
            decision=ExclusionDecision.CONFIRMED_OFFICIAL_MATCH,
            is_excluded_from_findings=True,
            matched_asset_id=None,
            matched_asset_type="official_mobile_catalog_verification",
            matched_asset_value=f"{c_platform}:{c_user_pkg}",
            reason=reason
        )

    return None
