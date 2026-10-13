# AEGIS Architecture & Technical Design

## 1. Executive Summary

**AEGIS** is an enterprise Digital Risk Protection Platform (DRPP) specifically engineered for automated **Social Media and Mobile App Impersonation Monitoring**.

The system enables organizations to:
1. Register comprehensive brand profiles with authorized digital identities (domains, social handles, app package IDs, developer signatures, and logo trademarks).
2. Scan external social profiles (Instagram, Facebook, TikTok, LinkedIn, YouTube) and mobile app distribution repositories (Google Play, Apple App Store).
3. Detect potential brand impersonation, typosquatting (1-character typos, character transpositions), and support scams.
4. Eliminate false positives via explicit, platform-aware **Official-Asset Exclusion**.
5. Conduct human-in-the-loop triage with an append-only, immutable audit trail.

---

## 2. System Architecture

AEGIS is built as a **Modular Monolith**:

```
+---------------------------------------------------------------------------------+
|                                AEGIS FRONTEND                                   |
|   React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts         |
|   (Dashboard, Brand Assets Manager, Threat Workbench, Scan Ops, Methodology)     |
+---------------------------------------+-----------------------------------------+
                                        | HTTP / JSON API (/api/v1)
                                        v
+---------------------------------------------------------------------------------+
|                                AEGIS BACKEND                                    |
|   FastAPI + Pydantic v2 + SQLAlchemy 2.x + SQLite                               |
|                                                                                 |
|  +--------------------+   +-----------------------+   +----------------------+  |
|  |     API Routers    |-->|   Service Workflows   |-->|   SQLAlchemy Models  |  |
|  |  (Brands, Scans,   |   |   (BrandService,      |   |   (brands, assets,   |  |
|  |   Findings, etc.)  |   |    ScanRunner, etc.)  |   |    scans, reviews)   |  |
|  +--------------------+   +-----------+-----------+   +----------------------+  |
|                                       |                                          |
|                                       | Evaluates Normalized Records             |
|                                       v                                          |
|  +---------------------------------------------------------------------------+  |
|  |                       PURE DETERMINISTIC DETECTION ENGINE                 |  |
|  |  * Text & Unicode Normalization (NFKD, homoglyph mapping)                 |  |
|  |  * Name & Handle Similarity (Levenshtein, Damerau, Transpositions, Typos) |  |
|  |  * Trademark & Logo Analysis (Perceptual Hash, Variant Clones)           |  |
|  |  * Bio & Scam Phrasing Analysis (Token Overlap, Support Affixes)          |  |
|  |  * Official-Asset Exclusion (Confirmed Official Match Guarantee)          |  |
|  |  * Multi-Signal Calibrated Risk Scoring (0 - 100)                         |  |
|  +---------------------------------------------------------------------------+  |
|                                       ^                                          |
|                                       | Normalizes Candidate Records             |
|  +------------------------------------+--------------------------------------+  |
|  |                           SOURCE ADAPTER LAYER                            |  |
|  |  * SocialMediaFixtureAdapter (Instagram, Facebook, TikTok, YouTube, etc.) |  |
|  |  * AppStoreFixtureAdapter (Google Play, Apple App Store)                   |  |
|  |  * Fault Injection Simulator (Upstream timeout / 503 / 502 handling)     |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 3. Database Schema

- **`brands`**: Organizations registered for continuous digital risk protection.
- **`brand_assets`**: Official verified domains, social handles, app package IDs, developer signatures, and trademark images. Enforces unique constraint per `(brand_id, asset_type, platform, normalized_identifier)`.
- **`scan_runs`**: Orchestrated scans with status (`queued`, `running`, `completed`, `partially_completed`, `failed`), candidate counts, and failure details.
- **`scan_source_results`**: Per-source execution metrics (records collected, latency, status, error message).
- **`candidates`**: Normalized observed entities. Deduplicated by `(platform, username_or_package)`.
- **`candidate_observations`**: Temporal telemetry of each observation linked to a scan run.
- **`findings`**: Flagged potential impersonation threats. Deduplicated by `(brand_id, candidate_id)` so repeated scans update `last_detected_at` without duplicating active findings.
- **`reviews`**: Append-only audit trail capturing reviewer handle, previous status, new status, justification, and timestamp.

---

## 4. Security Controls

- **SSRF Prevention**: All external URLs (primary websites, official asset URLs) are validated against private IP ranges, loopback addresses (`127.0.0.1`, `localhost`), and invalid protocols.
- **File Upload Security**: Enforces MIME validation, file size limits (5MB), and sanitizes filenames against directory traversal (`../`).
- **Input Sanitization**: NFKD unicode normalization neutralizes zero-width spaces and visually deceptive homoglyphs.
