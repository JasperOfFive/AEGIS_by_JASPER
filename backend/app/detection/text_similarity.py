import re
from dataclasses import dataclass
from typing import List, Set, Tuple
from rapidfuzz import fuzz
from app.detection.normalization import normalize_text

SUSPICIOUS_BIO_PHRASES = [
    # Fake Customer Support & Helpdesk
    "customer support", "customer care", "help desk", "official account",
    "official page", "dm for assistance", "send direct message", "dm us to resolve",
    "toll free", "helpline", "call now", "whatsapp us", "24/7 support",
    "support desk", "refund department", "complaint cell", "automated care",
    # Credential & Seed Phrase Theft
    "seed phrase", "private key", "mnemonic phrase", "wallet recovery",
    "send phrase", "unlock wallet", "restore account", "enter password",
    # Fraudulent Giveaways & Airdrops
    "claim bonus", "giveaway", "airdrop", "free tokens", "claim reward",
    "promo code bonus", "double your deposit", "token airdrop",
    # Payment Demands & Unlicensed Lending
    "send payment", "instant loan", "fast loan", "quick credit",
    "cashapp transfer", "guaranteed profit", "dm to invest",
    # Urgent Suspension & Verification Coercion
    "account suspended", "urgent verification", "verify immediately",
    "unfreeze account", "security alert verify", "click to unblock"
]


@dataclass
class TextComparisonResult:
    brand_description: str
    candidate_description: str
    token_jaccard_similarity: float
    fuzz_partial_similarity: float
    brand_keywords_found: List[str]
    suspicious_phrases_found: List[str]
    has_high_suspicion_claim: bool
    overall_score: float  # 0.0 - 1.0


def extract_tokens(text: str) -> Set[str]:
    cleaned = normalize_text(text)
    # Filter short stop words
    tokens = {tok for tok in cleaned.split() if len(tok) > 2}
    return tokens


def compare_descriptions(
    brand_name: str,
    brand_description: str | None,
    candidate_description: str | None,
    brand_keywords: List[str] | None = None
) -> TextComparisonResult:
    if not candidate_description:
        return TextComparisonResult(
            brand_description=brand_description or "",
            candidate_description="",
            token_jaccard_similarity=0.0,
            fuzz_partial_similarity=0.0,
            brand_keywords_found=[],
            suspicious_phrases_found=[],
            has_high_suspicion_claim=False,
            overall_score=0.0
        )

    cand_norm = normalize_text(candidate_description)
    brand_norm = normalize_text(brand_description or "")
    
    # 1. Jaccard similarity if brand description is provided
    jaccard = 0.0
    if brand_norm:
        brand_tokens = extract_tokens(brand_norm)
        cand_tokens = extract_tokens(cand_norm)
        if brand_tokens and cand_tokens:
            intersection = brand_tokens.intersection(cand_tokens)
            union = brand_tokens.union(cand_tokens)
            jaccard = len(intersection) / len(union) if union else 0.0

    # 2. Fuzzy partial ratio
    fuzz_partial = 0.0
    if brand_norm:
        fuzz_partial = fuzz.partial_ratio(brand_norm, cand_norm) / 100.0

    # 3. Check for brand name / keywords in candidate description
    brand_tokens = [tok for tok in normalize_text(brand_name).split() if len(tok) >= 4]
    keywords_to_check = [brand_name] + brand_tokens + (brand_keywords or [])
    found_keywords = []
    for kw in keywords_to_check:
        if kw and normalize_text(kw) in cand_norm and normalize_text(kw) not in found_keywords:
            found_keywords.append(kw)

    # 4. Check for suspicious scam phrases in candidate description
    found_suspicious = []
    for phrase in SUSPICIOUS_BIO_PHRASES:
        if phrase in cand_norm:
            found_suspicious.append(phrase)

    # 5. Calculate overall score
    score = 0.0
    if found_keywords:
        score += 0.35
    if found_suspicious:
        score += min(0.40, len(found_suspicious) * 0.20)
    if jaccard > 0.3:
        score += jaccard * 0.25
    elif fuzz_partial > 0.5:
        score += fuzz_partial * 0.20

    score = min(1.0, score)

    return TextComparisonResult(
        brand_description=brand_description or "",
        candidate_description=candidate_description,
        token_jaccard_similarity=round(jaccard, 4),
        fuzz_partial_similarity=round(fuzz_partial, 4),
        brand_keywords_found=found_keywords,
        suspicious_phrases_found=found_suspicious,
        has_high_suspicion_claim=len(found_suspicious) > 0,
        overall_score=round(score, 4)
    )
