from dataclasses import dataclass
from typing import List, Tuple, Optional
from rapidfuzz import fuzz, distance
from app.detection.normalization import (
    normalize_text,
    normalize_username,
    resolve_homoglyphs
)

SUSPICIOUS_AFFIXES = {
    "support", "help", "care", "customercare", "customer", "desk", "helpdesk",
    "official", "real", "verified", "auth", "security", "team", "claims",
    "agent", "service", "hotline", "chat", "live", "portal", "login", "pay",
    "finance", "refund", "assist", "assistance", "update", "verify"
}


@dataclass
class NameComparisonResult:
    target_name: str
    candidate_name: str
    normalized_target: str
    normalized_candidate: str
    levenshtein_ratio: float      # 0.0 - 1.0
    token_sort_ratio: float       # 0.0 - 1.0
    damerau_ratio: float          # 0.0 - 1.0
    is_exact_match: bool
    is_single_typo: bool          # 1 edit distance
    is_transposition: bool        # Swapped letters
    has_suspicious_affix: bool
    matched_affixes: List[str]
    has_homoglyph_substitution: bool
    overall_similarity: float     # 0.0 - 1.0


def detect_transposition(s1: str, s2: str) -> bool:
    """Detect if s1 and s2 differ by exactly one adjacent character transposition, or if any word tokens differ by transposition."""
    if not s1 or not s2:
        return False
    # Direct match check
    if len(s1) == len(s2) and len(s1) >= 2:
        diffs = [i for i in range(len(s1)) if s1[i] != s2[i]]
        if len(diffs) == 2 and diffs[1] == diffs[0] + 1:
            i, j = diffs
            if s1[i] == s2[j] and s1[j] == s2[i]:
                return True

    # Token-level check
    toks1 = s1.split()
    toks2 = s2.split()
    for t1 in toks1:
        if len(t1) >= 3:
            for t2 in toks2:
                if len(t1) == len(t2):
                    diffs = [i for i in range(len(t1)) if t1[i] != t2[i]]
                    if len(diffs) == 2 and diffs[1] == diffs[0] + 1:
                        i, j = diffs
                        if t1[i] == t2[j] and t1[j] == t2[i]:
                            return True
    return False


def detect_single_typo(s1: str, s2: str) -> bool:
    """Detect if s1 and s2 differ by exactly 1 Levenshtein distance, or if any primary token has 1 edit distance."""
    if not s1 or not s2:
        return False
    dist = distance.Levenshtein.distance(s1, s2)
    if dist == 1:
        return True
    # Token-level check
    toks1 = s1.split()
    toks2 = s2.split()
    for t1 in toks1:
        if len(t1) >= 4:
            for t2 in toks2:
                if len(t2) >= 4 and abs(len(t1) - len(t2)) <= 1:
                    if distance.Levenshtein.distance(t1, t2) == 1:
                        return True
    return False


def detect_suspicious_affixes(target: str, candidate: str) -> Tuple[bool, List[str]]:
    """Detect if candidate contains target name plus known suspicious scam words."""
    norm_target = normalize_username(target)
    norm_candidate = normalize_username(candidate)

    if not norm_target or not norm_candidate:
        return False, []

    matched = []
    # Check if target is inside candidate
    if norm_target in norm_candidate and norm_candidate != norm_target:
        remainder = norm_candidate.replace(norm_target, "")
        for affix in SUSPICIOUS_AFFIXES:
            if affix in remainder:
                matched.append(affix)

    # Check token-based split
    tokens = normalize_text(candidate).split()
    for tok in tokens:
        if tok in SUSPICIOUS_AFFIXES and tok not in normalize_text(target).split():
            if tok not in matched:
                matched.append(tok)

    return len(matched) > 0, matched


def detect_homoglyph_match(target: str, candidate: str) -> bool:
    """Check if candidate matches target after resolving homoglyphs / leetspeak."""
    norm_target = normalize_username(target)
    norm_candidate = normalize_username(candidate)
    
    resolved_target = resolve_homoglyphs(norm_target)
    resolved_candidate = resolve_homoglyphs(norm_candidate)
    
    if resolved_target == resolved_candidate and norm_target != norm_candidate:
        return True
    return False


def compare_names(target: str, candidate: str, is_handle: bool = False) -> NameComparisonResult:
    """Comprehensive comparison between target brand name/handle and candidate name/handle."""
    if is_handle:
        norm_target = normalize_username(target)
        norm_cand = normalize_username(candidate)
    else:
        norm_target = normalize_text(target)
        norm_cand = normalize_text(candidate)

    if not norm_target or not norm_cand:
        return NameComparisonResult(
            target_name=target,
            candidate_name=candidate,
            normalized_target=norm_target,
            normalized_candidate=norm_cand,
            levenshtein_ratio=0.0,
            token_sort_ratio=0.0,
            damerau_ratio=0.0,
            is_exact_match=False,
            is_single_typo=False,
            is_transposition=False,
            has_suspicious_affix=False,
            matched_affixes=[],
            has_homoglyph_substitution=False,
            overall_similarity=0.0,
        )

    is_exact = norm_target == norm_cand
    is_trans = detect_transposition(norm_target, norm_cand)
    is_typo = detect_single_typo(norm_target, norm_cand)
    has_affix, matched_affixes = detect_suspicious_affixes(target, candidate)
    has_homoglyph = detect_homoglyph_match(target, candidate)

    # Standard metrics normalized to 0.0 - 1.0
    lev_ratio = distance.Levenshtein.normalized_similarity(norm_target, norm_cand)
    dam_ratio = distance.DamerauLevenshtein.normalized_similarity(norm_target, norm_cand)
    tok_ratio = fuzz.token_sort_ratio(norm_target, norm_cand) / 100.0

    # Overall similarity calculation
    if is_exact:
        overall = 1.0
    elif is_trans or is_typo or has_homoglyph:
        # Very high similarity because it's an intentional typo/transposition
        overall = max(dam_ratio, lev_ratio, 0.88)
    elif has_affix and norm_target in norm_cand:
        # Brand name embedded with scam words
        overall = max(0.85, tok_ratio)
    else:
        # Weighted combination of token sort and character distance
        overall = (tok_ratio * 0.6) + (dam_ratio * 0.4)

    return NameComparisonResult(
        target_name=target,
        candidate_name=candidate,
        normalized_target=norm_target,
        normalized_candidate=norm_cand,
        levenshtein_ratio=round(lev_ratio, 4),
        token_sort_ratio=round(tok_ratio, 4),
        damerau_ratio=round(dam_ratio, 4),
        is_exact_match=is_exact,
        is_single_typo=is_typo,
        is_transposition=is_trans,
        has_suspicious_affix=has_affix,
        matched_affixes=matched_affixes,
        has_homoglyph_substitution=has_homoglyph,
        overall_similarity=round(overall, 4),
    )
