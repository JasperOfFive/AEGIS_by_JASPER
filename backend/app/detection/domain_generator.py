"""
AEGIS Domain Permutation and Lookalike Generation Engine.
Generates plausible typosquatting, combosquatting, and impersonation domains
from registered brand names and official domain assets.
"""
from typing import List, Dict, Set, Optional
from urllib.parse import urlparse
from app.detection.normalization import normalize_domain, normalize_username

# Common adjacent QWERTY keyboard keys for substitution typos
KEYBOARD_ADJACENTS = {
    'a': ['q', 'w', 's', 'z'],
    'b': ['v', 'g', 'h', 'n'],
    'c': ['x', 'd', 'f', 'v'],
    'd': ['s', 'e', 'r', 'f', 'x', 'c'],
    'e': ['w', 'r', 's', 'd'],
    'f': ['d', 'r', 't', 'g', 'c', 'v'],
    'g': ['f', 't', 'y', 'h', 'v', 'b'],
    'h': ['g', 'y', 'u', 'j', 'b', 'n'],
    'i': ['u', 'o', 'k', 'j'],
    'j': ['h', 'u', 'i', 'k', 'n', 'm'],
    'k': ['j', 'i', 'o', 'l', 'm'],
    'l': ['k', 'o', 'p'],
    'm': ['n', 'j', 'k'],
    'n': ['b', 'h', 'j', 'm'],
    'o': ['i', 'p', 'k', 'l'],
    'p': ['o', 'l'],
    'q': ['w', 'a'],
    'r': ['e', 't', 'd', 'f'],
    's': ['a', 'w', 'e', 'd', 'z', 'x'],
    't': ['r', 'y', 'f', 'g'],
    'u': ['y', 'i', 'h', 'j'],
    'v': ['c', 'f', 'g', 'b'],
    'w': ['q', 'e', 'a', 's'],
    'x': ['z', 's', 'd', 'c'],
    'y': ['t', 'u', 'g', 'h'],
    'z': ['a', 's', 'x'],
}

# Deceptive prefixes and suffixes frequently used in credential-harvesting phishing
DECEPTIVE_AFFIXES = [
    "login", "verify", "secure", "auth", "portal",
    "banking", "support", "helpdesk", "wallet", "claim",
    "online", "account", "update", "service"
]

# Targeted TLDs commonly seen in brand impersonation campaigns
POPULAR_TLDS = ["com", "net", "org", "online", "info", "xyz", "co", "io", "app"]


def extract_domain_stem(domain_or_name: str) -> tuple[str, str]:
    """
    Extract the core name stem and primary TLD.
    e.g. 'acmefinance.com' -> ('acmefinance', 'com')
    e.g. 'Acme Finance' -> ('acmefinance', 'com')
    """
    cleaned = normalize_domain(domain_or_name)
    if "." in cleaned:
        parts = cleaned.split(".")
        stem = parts[0]
        tld = ".".join(parts[1:])
        return stem, tld
    
    # Pure brand name
    stem = normalize_username(domain_or_name)
    return stem, "com"


def generate_lookalike_domains(
    brand_name: str,
    official_domain: Optional[str] = None,
    max_candidates: int = 50
) -> List[Dict[str, str]]:
    """
    Generates a prioritized list of plausible lookalike domain candidates.
    Returns: List of dicts with {"domain": str, "technique": str, "stem": str}
    """
    candidates: List[Dict[str, str]] = []
    seen: Set[str] = set()

    # Determine base stem
    stem_from_domain, base_tld = extract_domain_stem(official_domain or "") if official_domain else ("", "com")
    stem_from_brand = normalize_username(brand_name)
    
    primary_stem = stem_from_domain if stem_from_domain else stem_from_brand
    if not primary_stem:
        return []

    # Exclude the official domain itself
    if official_domain:
        seen.add(normalize_domain(official_domain))
    seen.add(f"{primary_stem}.{base_tld}")

    def add_candidate(domain: str, technique: str):
        norm = normalize_domain(domain)
        if norm and norm not in seen and "." in norm:
            seen.add(norm)
            candidates.append({
                "domain": norm,
                "technique": technique,
                "stem": primary_stem
            })

    # 1. Combosquatting: Deceptive Affixes with hyphens (e.g. acmefinance-login.com)
    for affix in DECEPTIVE_AFFIXES:
        add_candidate(f"{primary_stem}-{affix}.{base_tld}", "combosquatting_suffix")
        add_candidate(f"{affix}-{primary_stem}.{base_tld}", "combosquatting_prefix")
        add_candidate(f"{primary_stem}{affix}.{base_tld}", "combosquatting_compound")

    # 2. Character Transposition (e.g. acmefinacen.com)
    for i in range(len(primary_stem) - 1):
        swapped = list(primary_stem)
        swapped[i], swapped[i + 1] = swapped[i + 1], swapped[i]
        transposed = "".join(swapped)
        if transposed != primary_stem:
            add_candidate(f"{transposed}.{base_tld}", "character_transposition")

    # 3. Character Omission (e.g. acmfinance.com)
    if len(primary_stem) > 4:
        for i in range(len(primary_stem)):
            omitted = primary_stem[:i] + primary_stem[i + 1:]
            if len(omitted) >= 3:
                add_candidate(f"{omitted}.{base_tld}", "character_omission")

    # 4. Character Duplication (e.g. acmme-finance.com)
    for i in range(len(primary_stem)):
        duplicated = primary_stem[:i] + primary_stem[i] + primary_stem[i:]
        add_candidate(f"{duplicated}.{base_tld}", "character_duplication")

    # 5. Keyboard Adjacent Typos
    for i, ch in enumerate(primary_stem):
        for adj in KEYBOARD_ADJACENTS.get(ch, []):
            typo_stem = primary_stem[:i] + adj + primary_stem[i + 1:]
            add_candidate(f"{typo_stem}.{base_tld}", "keyboard_typo")
            if len(candidates) >= max_candidates:
                break

    # 6. TLD Variations (e.g. acmefinance.online, acmefinance.xyz)
    for tld in POPULAR_TLDS:
        if tld != base_tld:
            add_candidate(f"{primary_stem}.{tld}", "tld_variation")

    return candidates[:max_candidates]
