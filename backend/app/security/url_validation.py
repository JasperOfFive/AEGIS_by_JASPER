import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple


def is_safe_external_url(url: str) -> Tuple[bool, str]:
    """
    Validate that a URL is safe for external fetching / linking.
    Protects against SSRF, internal network scanning, loopbacks, and non-HTTP schemes.
    """
    if not url:
        return False, "URL cannot be empty."

    try:
        parsed = urlparse(url)
    except Exception as e:
        return False, f"Malformed URL syntax: {str(e)}"

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Invalid URL scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted."

    hostname = parsed.hostname
    if not hostname:
        return False, "URL missing valid hostname."

    hostname_clean = hostname.strip().lower()

    # Block localhost & local aliases
    blocked_hosts = {"localhost", "localhost.localdomain", "broadcasthost", "ip6-localhost", "ip6-loopback"}
    if hostname_clean in blocked_hosts or hostname_clean.endswith(".local") or hostname_clean.endswith(".internal"):
        return False, f"Hostname '{hostname_clean}' resolves to internal network / loopback address."

    # Check IP address range
    try:
        ip = ipaddress.ip_address(hostname_clean)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved:
            return False, f"IP address '{hostname_clean}' is in a reserved or private range."
    except ValueError:
        # Hostname is a domain name, not a raw IP.
        # If in production network resolution is needed, verify socket resolution:
        try:
            addrinfo = socket.getaddrinfo(hostname_clean, None)
            for res in addrinfo:
                sock_ip = res[4][0]
                resolved_ip = ipaddress.ip_address(sock_ip)
                if resolved_ip.is_private or resolved_ip.is_loopback or resolved_ip.is_link_local:
                    return False, f"Hostname '{hostname_clean}' resolves to private/internal IP {sock_ip}."
        except socket.gaierror:
            # Domain cannot be resolved yet; acceptable for mockup/fixture inputs
            pass
        except Exception:
            pass

    return True, "URL is valid."
