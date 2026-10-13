"""
AEGIS Smoke Test: Apinex DeepSeek Integration
Tests actual connectivity to https://api.apinex.bond/v1 using configured credentials.
Never logs or reveals the raw API key.
"""
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import json
import httpx
from app.core.config import settings


def run_smoke_test():
    print("=" * 60, flush=True)
    print("AEGIS APINEX DEEPSEEK LIVE SMOKE TEST", flush=True)
    print("=" * 60, flush=True)

    api_key = settings.APINEX_API_KEY
    base_url = settings.APINEX_BASE_URL
    model = settings.APINEX_MODEL
    timeout = settings.APINEX_TIMEOUT_SECONDS

    masked_key = (api_key[:4] + "..." + api_key[-4:]) if (api_key and len(api_key) > 8) else ("[SET]" if api_key else "[NOT CONFIGURED]")
    
    effective_timeout = max(timeout, 30.0)
    print(f"Provider Base URL : {base_url}", flush=True)
    print(f"Configured Model  : {model}", flush=True)
    print(f"API Key Status    : {masked_key} (length: {len(api_key) if api_key else 0})", flush=True)
    print(f"Timeout Seconds   : {effective_timeout}s", flush=True)
    print("-" * 60, flush=True)

    if not api_key:
        print("RESULT: SKIPPED - APINEX_API_KEY is not configured in backend/.env", flush=True)
        print("AEGIS will operate in deterministic fallback mode (rule-generated explanations).", flush=True)
        return 0

    endpoint = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a cybersecurity risk explanation assistant. Respond strictly with JSON containing a 'status' field."
            },
            {
                "role": "user",
                "content": "Confirm you can explain evidence for an impersonation finding. Respond with JSON: {\"status\": \"operational\", \"model_confirmed\": true}"
            }
        ],
        "temperature": 0.1,
        "max_tokens": 150
    }

    print(f"Sending live test probe to: {endpoint} ...", flush=True)
    try:
        with httpx.Client(timeout=effective_timeout) as client:
            resp = client.post(endpoint, json=payload, headers=headers)
            print(f"HTTP Status Code  : {resp.status_code}", flush=True)
            
            if resp.status_code == 200:
                print("Provider Response Raw:", flush=True)
                print(resp.text[:500], flush=True)
                try:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    print("-" * 60, flush=True)
                    print(f"Extracted Content : {content}", flush=True)
                    print("-" * 60, flush=True)
                    print("RESULT: SUCCESS - Apinex DeepSeek API is fully operational!", flush=True)
                    return 0
                except Exception as e:
                    print(f"Warning: Response was 200 OK but failed JSON parsing: {e}", flush=True)
                    return 1
            else:
                print(f"Provider Error Body: {resp.text[:500]}", flush=True)
                print("-" * 60, flush=True)
                if "policy" in resp.text.lower():
                    print("RESULT: SANDBOX POLICY RESTRICTION - Outbound request blocked by sandbox network policy.", flush=True)
                    print("AEGIS operates seamlessly in deterministic fallback mode (rule-generated explanation).", flush=True)
                elif resp.status_code == 401:
                    print("RESULT: AUTHENTICATION ERROR - Invalid or expired API key.", flush=True)
                elif resp.status_code == 404:
                    print(f"RESULT: MODEL/ENDPOINT NOT FOUND - Provider does not serve model '{model}'.", flush=True)
                elif resp.status_code == 429:
                    print("RESULT: RATE LIMITED - Provider rate limit reached.", flush=True)
                else:
                    print(f"RESULT: HTTP ERROR {resp.status_code} returned by provider.", flush=True)
                return 1

    except httpx.ConnectError as e:
        print(f"RESULT: CONNECTION ERROR - Could not connect to {base_url}.")
        print(f"Details: {e}")
        print("Note: In sandboxed environments or offline setups, outbound network may be restricted.")
        print("AEGIS gracefully uses deterministic rule fallback in this scenario.")
        return 2
    except httpx.TimeoutException:
        print(f"RESULT: TIMEOUT - Provider did not respond within {timeout}s.")
        return 2
    except Exception as e:
        print(f"RESULT: UNEXPECTED ERROR - {type(e).__name__}: {e}")
        return 2


if __name__ == "__main__":
    exit_code = run_smoke_test()
    sys.exit(exit_code)
