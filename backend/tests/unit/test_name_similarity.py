import pytest
from app.detection.name_similarity import (
    compare_names,
    detect_transposition,
    detect_single_typo,
    detect_suspicious_affixes
)


def test_detect_transposition():
    assert detect_transposition("acme", "amce") is True
    assert detect_transposition("netflix", "netlfix") is True
    assert detect_transposition("google", "google") is False
    assert detect_transposition("acme", "acme_help") is False


def test_detect_single_typo():
    assert detect_single_typo("acmefinance", "acmefinaance") is True # 1 insertion
    assert detect_single_typo("paypal", "paypall") is True
    assert detect_single_typo("amazon", "amazom") is True # 1 substitution
    assert detect_single_typo("acme", "acme") is False


def test_detect_suspicious_affixes():
    has_affix, affixes = detect_suspicious_affixes("acme", "acmefinance_helpdesk")
    assert has_affix is True
    assert "helpdesk" in affixes or "help" in affixes

    has_affix, affixes = detect_suspicious_affixes("acme", "acme_customercare")
    assert has_affix is True
    assert "customercare" in affixes or "care" in affixes

    has_affix, affixes = detect_suspicious_affixes("acme", "acme")
    assert has_affix is False


def test_compare_names_exact_match():
    res = compare_names("Acme Finance", "Acme Finance")
    assert res.is_exact_match is True
    assert res.overall_similarity == 1.0


def test_compare_names_transposition():
    res = compare_names("Acme", "Amce")
    assert res.is_transposition is True
    assert res.overall_similarity >= 0.85


def test_compare_names_scam_affix():
    res = compare_names("Acme", "Acme Official Support")
    assert res.has_suspicious_affix is True
    assert res.overall_similarity >= 0.80
