# AEGIS REST API Reference

Base URL: `http://localhost:8000/api/v1`

---

## 1. System & Health

### `GET /health`
Returns system status, database connectivity, and registered source adapters.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "AEGIS — Digital Risk Protection Platform",
  "version": "1.0.0",
  "database_connected": true,
  "active_adapters": [
    {
      "name": "social_media_fixture_adapter",
      "type": "social",
      "is_fixture": true
    },
    {
      "name": "app_store_fixture_adapter",
      "type": "app_store",
      "is_fixture": true
    }
  ]
}
```

---

## 2. Dashboard Telemetry

### `GET /dashboard/stats`
Returns aggregated KPI metrics, risk severity breakdowns, platform distribution, recent scans, and high-risk threat alerts.

---

## 3. Brand Management

### `GET /brands`
Query Parameters: `active_only` (bool, default `false`).
Lists all registered brands with associated asset counts, scan counts, and flagged threats.

### `POST /brands`
Registers a new protected corporate brand.

**Request Body:**
```json
{
  "name": "Novus Health Corp",
  "description": "Telehealth and prescription delivery platform.",
  "industry": "Healthcare & Digital Health",
  "primary_website": "https://novushealth.example",
  "is_active": true
}
```

### `GET /brands/{brand_id}`
Returns brand details and list of registered official assets.

### `DELETE /brands/{brand_id}`
Cascades and deletes brand and associated assets.

---

## 4. Official Asset Management

### `GET /brands/{brand_id}/assets`
Lists all registered official assets for a brand.

### `POST /brands/{brand_id}/assets`
Registers an authorized official digital asset.

**Request Body:**
```json
{
  "asset_type": "official_social_account",
  "platform": "instagram",
  "display_value": "@novushealth",
  "normalized_identifier": "novushealth",
  "url": "https://instagram.com/novushealth",
  "verification_status": "verified"
}
```

---

## 5. Threat Scans

### `POST /scans`
Launches an automated threat scan for a brand across requested sources.

**Request Body:**
```json
{
  "brand_id": "BRAND_UUID_HERE",
  "requested_source_types": ["social", "app_store"],
  "simulate_unavailable_source": "none"
}
```

**Response (201 Created):**
```json
{
  "id": "SCAN_UUID",
  "brand_id": "BRAND_UUID",
  "status": "completed",
  "total_candidates_found": 14,
  "total_findings_flagged": 7,
  "source_results": [
    {
      "source_name": "social_media_fixture_adapter",
      "status": "success",
      "records_collected": 8
    },
    {
      "source_name": "app_store_fixture_adapter",
      "status": "success",
      "records_collected": 6
    }
  ]
}
```

---

## 6. Threat Findings & Triage

### `GET /findings`
Query Parameters:
- `brand_id`: Filter by brand UUID
- `risk_level`: `critical`, `high`, `medium`, `low`
- `review_status`: `new`, `under_review`, `confirmed_threat`, `false_positive`, `resolved`
- `platform`: `instagram`, `facebook`, `google_play`, `apple_app_store`, etc.
- `page`: Page number (default `1`)
- `page_size`: Items per page (default `25`)

### `GET /findings/{finding_id}`
Returns complete finding details, signal breakdown bars, candidate metadata, and review audit trail history.

### `POST /findings/{finding_id}/reviews`
Appends an immutable audit log entry and updates the finding's triage state.

**Request Body:**
```json
{
  "new_status": "confirmed_threat",
  "reviewer": "sec_analyst_01",
  "comment": "Confirmed lookalike profile typosquatting official brand name and soliciting customer credentials."
}
```

---

## 7. Demo Automation

### `POST /demo/seed`
One-click seed endpoint: creates Acme Finance Group, configures all official digital assets, and runs an immediate scan.

### `POST /demo/reset`
Resets prototype database tables cleanly for fresh testing.
