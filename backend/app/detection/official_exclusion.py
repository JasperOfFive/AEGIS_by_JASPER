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

    # Not excluded as official
    return ExclusionResult(
        decision=ExclusionDecision.POTENTIAL_IMPERSONATION,
        is_excluded_from_findings=False,
        matched_asset_id=None,
        matched_asset_type=None,
        matched_asset_value=None,
        reason="Candidate does not match any registered official identifiers."
    )
