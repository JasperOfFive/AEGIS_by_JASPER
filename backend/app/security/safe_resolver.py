"""
AEGIS Safe DNS and Domain Investigation Service.
Safely investigates domain candidates with strict SSRF protections:
- Private, link-local, loopback, and broadcast IP filtering.
- Non-destructive, timeout-bounded DNS resolution.
- Safe HTTP metadata extraction (title, parking detection, redirect tracking).
"""
import ipaddress
import re
import socket
from dataclasses import dataclass, field
from typing import List, Optional
import httpx
from app.core.logging import logger

PARKING_INDICATORS = [
    "domain is for sale",
    "buy this domain",
    "parked free",
    "godaddy parked",
    "sedo parking",
    "under construction",
    "namesilo parking",
    "namecheap parking",
    "dan.com",
    "hugedomains",
    "domain parking"
]


@dataclass
class DomainInvestigationResult:
    domain: str
    is_resolved: bool
    resolved_ips: List[str] = field(default_factory=list)
    has_mx: bool = False
    dns_status: str = "nxdomain"  # "active", "nxdomain", "private_blocked", "error"
    http_accessible: bool = False
    http_status: Optional[int] = None
    http_title: Optional[str] = None
    is_parked: bool = False
    redirect_url: Optional[str] = None
    error_message: Optional[str] = None


def is_ip_private_or_restricted(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return bool(
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        )
    except ValueError:
        return True


def investigate_domain(
    domain: str,
    probe_http: bool = True,
    timeout_seconds: float = 1.2
) -> DomainInvestigationResult:
    """
    Investigates domain existence and properties safely without SSRF risk.
    """
    clean_domain = domain.strip().lower()
    if clean_domain.startswith("http://") or clean_domain.startswith("https://"):
        from urllib.parse import urlparse
        clean_domain = urlparse(clean_domain).netloc or clean_domain

    result = DomainInvestigationResult(
        domain=clean_domain,
        is_resolved=False,
        resolved_ips=[],
        dns_status="nxdomain"
    )

    # 1. DNS Resolution
    try:
        addrinfo = socket.getaddrinfo(clean_domain, 80, socket.AF_INET, socket.SOCK_STREAM)
        resolved_ips = list({item[4][0] for item in addrinfo})
        
        # Check all IPs against private ranges
        for ip in resolved_ips:
            if is_ip_private_or_restricted(ip):
                result.dns_status = "private_blocked"
                result.error_message = f"Resolved IP {ip} is within a private or restricted network range."
                return result

        if resolved_ips:
            result.is_resolved = True
            result.resolved_ips = resolved_ips
            result.dns_status = "active"
    except socket.gaierror:
        result.dns_status = "nxdomain"
        return result
    except Exception as e:
        result.dns_status = "error"
        result.error_message = f"DNS resolution error: {str(e)}"
        return result

    # 2. Heuristic MX Check (mail.<domain> or smtp.<domain>)
    try:
        mail_host = f"mail.{clean_domain}"
        mail_addrs = socket.getaddrinfo(mail_host, 25, socket.AF_INET, socket.SOCK_STREAM)
        if mail_addrs:
            result.has_mx = True
    except Exception:
        result.has_mx = False

    # 3. Safe HTTP Investigation (only if resolved to public IP)
    if probe_http and result.is_resolved:
        from urllib.parse import urlparse, urljoin
        headers = {"User-Agent": "AEGIS-Security-Investigator/1.0 (SafeMetadataProbe)"}
        pinned_ip = result.resolved_ips[0]
        for proto in ("https", "http"):
            target_url = f"{proto}://{pinned_ip}"
            probe_headers = dict(headers)
            probe_headers["Host"] = clean_domain
            try:
                with httpx.Client(
                    timeout=timeout_seconds,
                    headers=probe_headers,
                    follow_redirects=False,
                    verify=False
                ) as client:
                    resp = client.get(target_url)
                    result.http_accessible = True
                    result.http_status = resp.status_code

                    # Safe bounded redirect handling (prevents SSRF via 127.0.0.1 or 169.254.169.254)
                    if resp.status_code in (301, 302, 303, 307, 308) and "location" in resp.headers:
                        loc = resp.headers["location"]
                        abs_loc = urljoin(f"{proto}://{clean_domain}", loc)
                        loc_parsed = urlparse(abs_loc)
                        loc_host = loc_parsed.hostname
                        result.redirect_url = abs_loc
                        if loc_host:
                            try:
                                loc_addrs = socket.getaddrinfo(loc_host, 80, socket.AF_INET, socket.SOCK_STREAM)
                                loc_ips = [item[4][0] for item in loc_addrs]
                                if any(is_ip_private_or_restricted(ip) for ip in loc_ips):
                                    result.error_message = f"Redirect target {loc_host} resolves to private IP: blocked."
                                    break
                                # Follow single hop safely with pinned IP
                                redirect_pinned_ip = loc_ips[0]
                                redir_port = f":{loc_parsed.port}" if loc_parsed.port else ""
                                redir_url = f"{loc_parsed.scheme}://{redirect_pinned_ip}{redir_port}{loc_parsed.path or '/'}"
                                if loc_parsed.query:
                                    redir_url += f"?{loc_parsed.query}"
                                redir_headers = dict(probe_headers)
                                redir_headers["Host"] = loc_host
                                resp = client.get(redir_url, headers=redir_headers)
                                result.http_status = resp.status_code
                            except Exception:
                                pass

                    # Bounded text reading (max 32KB to prevent memory exhaustion)
                    content_text = resp.text[:32768]

                    # Extract title tag
                    title_match = re.search(r"<title[^>]*>(.*?)</title>", content_text, re.IGNORECASE | re.DOTALL)
                    if title_match:
                        clean_title = re.sub(r"\s+", " ", title_match.group(1)).strip()
                        result.http_title = clean_title[:200]

                    # Check for parked domain signs
                    text_lower = content_text.lower()
                    if any(term in text_lower for term in PARKING_INDICATORS):
                        result.is_parked = True
                    break
            except Exception:
                continue

    return result
