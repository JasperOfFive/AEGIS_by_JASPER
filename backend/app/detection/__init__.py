from app.detection.normalization import (
    normalize_unicode,
    normalize_text,
    normalize_username,
    normalize_domain,
    normalize_package_id,
    resolve_homoglyphs,
)
from app.detection.name_similarity import compare_names
from app.detection.text_similarity import compare_descriptions
from app.detection.logo_similarity import compare_logos
from app.detection.official_exclusion import evaluate_official_exclusion, ExclusionDecision
from app.detection.risk_scoring import calculate_social_risk, calculate_app_risk
from app.detection.engine import evaluate_candidate, DetectionResult

__all__ = [
    "normalize_unicode",
    "normalize_text",
    "normalize_username",
    "normalize_domain",
    "normalize_package_id",
    "resolve_homoglyphs",
    "compare_names",
    "compare_descriptions",
    "compare_logos",
    "evaluate_official_exclusion",
    "ExclusionDecision",
    "calculate_social_risk",
    "calculate_app_risk",
    "evaluate_candidate",
    "DetectionResult",
]
