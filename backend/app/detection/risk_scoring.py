from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.detection.name_similarity import NameComparisonResult
from app.detection.text_similarity import TextComparisonResult
from app.detection.logo_similarity import LogoComparisonResult


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
