# AEGIS — Digital Risk Protection Platform

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.114+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/TailwindCSS-4.3+-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-38%20Passed%20(100%25)-success.svg)]()

> **AEGIS** is an enterprise-grade Digital Risk Protection Platform (DRPP) specifically focused on **Social Media and Mobile App Impersonation Monitoring**, typosquatting discovery, trademark protection, and official-asset exclusion.

---

## Evaluation Priorities Coverage

| Weight | Challenge Area | AEGIS Implementation |
| :--- | :--- | :--- |
| **30%** | **Social Media Monitoring** | Deterministic multi-platform adapter simulating and live querying Instagram, Facebook, TikTok, LinkedIn, YouTube, GitHub with real-world threat archetypes (1-char typos, transpositions, affix scams, lookalike logos, sparse records). |
| **30%** | **App Store Monitoring** | Mobile store adapter supporting Google Play and Apple App Store covering publisher mismatches, package ID imitation, cloned launcher icons, and permission anomalies. |
| **15%** | **Brand Profile & Official Assets** | Full CRUD for brand portfolios and official digital assets. Pre-exclusion engine guaranteeing 0% false positives on registered official accounts, package IDs, domains, and publishers. |
| **15%** | **User Experience & Error Handling** | Cyber dark and light mode command center, Recharts telemetry, side-by-side identity comparator, append-only review audit logs, and Apinex DeepSeek AI explanation. |
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
│   │   ├── adapters/                   # Extensible source collection layer (Apple, Play Store, GitHub, ThreatFox)
│   │   ├── services/                   # Business logic, asset management, and Apinex DeepSeek explanation
│   │   ├── workers/                    # ScanRunner orchestrator
│   │   ├── security/                   # SSRF protection, URL validation, and upload validation
│   │   └── api/                        # REST API routes (Health, Dashboard, Brands, Scans, Findings, Reviews, Demo)
│   ├── alembic/                        # Database migrations (SQLite batch support)
│   ├── tests/                          # 38 pytest unit, integration, and evaluation benchmark tests
│   ├── requirements.txt                # Python dependencies
│   └── .env.example                    # Sanitized environment template
├── frontend/
│   ├── src/
│   │   ├── services/                   # API services, FastAPI schema adapters, and AI evidence client
│   │   │   ├── apiService.ts           # Centralized REST client connecting to FastAPI backend
│   │   │   ├── adapters.ts             # Schema adapters translating backend payloads to UI models
│   │   │   └── aiEvidenceService.ts    # Apinex DeepSeek AI explanation client
│   │   ├── context/AegisContext.tsx    # Live state provider with optimistic UI and backend synchronization
│   │   ├── components/                 # UI components, layout shell, target cursor, animations
│   │   │   ├── dashboard/              # KpiCards, RiskDistributionChart, ScanActivityCard, RecentFindingsTable
│   │   │   ├── findings/               # FindingDetailDrawer with AI explanation & triage actions
│   │   │   ├── layout/                 # AppShell, Sidebar, Topbar
│   │   │   ├── react-bits/             # TargetCursor, GradientWaves, MetallicPaint, LogoLoop, TiltedCard, Lanyard
│   │   │   ├── scans/                  # ScanWizardModal for targeted multi-surface probing
│   │   │   └── ui/                     # SeverityBadge, StatusBadge, radial-glow-button, spotlight-navbar
│   │   ├── pages/                      # LandingPage, AuthPage, DashboardOverview, Brands, Social, Apps, ThreatIntel, Findings, Scans, Reports, Settings
│   │   └── types/                      # TypeScript domain interfaces
│   ├── package.json
│   ├── vite.config.ts                  # Vite config with backend /api proxy
│   └── .env.example
├── sample_data/                        # Sample scenario datasets and threat archetypes
├── docs/                               # Architecture, detection methodology, API guide, demo script
├── start.sh                            # Unified single-command launcher
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

To execute the full test suite (38 unit, integration, live adapter, and evaluation benchmark tests):

```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest -v
```

All 38 tests pass with 100% precision:
- `tests/unit/test_normalization.py` (6 tests): Unicode NFKD, punctuation stripping, homoglyphs.
- `tests/unit/test_name_similarity.py` (6 tests): Transpositions, 1-char typos, support affix abuse.
- `tests/unit/test_official_exclusion.py` (3 tests): Confirmed official match exclusion vs lookalike impostor retention.
- `tests/unit/test_risk_scoring.py` (2 tests): Multi-signal weights, threshold calibrations.
- `tests/unit/test_live_adapters.py` (6 tests): Apple App Store, Google Play, GitHub API parsing, deduplication, official exclusions.
- `tests/unit/test_explanation_service.py` (9 tests): Apinex DeepSeek integration, rate limiting, caching, fallback resiliency.
- `tests/integration/test_ai_routes.py` (3 tests): AI status and finding explanation endpoints.
- `tests/integration/test_api_workflow.py` (1 test): End-to-end API lifecycle, scan runner, and review audit logging.
- `tests/evaluation/test_evaluation_dataset.py` (2 tests): Benchmark measuring 0% false positives on official assets and accurate detection of high-risk lookalikes.

---

## Live Prototype Highlights

1. **⚡ 1-Click Seed & Scan**: Click the glowing button in the sidebar to populate Acme Finance Group, register 5 official assets, and run an automated scan discovering 7 threats and verifying official exclusions.
2. **Side-by-Side Comparator**: Open any threat in the Triage Workbench to compare official brand properties against suspect profiles.
3. **Immutable Audit Trail**: Triage threats by confirming, investigating, or resolving them with permanent analyst audit trails.
4. **Fault Injection Simulation**: Simulate upstream social media (503) or app store (502) outages in the Scan modal to observe partial completion handling.
