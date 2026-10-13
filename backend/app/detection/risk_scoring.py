from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.detection.name_similarity import NameComparisonResult
from app.detection.text_similarity import TextComparisonResult
from app.detection.logo_similarity import LogoComparisonResult
from app.detection.normalization import normalize_text, normalize_username


@dataclass
class SignalResult:
    signal_name: str
    category: str
    score_contribution: float
    max_weight: float
    raw_score: float
    observed_value: Optional[str]
    target_value: Optional[str]
    explanation: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "signal_name": self.signal_name,
            "category": self.category,
            "score_contribution": round(self.score_contribution, 2),
            "max_weight": round(self.max_weight, 2),
            "raw_score": round(self.raw_score, 4),
            "observed_value": self.observed_value,
            "target_value": self.target_value,
            "explanation": self.explanation,
        }


@dataclass
class ScoringResult:
    total_score: float       # 0.0 - 100.0
    risk_level: str          # low, medium, high, critical
    signals: List[SignalResult]
    detection_reasons: List[str]
    evidence_summary: str


def determine_risk_level(score: float) -> str:
    if score >= 80.0:
        return "critical"
    elif score >= 60.0:
        return "high"
    elif score >= 30.0:
        return "medium"
    return "low"


def calculate_social_risk(
    brand_name: str,
    name_comp: NameComparisonResult,
    handle_comp: NameComparisonResult,
    logo_comp: LogoComparisonResult,
    text_comp: TextComparisonResult,
    metadata: Dict[str, Any]
) -> ScoringResult:
    signals: List[SignalResult] = []
    reasons: List[str] = []

    # 1. Display name similarity (max 25)
    name_score = name_comp.overall_similarity * settings.WEIGHT_SOCIAL_NAME
    name_expl = f"Display name similarity is {name_comp.overall_similarity:.1%} (Levenshtein: {name_comp.levenshtein_ratio:.1%}, Token: {name_comp.token_sort_ratio:.1%})"
    if name_comp.is_exact_match:
        name_expl = f"Exact match with brand name '{brand_name}'."
        reasons.append(f"Profile display name exactly duplicates official brand name '{brand_name}'.")
    elif name_comp.is_transposition:
        name_expl = f"Character transposition detected compared to '{brand_name}'."
        reasons.append(f"Character transposition detected in display name: '{name_comp.candidate_name}'.")
    elif name_comp.is_single_typo:
        name_expl = f"Single-character typo detected compared to '{brand_name}'."
        reasons.append(f"Single-character typo detected in display name: '{name_comp.candidate_name}'.")
    elif name_comp.has_suspicious_affix:
        affixes_str = ", ".join(name_comp.matched_affixes)
        name_expl = f"Display name appends high-risk term(s): {affixes_str}."
        reasons.append(f"Display name includes suspicious scam keywords ({affixes_str}).")

    signals.append(SignalResult(
        signal_name="Display Name Similarity",
        category="name",
        score_contribution=name_score,
        max_weight=settings.WEIGHT_SOCIAL_NAME,
        raw_score=name_comp.overall_similarity,
        observed_value=name_comp.candidate_name,
        target_value=brand_name,
        explanation=name_expl
    ))

    # 2. Handle / Username similarity (max 25)
    handle_score = handle_comp.overall_similarity * settings.WEIGHT_SOCIAL_HANDLE
    handle_expl = f"Username handle similarity is {handle_comp.overall_similarity:.1%}."
    if handle_comp.is_exact_match:
        handle_expl = "Handle exactly matches brand keyword."
        reasons.append(f"Username '@{handle_comp.candidate_name}' exactly matches brand name.")
    elif handle_comp.is_transposition:
        handle_expl = "Handle contains transposed characters (typosquatting)."
        reasons.append(f"Username typosquatting: transposed letters in '@{handle_comp.candidate_name}'.")
    elif handle_comp.is_single_typo:
        handle_expl = "Handle differs by only 1 letter from brand keyword."
        reasons.append(f"Username typosquatting: 1-character typo in '@{handle_comp.candidate_name}'.")
    elif handle_comp.has_suspicious_affix:
        affixes_str = ", ".join(handle_comp.matched_affixes)
        handle_expl = f"Username combines brand with keywords: {affixes_str}."
        reasons.append(f"Username '@{handle_comp.candidate_name}' combines brand with scam affixes ({affixes_str}).")

    signals.append(SignalResult(
        signal_name="Handle Typosquatting & Similarity",
        category="handle",
        score_contribution=handle_score,
        max_weight=settings.WEIGHT_SOCIAL_HANDLE,
        raw_score=handle_comp.overall_similarity,
        observed_value=f"@{handle_comp.candidate_name}" if handle_comp.candidate_name else None,
        target_value=f"@{name_comp.normalized_target}",
        explanation=handle_expl
    ))

    # 3. Logo similarity (max 20)
    logo_score = logo_comp.similarity_score * settings.WEIGHT_SOCIAL_LOGO
    signals.append(SignalResult(
        signal_name="Trademark & Iconography Similarity",
        category="logo",
        score_contribution=logo_score,
        max_weight=settings.WEIGHT_SOCIAL_LOGO,
        raw_score=logo_comp.similarity_score,
        observed_value=logo_comp.candidate_logo_ref,
        target_value=logo_comp.brand_logo_ref,
        explanation=logo_comp.explanation
    ))
    if logo_comp.similarity_score >= 0.8:
        reasons.append("Account uses identical or cloned brand trademark logo.")

    # 4. Description / Bio similarity (max 15)
    bio_score = text_comp.overall_score * settings.WEIGHT_SOCIAL_BIO
    bio_expl = f"Bio text overlap score is {text_comp.overall_score:.1%}."
    if text_comp.brand_keywords_found:
        bio_expl += f" Mentions brand keywords: {', '.join(text_comp.brand_keywords_found)}."
    signals.append(SignalResult(
        signal_name="Bio & Description Overlap",
        category="description",
        score_contribution=bio_score,
        max_weight=settings.WEIGHT_SOCIAL_BIO,
        raw_score=text_comp.overall_score,
        observed_value=text_comp.candidate_description[:80] + "..." if len(text_comp.candidate_description) > 80 else text_comp.candidate_description,
        target_value=text_comp.brand_description[:80] if text_comp.brand_description else None,
        explanation=bio_expl
    ))

    # 5. Suspicious extra terms or impersonation claims (max 10)
    scam_score = 0.0
    scam_phrases = text_comp.suspicious_phrases_found
    if scam_phrases:
        scam_score = min(settings.WEIGHT_SOCIAL_SUSPICIOUS_TERMS, len(scam_phrases) * 5.0)
        reasons.append(f"Explicit customer support or scam keywords detected in profile bio: {', '.join(scam_phrases)}.")
    signals.append(SignalResult(
        signal_name="Impersonation & Scam Phrasing",
        category="claims",
        score_contribution=scam_score,
        max_weight=settings.WEIGHT_SOCIAL_SUSPICIOUS_TERMS,
        raw_score=min(1.0, scam_score / settings.WEIGHT_SOCIAL_SUSPICIOUS_TERMS),
        observed_value=", ".join(scam_phrases) if scam_phrases else "None",
        target_value="None",
        explanation=f"Profile bio contains {len(scam_phrases)} high-risk support/scam phrasing triggers." if scam_phrases else "No blatant support scam triggers detected in profile bio."
    ))

    # 6. Corroborating metadata (max 5)
    # E.g. claims verification badge without authorization, or very low follower count masquerading as official
    follower_count = metadata.get("follower_count")
    claimed_verified = metadata.get("claimed_verified", False)
    meta_score = 0.0
    meta_notes = []

    if claimed_verified:
        meta_score += 3.0
        meta_notes.append("Profile claims verified status")
    if follower_count is not None and follower_count < 100 and (name_comp.overall_similarity > 0.7 or handle_comp.overall_similarity > 0.7):
        meta_score += 2.0
        meta_notes.append(f"Low engagement ({follower_count} followers) posing as major brand")
        reasons.append(f"Suspiciously low follower count ({follower_count}) for an official brand representation.")

    signals.append(SignalResult(
        signal_name="Account Provenance & Metadata Signals",
        category="metadata",
        score_contribution=meta_score,
        max_weight=settings.WEIGHT_SOCIAL_METADATA,
        raw_score=meta_score / settings.WEIGHT_SOCIAL_METADATA,
        observed_value=f"followers={follower_count}, claimed_verified={claimed_verified}",
        target_value="verified_legitimate",
        explanation="; ".join(meta_notes) if meta_notes else "Standard account metadata observed."
    ))

    raw_total = sum(s.score_contribution for s in signals)
    total_score = min(100.0, max(0.0, round(raw_total, 1)))
    risk_level = determine_risk_level(total_score)

    summary_parts = []
    if reasons:
        summary_parts.append("; ".join(reasons[:2]))
    summary_parts.append(f"Assessed risk score of {total_score}/100 ({risk_level.upper()}).")
    evidence_summary = " ".join(summary_parts)

    return ScoringResult(
        total_score=total_score,
        risk_level=risk_level,
        signals=signals,
        detection_reasons=reasons,
        evidence_summary=evidence_summary
    )


def calculate_app_risk(
    brand_name: str,
    name_comp: NameComparisonResult,
    logo_comp: LogoComparisonResult,
    text_comp: TextComparisonResult,
    publisher_mismatch: bool,
    publisher_name: Optional[str],
    package_signals: float, # 0.0 - 1.0
    package_id: Optional[str],
    corroborating_score: float, # 0.0 - 1.0
    metadata: Dict[str, Any]
) -> ScoringResult:
    signals: List[SignalResult] = []
    reasons: List[str] = []

    # 1. App name similarity (max 25)
    name_score = name_comp.overall_similarity * settings.WEIGHT_APP_NAME
    name_expl = f"Application title similarity is {name_comp.overall_similarity:.1%}."
    if name_comp.is_exact_match:
        name_expl = f"App title exactly matches brand name '{brand_name}'."
        reasons.append(f"Mobile application title duplicates brand name '{brand_name}'.")
    elif name_comp.is_single_typo or name_comp.is_transposition:
        reasons.append(f"Mobile application title typosquats brand name: '{name_comp.candidate_name}'.")
    elif name_comp.has_suspicious_affix:
        reasons.append(f"App title combines brand name with sensitive financial/service terms ({', '.join(name_comp.matched_affixes)}).")

    signals.append(SignalResult(
        signal_name="App Name Similarity",
        category="name",
        score_contribution=name_score,
        max_weight=settings.WEIGHT_APP_NAME,
        raw_score=name_comp.overall_similarity,
        observed_value=name_comp.candidate_name,
        target_value=brand_name,
        explanation=name_expl
    ))

    # 2. App logo / icon similarity (max 20)
    logo_score = logo_comp.similarity_score * settings.WEIGHT_APP_LOGO
    signals.append(SignalResult(
        signal_name="App Icon Trademark Similarity",
        category="logo",
        score_contribution=logo_score,
        max_weight=settings.WEIGHT_APP_LOGO,
        raw_score=logo_comp.similarity_score,
        observed_value=logo_comp.candidate_logo_ref,
        target_value=logo_comp.brand_logo_ref,
        explanation=logo_comp.explanation
    ))
    if logo_comp.similarity_score >= 0.8:
        reasons.append("App uses identical or deceptive variant of the official brand icon.")

    # 3. Description similarity (max 15)
    desc_score = text_comp.overall_score * settings.WEIGHT_APP_DESCRIPTION
    signals.append(SignalResult(
        signal_name="Store Listing Description Overlap",
        category="description",
        score_contribution=desc_score,
        max_weight=settings.WEIGHT_APP_DESCRIPTION,
        raw_score=text_comp.overall_score,
        observed_value=text_comp.candidate_description[:80] + "..." if len(text_comp.candidate_description) > 80 else text_comp.candidate_description,
        target_value=text_comp.brand_description[:80] if text_comp.brand_description else None,
        explanation=f"Description token overlap and brand keyword presence scored {text_comp.overall_score:.1%}."
    ))

    # 4. Publisher mismatch (max 15)
    pub_score = settings.WEIGHT_APP_PUBLISHER_MISMATCH if publisher_mismatch else 0.0
    pub_expl = f"App is released by unverified publisher '{publisher_name}' rather than official organization." if publisher_mismatch else "Publisher verified as registered official entity."
    if publisher_mismatch:
        reasons.append(f"Developer/Publisher '{publisher_name}' does not match registered official organization.")
    signals.append(SignalResult(
        signal_name="Publisher / Developer Discrepancy",
        category="publisher",
        score_contribution=pub_score,
        max_weight=settings.WEIGHT_APP_PUBLISHER_MISMATCH,
        raw_score=1.0 if publisher_mismatch else 0.0,
        observed_value=publisher_name,
        target_value="Official Registered Publisher",
        explanation=pub_expl
    ))

    # 5. Package ID & Brand-keyword signals (max 10)
    pkg_score = package_signals * settings.WEIGHT_APP_PACKAGE_SIGNALS
    pkg_expl = f"Package identifier '{package_id}' incorporates brand namespace or imitation pattern." if package_signals > 0.5 else f"Package ID: {package_id}."
    if package_signals > 0.7:
        reasons.append(f"Package ID '{package_id}' mimics official namespace without authorization.")
    signals.append(SignalResult(
        signal_name="Package ID / Namespace Imitation",
        category="package",
        score_contribution=pkg_score,
        max_weight=settings.WEIGHT_APP_PACKAGE_SIGNALS,
        raw_score=package_signals,
        observed_value=package_id,
        target_value="Official Package ID",
        explanation=pkg_expl
    ))

    # 6. Other corroborating evidence (max 15)
    # E.g. Missing privacy policy, low downloads + high rating anomalies, suspicious permissions, store warnings
    corroborating_val = corroborating_score * settings.WEIGHT_APP_CORROBORATING
    signals.append(SignalResult(
        signal_name="Listing Telemetry & Security Signals",
        category="telemetry",
        score_contribution=corroborating_val,
        max_weight=settings.WEIGHT_APP_CORROBORATING,
        raw_score=corroborating_score,
        observed_value=f"downloads={metadata.get('downloads')}, rating={metadata.get('rating')}",
        target_value="standard_clean_app",
        explanation="Suspicious distribution metrics or unverified app developer credentials observed." if corroborating_score > 0.5 else "Standard app store telemetry."
    ))

    raw_total = sum(s.score_contribution for s in signals)
    total_score = min(100.0, max(0.0, round(raw_total, 1)))
    risk_level = determine_risk_level(total_score)

    summary_parts = []
    if reasons:
        summary_parts.append("; ".join(reasons[:2]))
    summary_parts.append(f"Overall assessed risk score: {total_score}/100 ({risk_level.upper()}).")
    evidence_summary = " ".join(summary_parts)

    return ScoringResult(
        total_score=total_score,
        risk_level=risk_level,
        signals=signals,
        detection_reasons=reasons,
        evidence_summary=evidence_summary
    )


def calculate_domain_risk(
    brand_name: str,
    domain_name: str,
    name_comp: NameComparisonResult,
    text_comp: TextComparisonResult,
    metadata: Dict[str, Any]
) -> ScoringResult:
    """
    Deterministic risk scoring for lookalike domains.
    Considers typosquatting, live DNS resolution, MX records, combosquatting keywords,
    page title / content overlap, and parking heuristics.
    """
    signals: List[SignalResult] = []
    reasons: List[str] = []

    is_resolved = metadata.get("is_resolved", False)
    dns_status = metadata.get("dns_status", "nxdomain")
    resolved_ips = metadata.get("resolved_ips", [])
    has_mx = metadata.get("has_mx", False)
    is_parked = metadata.get("is_parked", False)
    technique = metadata.get("technique", "similarity")
    http_title = metadata.get("http_title") or ""

    # 1. Domain Name Similarity & Permutation Signal (max 25)
    name_score = name_comp.overall_similarity * 25.0
    name_expl = f"Domain name stem similarity to '{brand_name}' is {name_comp.overall_similarity:.1%} (technique: {technique})."
    if name_comp.is_exact_match:
        reasons.append(f"Domain stem exactly matches brand name '{brand_name}'.")
    elif name_comp.is_transposition:
        reasons.append(f"Domain typosquatting: character transposition detected in '{domain_name}'.")
    elif name_comp.is_single_typo:
        reasons.append(f"Domain typosquatting: 1-character typo detected in '{domain_name}'.")

    signals.append(SignalResult(
        signal_name="Domain Typosquatting & Permutation",
        category="name",
        score_contribution=name_score,
        max_weight=25.0,
        raw_score=name_comp.overall_similarity,
        observed_value=domain_name,
        target_value=brand_name,
        explanation=name_expl
    ))

    # 2. Live DNS & Active Routable IP (max 25)
    # A generated candidate domain that is unregistered (NXDOMAIN) MUST NOT be a confirmed threat!
    dns_score = 0.0
    if is_resolved and dns_status == "active":
        dns_score = 25.0
        reasons.append(f"Domain is actively resolved to public IP(s): {', '.join(resolved_ips[:2])}.")
        dns_expl = f"Active DNS resolution verified on {len(resolved_ips)} public IP(s)."
    elif dns_status == "nxdomain":
        dns_score = 0.0
        dns_expl = "Domain does not resolve (NXDOMAIN); inactive / hypothetical candidate."
    else:
        dns_score = 5.0
        dns_expl = f"DNS resolution status: {dns_status}."

    signals.append(SignalResult(
        signal_name="Active DNS & Infrastructure Resolution",
        category="infrastructure",
        score_contribution=dns_score,
        max_weight=25.0,
        raw_score=dns_score / 25.0,
        observed_value=f"status={dns_status}, ips={', '.join(resolved_ips[:2])}",
        target_value="active_public_ip",
        explanation=dns_expl
    ))

    # 3. MX Record Presence (Phishing Email Weaponization) (max 15)
    mx_score = 15.0 if has_mx and is_resolved else 0.0
    if has_mx and is_resolved:
        reasons.append("Domain configures mail exchange (MX) records, indicating high potential for email impersonation.")
    signals.append(SignalResult(
        signal_name="Mail Exchanger (MX) Telemetry",
        category="email_security",
        score_contribution=mx_score,
        max_weight=15.0,
        raw_score=1.0 if has_mx else 0.0,
        observed_value=f"has_mx={has_mx}",
        target_value="no_mx_spoofing",
        explanation="Active mail exchanger detected on lookalike domain." if has_mx else "No active mail exchanger detected."
    ))

    # 4. Combosquatting & Deceptive Affixes (max 15)
    deceptive_keywords = ["login", "verify", "secure", "auth", "portal", "banking", "support", "wallet", "claim"]
    matched_affixes = [kw for kw in deceptive_keywords if kw in domain_name.lower()]
    combo_score = min(15.0, len(matched_affixes) * 7.5)
    if matched_affixes:
        reasons.append(f"Domain combines brand identity with high-risk authentication keywords: {', '.join(matched_affixes)}.")
    signals.append(SignalResult(
        signal_name="Combosquatting & Deceptive Intent",
        category="intent",
        score_contribution=combo_score,
        max_weight=15.0,
        raw_score=combo_score / 15.0,
        observed_value=", ".join(matched_affixes) if matched_affixes else "None",
        target_value="clean_domain",
        explanation=f"Combosquatting keywords detected: {', '.join(matched_affixes)}." if matched_affixes else "No deceptive authentication keywords found."
    ))

    # 5. Website Content / Brand Title Overlap & Parking Detection (max 15)
    content_score = 0.0
    content_expl = "No active website content retrieved."
    if is_parked:
        content_score = 0.0
        content_expl = "Parked holding / sales page detected; low immediate threat."
        reasons.append("Domain appears to be parked or listed for sale; no active weaponized content.")
    elif http_title:
        title_lower = http_title.lower()
        brand_clean = brand_name.lower()
        if brand_clean in title_lower:
            content_score = 15.0
            reasons.append(f"Live website title explicitly references brand name: '{http_title}'.")
            content_expl = f"Page title matches brand: '{http_title}'."
        else:
            content_score = 5.0
            content_expl = f"Page title retrieved: '{http_title}'."

    signals.append(SignalResult(
        signal_name="Website Content & Parking Analysis",
        category="content",
        score_contribution=content_score,
        max_weight=15.0,
        raw_score=content_score / 15.0,
        observed_value=f"parked={is_parked}, title={http_title[:50]}",
        target_value="legitimate_content",
        explanation=content_expl
    ))

    # 6. Telemetry & Suspicious TLD (max 5)
    suspicious_tlds = [".online", ".xyz", ".top", ".info", ".support", ".app", ".site"]
    tld_score = 3.0 if any(domain_name.endswith(tld) for tld in suspicious_tlds) else 0.0
    signals.append(SignalResult(
        signal_name="TLD Risk Profile",
        category="telemetry",
        score_contribution=tld_score,
        max_weight=5.0,
        raw_score=tld_score / 5.0,
        observed_value=domain_name.split(".")[-1] if "." in domain_name else "unknown",
        target_value="trusted_tld",
        explanation="Domain uses high-abuse or low-cost TLD." if tld_score > 0 else "Standard TLD."
    ))

    raw_total = sum(s.score_contribution for s in signals)

    # CRITICAL RULE: If domain is inactive/NXDOMAIN, cap risk score below threat threshold!
    if not is_resolved or dns_status == "nxdomain":
        total_score = min(20.0, raw_total * 0.4)
    elif is_parked:
        total_score = min(35.0, raw_total * 0.5)
    else:
        # Check if there is actual brand impersonation or typosquatting evidence
        has_impersonation_signal = (
            name_comp.is_exact_match or 
            name_comp.is_single_typo or 
            name_comp.is_transposition or 
            name_comp.overall_similarity >= 0.70 or 
            len(matched_affixes) > 0 or 
            (http_title and brand_name.lower() in http_title.lower())
        )
        if not has_impersonation_signal:
            # Unrelated business or generic overlap without deceptive intent: cap at <= 35.0
            total_score = min(35.0, raw_total * 0.6)
        else:
            total_score = min(100.0, max(0.0, round(raw_total, 1)))

    risk_level = determine_risk_level(total_score)

    summary_parts = []
    if reasons:
        summary_parts.append("; ".join(reasons[:2]))
    summary_parts.append(f"Assessed domain risk score: {total_score}/100 ({risk_level.upper()}).")
    evidence_summary = " ".join(summary_parts)

    return ScoringResult(
        total_score=total_score,
        risk_level=risk_level,
        signals=signals,
        detection_reasons=reasons,
        evidence_summary=evidence_summary
    )


def calculate_phishing_risk(
    brand_name: str,
    target_url: str,
    name_comp: NameComparisonResult,
    text_comp: TextComparisonResult,
    metadata: Dict[str, Any]
) -> ScoringResult:
    """
    Deterministic explainable risk scoring for phishing URLs.
    Evaluates multiple independent indicators:
    1. Threat Intelligence Feed validation (live vs cached provenance)
    2. Credential collection and wallet-drainer path analysis
    3. Deceptive subdomain structure and shared cloud application hosting
    4. Brand identity token spoofing in hostname
    5. URL query structure and open redirect telemetry

    Safety Invariants:
    - A credential path alone NEVER establishes malice without brand spoofing.
    - A shared brand word alone NEVER establishes impersonation without harvesting intent.
    - Unlisted zero-day phishing on shared platforms is caught via multi-signal corroboration.
    """
    from urllib.parse import urlparse
    signals: List[SignalResult] = []
    reasons: List[str] = []

    feed_source = metadata.get("feed_source") or metadata.get("feed")
    is_live_ingest = metadata.get("is_live_ingest", False)
    is_cached = metadata.get("is_cached", not is_live_ingest) if feed_source else False
    cached_at = metadata.get("cached_at") or metadata.get("observed_at") or "2026-10-13T12:00:00Z"
    has_credential_path = metadata.get("has_credential_path", False)
    threat_type = metadata.get("threat_type") or "phishing_url"
    raw_path = metadata.get("url_path") or ""
    raw_host = metadata.get("hostname") or ""

    # Parse URL
    try:
        parsed = urlparse(target_url if "://" in target_url else f"https://{target_url}")
        hostname = (parsed.netloc or raw_host or target_url).lower().split(":")[0]
        url_path = parsed.path.lower() or raw_path.lower()
        url_query = parsed.query.lower()
    except Exception:
        hostname = raw_host.lower() or target_url.lower()
        url_path = raw_path.lower()
        url_query = ""

    # Shared cloud hosting / PaaS platforms frequently abused for zero-day phishing
    SHARED_HOSTING_PLATFORMS = (
        "firebaseapp.com", "web.app", "pages.dev", "workers.dev",
        "vercel.app", "netlify.app", "github.io", "gitlab.io",
        "appspot.com", "glitch.me", "surge.sh", "render.com",
        "supabase.co", "fly.dev", "railway.app", "duckdns.org",
        "ngrok-free.app", "ngrok.io", "loca.lt"
    )

    is_shared_host = any(hostname.endswith(f".{plat}") or hostname == plat for plat in SHARED_HOSTING_PLATFORMS)

    # Brand tokens
    brand_tokens = [tok for tok in normalize_text(brand_name).split() if len(tok) >= 3]
    brand_clean = normalize_username(brand_name)
    host_clean = hostname.replace("-", "").replace(".", "")

    DECEPTIVE_TERMS = [
        "promo", "event", "claim", "airdrop", "reward", "bonus", "login",
        "auth", "verify", "secure", "support", "recovery", "wallet", "seed",
        "desk", "portal", "signin", "ebanking", "update", "direct"
    ]
    matched_deceptive_in_host = [term for term in DECEPTIVE_TERMS if term in hostname]

    # 1. Threat Intelligence Feed Validation (max 30)
    feed_score = 0.0
    if feed_source:
        feed_score = 30.0
        if is_cached:
            reasons.append(f"Matched in cached threat intelligence feed: '{feed_source}' (cached at {cached_at}).")
            feed_expl = f"URL indexed in cached threat archive ({feed_source}). Sourced as {threat_type} (cached index: {cached_at})."
        else:
            reasons.append(f"Confirmed match in live threat intelligence feed: '{feed_source}'.")
            feed_expl = f"URL confirmed in live threat feed ({feed_source}). Classified as {threat_type}."
    else:
        feed_score = 0.0
        feed_expl = "No threat intelligence feed match (heuristic evaluation)."

    signals.append(SignalResult(
        signal_name="Threat Intelligence Feed Validation",
        category="threat_intel",
        score_contribution=feed_score,
        max_weight=30.0,
        raw_score=1.0 if feed_source else 0.0,
        observed_value=f"{feed_source}:cached" if (feed_source and is_cached) else str(feed_source),
        target_value="clean_feed",
        explanation=feed_expl
    ))

    # 2. Deceptive Subdomain & Brand Spoofing in Hostname (max 25)
    host_spoof_score = 0.0
    has_brand_in_host = (brand_clean in host_clean) or any(tok in hostname.split(".")[0] for tok in brand_tokens)

    if brand_clean in host_clean and len(matched_deceptive_in_host) > 0:
        host_spoof_score = 25.0
        reasons.append(f"Hostname mimics brand '{brand_name}' combined with deceptive keywords ({', '.join(matched_deceptive_in_host[:2])}).")
        host_expl = f"Brand identity '{brand_name}' embedded in hostname alongside deceptive terms: {', '.join(matched_deceptive_in_host)}."
    elif has_brand_in_host and is_shared_host and len(matched_deceptive_in_host) > 0:
        host_spoof_score = 25.0
        subdomain_part = hostname.split(".")[0]
        reasons.append(f"Deceptive tenant subdomain '{subdomain_part}' on public cloud host combines brand with sensitive lures ({', '.join(matched_deceptive_in_host[:2])}).")
        host_expl = f"Tenant subdomain '{subdomain_part}' on shared cloud platform ({hostname}) spoofs brand."
    elif has_brand_in_host:
        host_spoof_score = 15.0
        host_expl = f"Brand tokens identified in hostname: {hostname}."
    else:
        host_spoof_score = 0.0
        host_expl = "No direct brand identity spoofing in hostname."

    signals.append(SignalResult(
        signal_name="Brand Identity Spoofing in Hostname",
        category="hostname_spoofing",
        score_contribution=host_spoof_score,
        max_weight=25.0,
        raw_score=host_spoof_score / 25.0,
        observed_value=hostname,
        target_value="official_brand_domain",
        explanation=host_expl
    ))

    # 3. Credential Harvesting & Account Recovery Path Structure (max 25)
    path_score = 0.0
    HARVESTING_ENDPOINTS = [
        "/login", "/auth", "/wallet-recovery", "/verify", "/seed-claim", "/seed",
        "/signin", "/update/password", "/claim/wallet", "/claim", "/wallet",
        "/banking/auth", "/account/verify", "/payment/confirm"
    ]
    is_harvesting_path = has_credential_path or any(endpoint in url_path for endpoint in HARVESTING_ENDPOINTS)

    if is_harvesting_path:
        path_score = 25.0
        reasons.append(f"High-risk credential harvesting endpoint path detected: '{url_path}'.")
        path_expl = f"URL path matches authentication / wallet drainer pattern: {url_path}."
    elif url_path and url_path != "/":
        path_score = 8.0
        path_expl = f"URL includes path structure: {url_path}."
    else:
        path_expl = "Root URL; no credential harvesting endpoint detected."

    signals.append(SignalResult(
        signal_name="Credential Harvesting Path Structure",
        category="path_analysis",
        score_contribution=path_score,
        max_weight=25.0,
        raw_score=path_score / 25.0,
        observed_value=url_path,
        target_value="no_harvesting_path",
        explanation=path_expl
    ))

    # 4. Domain Name Stem Similarity & Phishing Permutation (max 10)
    name_score = min(10.0, name_comp.overall_similarity * 10.0)
    signals.append(SignalResult(
        signal_name="Domain Stem Name Similarity",
        category="name",
        score_contribution=name_score,
        max_weight=10.0,
        raw_score=name_comp.overall_similarity,
        observed_value=name_comp.candidate_name,
        target_value=brand_name,
        explanation=f"Hostname token similarity to brand is {name_comp.overall_similarity:.1%}."
    ))

    # 5. Shared Hosting Context & Deceptive Architecture (max 10)
    hosting_context_score = 0.0
    if is_shared_host and has_brand_in_host:
        hosting_context_score = 10.0
        reasons.append(f"Hosted on public multi-tenant SaaS infrastructure with brand spoofing.")
        hosting_expl = f"URL uses public shared application host ({hostname}) to evade domain registration scrutiny."
    elif feed_source:
        hosting_context_score = 5.0
        hosting_expl = "Corroborated by active threat intelligence records."
    else:
        hosting_context_score = 0.0
        hosting_expl = "Standard hosting infrastructure observed."

    signals.append(SignalResult(
        signal_name="Hosting Context & Infrastructure Risk",
        category="infrastructure",
        score_contribution=hosting_context_score,
        max_weight=10.0,
        raw_score=hosting_context_score / 10.0,
        observed_value=f"shared_host={is_shared_host}",
        target_value="dedicated_verified_host",
        explanation=hosting_expl
    ))

    raw_total = sum(s.score_contribution for s in signals)

    # STRICT SAFETY CAPS TO PREVENT FALSE POSITIVES:
    # 1. A credential-related path alone must NEVER establish that a site is malicious.
    if host_spoof_score == 0.0 and feed_score == 0.0:
        total_score = min(25.0, raw_total * 0.4)
    # 2. A shared brand word in content/path alone must NEVER establish impersonation without harvesting path or deceptive host.
    elif not is_harvesting_path and feed_score == 0.0 and len(matched_deceptive_in_host) == 0:
        total_score = min(25.0, raw_total * 0.4)
    else:
        total_score = min(100.0, max(0.0, round(raw_total, 1)))

    risk_level = determine_risk_level(total_score)

    summary_parts = []
    if reasons:
        summary_parts.append("; ".join(reasons[:2]))
    summary_parts.append(f"Phishing threat risk score: {total_score}/100 ({risk_level.upper()}).")
    evidence_summary = " ".join(summary_parts)

    return ScoringResult(
        total_score=total_score,
        risk_level=risk_level,
        signals=signals,
        detection_reasons=reasons,
        evidence_summary=evidence_summary
    )

