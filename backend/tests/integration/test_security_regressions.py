import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.core.config import settings
from app.security.safe_resolver import is_ip_private_or_restricted, investigate_domain


def test_reset_authorization_matrix(client: TestClient):
    """
    Test reset authorization: disabled by default, missing token, invalid token, and valid token.
    """
    # 1. Disabled by default (settings.ALLOW_DEMO_RESET is False)
    r_default = client.post("/api/v1/demo/reset", headers={"x-aegis-admin-token": settings.AEGIS_ADMIN_TOKEN})
    assert r_default.status_code == 400
    assert "Database reset is disabled" in r_default.text

    # 2. When reset is enabled via ALLOW_DEMO_RESET=True:
    with patch.object(settings, "ALLOW_DEMO_RESET", True):
        # A. Missing token header
        r_missing = client.post("/api/v1/demo/reset")
        assert r_missing.status_code == 400
        assert "Unauthorized reset attempt" in r_missing.text

        # B. Invalid token
        r_invalid = client.post("/api/v1/demo/reset", headers={"x-aegis-admin-token": "evil_invalid_token"})
        assert r_invalid.status_code == 400
        assert "Unauthorized reset attempt" in r_invalid.text

        # C. Valid token
        r_valid = client.post("/api/v1/demo/reset", headers={"x-aegis-admin-token": settings.AEGIS_ADMIN_TOKEN})
        assert r_valid.status_code == 200
        assert r_valid.json()["success"] is True


def test_cors_origin_validation(client: TestClient):
    """
    Test CORS behavior for allowed and disallowed origins.
    """
    # 1. Allowed origin (e.g. Vite frontend localhost:5173)
    r_allowed = client.options(
        "/api/v1/brands",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert r_allowed.headers.get("access-control-allow-origin") == "http://localhost:5173"

    # 2. Disallowed origin
    r_disallowed = client.options(
        "/api/v1/brands",
        headers={
            "Origin": "http://malicious-attacker.com",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert r_disallowed.headers.get("access-control-allow-origin") is None


def test_ssrf_ip_filtering():
    """
    Test SSRF protections against loopback, private IPv4/IPv6, link-local and cloud metadata IPs.
    """
    test_cases = [
        ("127.0.0.1", True),
        ("127.0.0.2", True),
        ("10.0.0.1", True),
        ("172.16.0.1", True),
        ("192.168.1.1", True),
        ("169.254.169.254", True),  # AWS / GCP metadata
        ("::1", True),              # IPv6 loopback
        ("fc00::1", True),          # IPv6 unique local
        ("fe80::1", True),          # IPv6 link local
        ("0.0.0.0", True),
        ("8.8.8.8", False),         # Public Google DNS
        ("1.1.1.1", False),         # Public Cloudflare DNS
        ("104.21.72.19", False)     # Public Cloudflare IP
    ]
    for ip, expected in test_cases:
        assert is_ip_private_or_restricted(ip) == expected, f"Failed for {ip}"


def test_ssrf_redirect_hop_validation():
    """
    Test that malicious redirects to cloud metadata / private IPs are intercepted and blocked.
    """
    with patch("app.security.safe_resolver.socket.getaddrinfo") as mock_dns:
        def dns_resolver(host, port, *args, **kwargs):
            if host == "benign-redirector.com":
                return [(None, None, None, None, ("104.21.72.19", 80))]
            elif host in ("169.254.169.254", "metadata.internal"):
                return [(None, None, None, None, ("169.254.169.254", 80))]
            return [(None, None, None, None, ("127.0.0.1", 80))]

        mock_dns.side_effect = dns_resolver

        with patch("app.security.safe_resolver.httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            
            mock_resp_1 = MagicMock()
            mock_resp_1.status_code = 302
            mock_resp_1.headers = {"location": "http://169.254.169.254/latest/meta-data/"}
            mock_resp_1.text = "Redirecting..."
            mock_client.get.return_value = mock_resp_1

            inv_res = investigate_domain("benign-redirector.com", probe_http=True)
            assert "resolves to private IP: blocked" in (inv_res.error_message or "")


def test_bounded_response_reading():
    """
    Test that huge HTTP responses do not trigger unconstrained memory allocations.
    """
    with patch("app.security.safe_resolver.socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(None, None, None, None, ("104.21.72.19", 80))]
        with patch("app.security.safe_resolver.httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client

            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.headers = {}
            mock_resp.text = "<title>Bounded Title</title>" + ("X" * 100000)
            mock_client.get.return_value = mock_resp

            inv_res = investigate_domain("hugepage.com", probe_http=True)
            assert inv_res.http_title == "Bounded Title"


def test_dns_rebinding_ip_pinning():
    """
    Test that investigate_domain pins the validated public destination IP
    and sets the Host header, eliminating DNS rebinding vulnerability.
    """
    with patch("app.security.safe_resolver.socket.getaddrinfo") as mock_dns:
        # Pre-validated public IP
        mock_dns.return_value = [(None, None, None, None, ("93.184.216.34", 80))]
        with patch("app.security.safe_resolver.httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.headers = {}
            mock_resp.text = "<title>Safe Test</title>"
            mock_client.get.return_value = mock_resp

            inv_res = investigate_domain("rebind-target.com", probe_http=True)
            assert inv_res.is_resolved is True
            # Verify mock_client was called with pinned IP in target_url
            called_urls = [call.args[0] for call in mock_client.get.call_args_list if call.args]
            assert any("93.184.216.34" in u for u in called_urls)
            # Verify Host header was set to the domain name
            client_kwargs = mock_client_cls.call_args.kwargs
            headers = client_kwargs.get("headers", {})
            assert headers.get("Host") == "rebind-target.com"
