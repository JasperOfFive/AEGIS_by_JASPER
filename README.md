# AEGIS — Digital Risk Protection Platform

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.114+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-20%20Passed%20(100%25)-success.svg)]()

> **AEGIS** is an enterprise-grade Digital Risk Protection Platform (DRPP) specifically focused on **Social Media and Mobile App Impersonation Monitoring**, typosquatting discovery, trademark protection, and official-asset exclusion.

---

## Evaluation Priorities Coverage

| Weight | Challenge Area | AEGIS Implementation |
| :--- | :--- | :--- |
| **30%** | **Social Media Monitoring** | Deterministic multi-platform adapter simulating Instagram, Facebook, TikTok, LinkedIn, YouTube with real-world threat archetypes (1-char typos, transpositions, affix scams, lookalike logos, sparse records). |
| **30%** | **App Store Monitoring** | Mobile store adapter simulating Google Play and Apple App Store covering publisher mismatches, package ID imitation, cloned launcher icons, and permission anomalies. |
| **15%** | **Brand Profile & Official Assets** | Full CRUD for brand portfolios and official digital assets. Pre-exclusion engine guaranteeing 0% false positives on registered official accounts, package IDs, domains, and publishers. |
| **15%** | **User Experience & Error Handling** | Cyber dark mode command center, Recharts telemetry, side-by-side identity comparator, append-only review audit logs, and simulated outage failover handling. |
| **10%** | **Presentation & Demonstration** | 1-click demo seed & scan button, comprehensive demo script, and structured benchmark evaluations. |

---

## Architecture Overview

```
hackxlerate/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint
│   │   ├── core/                       # Settings, logging, and domain errors
│   │   ├── db/                         # SQLAlchemy session, engine, and init_db
│   │   ├── models/                     # Brand, BrandAsset, ScanRun, Candidate, Finding, Review
│   │   ├── schemas/                    # Pydantic v2 schemas and request models
│   │   ├── detection/                  # Pure deterministic Detection Engine
│   │   │   ├── normalization.py        # Unicode NFKD, homoglyph translation, username & domain normalization
│   │   │   ├── name_similarity.py      # Damerau-Levenshtein, transposition & 1-char typo detection
│   │   │   ├── text_similarity.py      # Description overlap & phishing/support scam keyword matching
│   │   │   ├── logo_similarity.py      # Trademark reference & perceptual hash comparison
│   │   │   ├── official_exclusion.py   # Strict exclusion logic for registered official assets
│   │   │   ├── risk_scoring.py         # Calibrated multi-signal scoring (0 - 100)
│   │   │   └── engine.py               # Master deterministic evaluator
│   │   ├── adapters/                   # Extensible source collection layer
│   │   │   ├── fixtures/               # Rich deterministic datasets for social & app stores
│   │   │   └── registry.py             # Adapter registry
│   │   ├── workers/                    # ScanRunner orchestrator
│   │   ├── security/                   # SSRF protection, URL validation, and upload validation
│   │   └── api/                        # REST API routes (Dashboard, Brands, Scans, Findings, Reviews, Demo)
│   ├── alembic/                        # Database migrations (SQLite batch support)
│   ├── tests/                          # 20 pytest unit, integration, and evaluation benchmark tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.ts               # Typed Axios API client
│   │   ├── components/                 # RiskBadge, StatusBadge, PlatformIcon, FindingDetailModal, etc.
│   │   ├── layouts/Layout.tsx          # Responsive navigation shell with live demo controls
│   │   ├── pages/                      # DashboardPage, BrandsPage, BrandDetailPage, FindingsPage, ScansPage, MethodologyPage
│   │   └── types/                      # Full TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts                  # Vite config with backend proxy
│   └── tailwind.config.js              # Custom cyber risk dark mode theme
├── sample_data/                        # Sample scenario datasets and threat archetypes
├── docs/                               # Architecture, detection methodology, API guide, demo script
└── README.md
```

---

## Quick Start (Running Locally)

### Prerequisites
- Python 3.11 or newer
- Node.js 18+ and npm

### 1. Single-Command Launch (Recommended)

Run the provided helper script:

```bash
chmod +x start.sh
./start.sh
```

### 2. Manual Startup

#### Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
- Open in browser: `http://localhost:5173`

---

## Running Automated Tests

To execute the full test suite (20 unit, integration, and evaluation tests):

```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest -v
```

All 20 tests pass with 100% precision:
- `tests/unit/test_normalization.py`: Unicode NFKD, punctuation stripping, homoglyphs.
- `tests/unit/test_name_similarity.py`: Transpositions, 1-char typos, support affix abuse.
- `tests/unit/test_official_exclusion.py`: Confirmed official match exclusion vs lookalike impostor retention.
- `tests/unit/test_risk_scoring.py`: Multi-signal weights, threshold calibrations.
- `tests/integration/test_api_workflow.py`: End-to-end API lifecycle, scan runner, and review audit logging.
- `tests/evaluation/test_evaluation_dataset.py`: Benchmark measuring 0% false positives on official assets and accurate detection of high-risk lookalikes.

---

## Live Prototype Highlights

1. **⚡ 1-Click Seed & Scan**: Click the glowing button in the sidebar to populate Acme Finance Group, register 5 official assets, and run an automated scan discovering 7 threats and verifying official exclusions.
2. **Side-by-Side Comparator**: Open any threat in the Triage Workbench to compare official brand properties against suspect profiles.
3. **Immutable Audit Trail**: Triage threats by confirming, investigating, or resolving them with permanent analyst audit trails.
4. **Fault Injection Simulation**: Simulate upstream social media (503) or app store (502) outages in the Scan modal to observe partial completion handling.
