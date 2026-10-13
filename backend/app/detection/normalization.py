import re
import unicodedata
from urllib.parse import urlparse

# Common homoglyphs / leetspeak substitutions
HOMOGLYPH_MAP = {
    '0': 'o',
    '1': 'l',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b',
    '@': 'a',
    '$': 's',
    '€': 'e',
    'vv': 'w',
}


def normalize_unicode(text: str) -> str:
    """Normalize unicode characters using NFKD and strip accents/diacritics."""
    if not text:
        return ""
    # Normalize unicode to decomposed form
    decomposed = unicodedata.normalize("NFKD", text)
    # Remove diacritics / combining characters
    stripped = "".join(c for c in decomposed if not unicodedata.combining(c))
    return stripped


def normalize_text(text: str, remove_punctuation: bool = True) -> str:
    """Normalize general text: unicode-normalize, lowercase, collapse whitespace."""
    if not text:
        return ""
    text = normalize_unicode(text).lower().strip()
    if remove_punctuation:
        text = re.sub(r"[^\w\s]|_", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_username(username: str) -> str:
    """
    Normalize username / handle:
    - strip leading '@'
    - unicode normalize & lowercase
    - strip punctuation (dots, underscores, hyphens, spaces)
    """
    if not username:
        return ""
    cleaned = normalize_unicode(username).lower().strip()
    cleaned = cleaned.lstrip("@")
    cleaned = re.sub(r"[\._\-\s]", "", cleaned)
    return cleaned


def resolve_homoglyphs(text: str) -> str:
    """Translate common leetspeak/homoglyphs to ASCII counterparts."""
    text_lower = text.lower()
    for char, replacement in HOMOGLYPH_MAP.items():
        text_lower = text_lower.replace(char, replacement)
    return text_lower


def normalize_domain(domain_or_url: str) -> str:
    """
    Normalize website domain or URL:
    - strip scheme (http, https)
    - strip 'www.'
    - extract hostname, lowercase, strip trailing slash and path
    """
    if not domain_or_url:
        return ""
    raw = domain_or_url.strip()
    if not raw.startswith(("http://", "https://")):
        raw = "https://" + raw
    try:
        parsed = urlparse(raw)
        hostname = parsed.hostname or parsed.path.split("/")[0]
        hostname = hostname.lower().strip()
        if hostname.startswith("www."):
            hostname = hostname[4:]
        return hostname
    except Exception:
        # Fallback regex
        clean = re.sub(r"^https?://(www\.)?", "", domain_or_url.lower().strip())
        return clean.split("/")[0].split(":")[0]


def normalize_package_id(package_id: str) -> str:
    """Normalize app package / bundle ID (e.g. com.acme.app -> com.acme.app)."""
    if not package_id:
        return ""
    return package_id.strip().lower()
