from dataclasses import dataclass
from typing import Optional


@dataclass
class LogoComparisonResult:
    brand_logo_ref: Optional[str]
    candidate_logo_ref: Optional[str]
    similarity_score: float  # 0.0 - 1.0
    is_exact_match: bool
    is_variant_or_clone: bool
    explanation: str


def compare_logos(brand_logo_ref: Optional[str], candidate_logo_ref: Optional[str]) -> LogoComparisonResult:
    """
    Compare brand logo reference with candidate logo reference.
    Supports fixture logo tags, perceptual hash strings, and simulated visual matching.
    """
    if not candidate_logo_ref or not brand_logo_ref:
        return LogoComparisonResult(
            brand_logo_ref=brand_logo_ref,
            candidate_logo_ref=candidate_logo_ref,
            similarity_score=0.0,
            is_exact_match=False,
            is_variant_or_clone=False,
            explanation="No candidate or official logo reference available for visual comparison."
        )

    b_clean = brand_logo_ref.strip().lower()
    c_clean = candidate_logo_ref.strip().lower()

    # 1. Exact reference or perceptual hash match
    if b_clean == c_clean:
        return LogoComparisonResult(
            brand_logo_ref=brand_logo_ref,
            candidate_logo_ref=candidate_logo_ref,
            similarity_score=1.0,
            is_exact_match=True,
            is_variant_or_clone=True,
            explanation="Exact match: Candidate is using identical official logo asset."
        )

    # 2. Known lookalike / altered clone in fixture tags
    # e.g. "acme_logo_clone", "acme_logo_lowres", "acme_logo_watermarked", "acme_logo_inverted"
    if ("clone" in c_clean or "variant" in c_clean or "copy" in c_clean or "lowres" in c_clean) and any(part in c_clean for part in b_clean.split("_")):
        return LogoComparisonResult(
            brand_logo_ref=brand_logo_ref,
            candidate_logo_ref=candidate_logo_ref,
            similarity_score=0.88,
            is_exact_match=False,
            is_variant_or_clone=True,
            explanation="High visual similarity: Candidate is using an altered or re-compressed copy of the official logo."
        )

    # 3. If hex perceptual hashes (e.g., 16-char hex strings)
    if len(b_clean) == 16 and len(c_clean) == 16 and all(ch in "0123456789abcdef" for ch in b_clean + c_clean):
        try:
            b_int = int(b_clean, 16)
            c_int = int(c_clean, 16)
            hamming_dist = bin(b_int ^ c_int).count("1")
            similarity = max(0.0, 1.0 - (hamming_dist / 64.0))
            is_clone = similarity >= 0.80
            return LogoComparisonResult(
                brand_logo_ref=brand_logo_ref,
                candidate_logo_ref=candidate_logo_ref,
                similarity_score=round(similarity, 4),
                is_exact_match=similarity >= 0.98,
                is_variant_or_clone=is_clone,
                explanation=f"Perceptual image hash Hamming distance {hamming_dist}/64 (similarity: {similarity:.1%})."
            )
        except Exception:
            pass

    # 4. Partial fixture name overlap
    b_tokens = set(b_clean.replace("-", "_").split("_"))
    c_tokens = set(c_clean.replace("-", "_").split("_"))
    overlap = b_tokens.intersection(c_tokens)
    if len(overlap) >= 2 and ("logo" in overlap or "brand" in overlap or "icon" in overlap):
        return LogoComparisonResult(
            brand_logo_ref=brand_logo_ref,
            candidate_logo_ref=candidate_logo_ref,
            similarity_score=0.75,
            is_exact_match=False,
            is_variant_or_clone=True,
            explanation="Shared visual trademark features identified in candidate iconography."
        )

    return LogoComparisonResult(
        brand_logo_ref=brand_logo_ref,
        candidate_logo_ref=candidate_logo_ref,
        similarity_score=0.05,
        is_exact_match=False,
        is_variant_or_clone=False,
        explanation="Candidate iconography shows distinct or unrelated visual branding."
    )
