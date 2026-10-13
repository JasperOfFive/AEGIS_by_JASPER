import pytest
from app.detection.normalization import (
    normalize_unicode,
    normalize_text,
    normalize_username,
    normalize_domain,
    normalize_package_id,
    resolve_homoglyphs
)


def test_normalize_unicode():
    assert normalize_unicode("Café") == "Cafe"
    assert normalize_unicode("Nétflix") == "Netflix"
    assert normalize_unicode("Асmе") != "" # Cyrillic characters handled


def test_normalize_text():
    assert normalize_text("  Acme   Finance,   Inc.!  ") == "acme finance inc"
    assert normalize_text("Support_Team--24/7") == "support team 24 7"


def test_normalize_username():
    assert normalize_username("@Acme_Official.1") == "acmeofficial1"
    assert normalize_username("acme-help-desk") == "acmehelpdesk"
    assert normalize_username("@acme") == "acme"


def test_normalize_domain():
    assert normalize_domain("https://www.acmefinance.com/login?ref=1") == "acmefinance.com"
    assert normalize_domain("http://acmefinance.com/") == "acmefinance.com"
    assert normalize_domain("acmefinance.com") == "acmefinance.com"


def test_normalize_package_id():
    assert normalize_package_id("  com.Acme.Finance.App  ") == "com.acme.finance.app"


def test_resolve_homoglyphs():
    assert resolve_homoglyphs("g00gle") == "google"
    assert resolve_homoglyphs("p@yp@l") == "paypal"
