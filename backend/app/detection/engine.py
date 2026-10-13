from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from app.detection.normalization import (
    normalize_text,
    normalize_username,
    normalize_package_id,
    normalize_domain
)
from app.detection.name_similarity import compare_names
from app.detection.text_similarity import compare_descriptions
from app.detection.logo_similarity import compare_logos
from app.detection.official_exclusion import evaluate_official_exclusion, ExclusionDecision
from app.detection.risk_scoring import (
    calculate_social_risk,
    calculate_app_risk,
    calculate_domain_risk,
    calculate_phishing_risk
)


@dataclass
class DetectionResult:
    decision: str
    is_threat: bool
    risk_score: float
    risk_level: str
    detection_reasons: List[str]
    signal_breakdown: List[Dict[str, Any]]
    evidence_summary: str
    matched_asset_id: Optional[str] = None


def evaluate_candidate(
    brand: Any,
    brand_assets: List[Any],
    candidate: Any
) -> DetectionResult:
    """
    Pure, deterministic detection engine function.
    Does NOT depend on FastAPI requests or DB sessions.
    
    1. Evaluates official asset exclusions (confirmed official match, likely official).
    2. Runs multi-signal similarity analysis (name, handle/package, logo, description, telemetry).
    3. Calculates calibrated risk score and structured explainability breakdown across:
       - Lookalike domains
       - Phishing URLs
       - Social media profiles
       - Mobile applications
    """
    # Extract brand fields
    b_name = getattr(brand, "name", None) or (brand.get("name") if isinstance(brand, dict) else "")
    b_desc = getattr(brand, "description", None) or (brand.get("description") if isinstance(brand, dict) else "")
    b_web = getattr(brand, "primary_website", None) or (brand.get("primary_website") if isinstance(brand, dict) else "")

    # Extract candidate fields
    c_type = getattr(candidate, "candidate_type", None) or (candidate.get("candidate_type") if isinstance(candidate, dict) else "")
    c_plat = getattr(candidate, "platform", None) or (candidate.get("platform") if isinstance(candidate, dict) else "")
    c_name = getattr(candidate, "display_name", None) or (candidate.get("display_name") if isinstance(candidate, dict) else "")
    c_user_pkg = getattr(candidate, "username_or_package", None) or (candidate.get("username_or_package") if isinstance(candidate, dict) else "")
    c_pub = getattr(candidate, "publisher_or_developer", None) or (candidate.get("publisher_or_developer") if isinstance(candidate, dict) else "")
    c_desc = getattr(candidate, "description", None) or (candidate.get("description") if isinstance(candidate, dict) else "")
    c_logo = getattr(candidate, "logo_reference", None) or (candidate.get("logo_reference") if isinstance(candidate, dict) else "")
    c_url = getattr(candidate, "external_url", None) or (candidate.get("external_url") if isinstance(candidate, dict) else "")
    c_meta = getattr(candidate, "metadata_json", {}) or (candidate.get("metadata_json") if isinstance(candidate, dict) else {}) or {}

    # Extract brand logo reference from assets if registered
    brand_logo_ref = None
    brand_keywords = []
    official_publishers = []
    for a in brand_assets:
        a_type = getattr(a, "asset_type", None) or (a.get("asset_type") if isinstance(a, dict) else "")
        if a_type == "logo_image":
            brand_logo_ref = getattr(a, "image_reference", None) or (a.get("image_reference") if isinstance(a, dict) else None)
        elif a_type == "brand_keyword":
            val = getattr(a, "display_value", None) or (a.get("display_value") if isinstance(a, dict) else "")
            if val:
                brand_keywords.append(val)
        elif a_type == "official_publisher":
            pub_val = getattr(a, "display_value", None) or (a.get("display_value") if isinstance(a, dict) else "")
            if pub_val:
                official_publishers.append(normalize_text(pub_val))

    # STEP 1: OFFICIAL ASSET EXCLUSION
    exclusion_res = evaluate_official_exclusion(
        brand_name=b_name,
        brand_website=b_web,
        registered_assets=brand_assets,
        candidate=candidate
    )

    if exclusion_res.is_excluded_from_findings:
        # Excluded! Never create suspicious finding for official asset
        return DetectionResult(
            decision=exclusion_res.decision.value,
            is_threat=False,
            risk_score=0.0,
            risk_level="low",
            detection_reasons=[exclusion_res.reason],
            signal_breakdown=[],
            evidence_summary=f"Official Asset Verified: {exclusion_res.reason}",
            matched_asset_id=exclusion_res.matched_asset_id
        )

    # STEP 2: MULTI-SIGNAL ANALYSIS
    # Name comparison
    name_comp = compare_names(b_name, c_name, is_handle=False)
    
    # Description comparison
    text_comp = compare_descriptions(
        brand_name=b_name,
        brand_description=b_desc,
        candidate_description=c_desc,
        brand_keywords=brand_keywords
    )

    # Logo comparison
    logo_comp = compare_logos(brand_logo_ref, c_logo)

    # STEP 3: TYPE-SPECIFIC EVALUATION
    if c_type in ("lookalike_domain", "domain"):
        domain_val = c_user_pkg or c_name
        stem = domain_val.split(":")[0].split("/")[0].split(".")[0] if "." in domain_val else domain_val
        domain_name_comp = compare_names(b_name, stem, is_handle=False)
        scoring = calculate_domain_risk(
            brand_name=b_name,
            domain_name=domain_val,
            name_comp=domain_name_comp,
            text_comp=text_comp,
            metadata=c_meta
        )
        if not c_meta.get("is_resolved", False) or c_meta.get("dns_status") == "nxdomain":
            decision = "unregistered_candidate"
            is_threat = False
        elif scoring.total_score >= 40.0:
            decision = "potential_impersonation"
            is_threat = True
        else:
            decision = ExclusionDecision.INSUFFICIENT_EVIDENCE.value
            is_threat = False

    elif c_type in ("phishing_url", "url"):
        scoring = calculate_phishing_risk(
            brand_name=b_name,
            target_url=c_url or c_user_pkg or c_name,
            name_comp=name_comp,
            text_comp=text_comp,
            metadata=c_meta
        )
        if c_meta.get("feed_source"):
            decision = ExclusionDecision.CONFIRMED_PHISHING.value
            is_threat = True
        elif scoring.total_score >= 50.0:
            decision = ExclusionDecision.SUSPICIOUS_NEEDS_REVIEW.value
            is_threat = True
        elif scoring.total_score >= 30.0:
            decision = ExclusionDecision.POTENTIAL_IMPERSONATION.value
            is_threat = True
        else:
            decision = ExclusionDecision.INSUFFICIENT_EVIDENCE.value
            is_threat = False

    elif c_type in ("social_profile", "social"):
        handle_comp = compare_names(b_name, c_user_pkg or "", is_handle=True)
        scoring = calculate_social_risk(
            brand_name=b_name,
            name_comp=name_comp,
            handle_comp=handle_comp,
            logo_comp=logo_comp,
            text_comp=text_comp,
            metadata=c_meta
        )
        if scoring.total_score < 40.0 and not name_comp.is_exact_match:
            decision = ExclusionDecision.INSUFFICIENT_EVIDENCE.value
            is_threat = False
        else:
            decision = ExclusionDecision.POTENTIAL_IMPERSONATION.value
            is_threat = True

    else: # mobile_app
        # Publisher check
        pub_norm = normalize_text(c_pub or "")
        publisher_mismatch = False
        if official_publishers:
            publisher_mismatch = pub_norm not in official_publishers
        elif c_pub and b_name:
            publisher_mismatch = normalize_text(b_name) not in pub_norm

        # Package ID signals
        pkg_norm = normalize_package_id(c_user_pkg or "")
        brand_clean = normalize_username(b_name)
        brand_words = [tok for tok in normalize_text(b_name).split() if len(tok) >= 4]
        pkg_signals = 0.0
        if brand_clean and brand_clean in pkg_norm:
            pkg_signals = 0.9
        elif any(w in pkg_norm for w in brand_words):
            pkg_signals = 0.8
        elif any(normalize_username(kw) in pkg_norm for kw in brand_keywords if kw):
            pkg_signals = 0.7

        # Telemetry / corroborating evidence
        corroborating = 0.0
        downloads = c_meta.get("downloads", 0)
        rating = c_meta.get("rating", 0.0)
        if downloads is not None and downloads < 500 and name_comp.overall_similarity > 0.6:
            corroborating += 0.5
        if c_meta.get("suspicious_permissions"):
            corroborating += 0.5
        corroborating = min(1.0, corroborating)

        scoring = calculate_app_risk(
            brand_name=b_name,
            name_comp=name_comp,
            logo_comp=logo_comp,
            text_comp=text_comp,
            publisher_mismatch=publisher_mismatch,
            publisher_name=c_pub,
            package_signals=pkg_signals,
            package_id=c_user_pkg,
            corroborating_score=corroborating,
            metadata=c_meta
        )
        if scoring.total_score < 40.0 and not name_comp.is_exact_match:
            decision = ExclusionDecision.INSUFFICIENT_EVIDENCE.value
            is_threat = False
        else:
            decision = ExclusionDecision.POTENTIAL_IMPERSONATION.value
            is_threat = True

    return DetectionResult(
        decision=decision,
        is_threat=is_threat,
        risk_score=scoring.total_score,
        risk_level=scoring.risk_level,
        detection_reasons=scoring.detection_reasons,
        signal_breakdown=[s.to_dict() for s in scoring.signals],
        evidence_summary=scoring.evidence_summary,
        matched_asset_id=None
    )
