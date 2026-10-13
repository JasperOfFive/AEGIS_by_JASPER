# AEGIS Detection Methodology & Scoring Architecture

## 1. Detection Engine Principles

The AEGIS Detection Engine operates under three non-negotiable architectural mandates:

1. **Pure & Deterministic**: The engine has zero dependency on FastAPI request objects or database sessions. Given identical inputs, it produces identical outputs.
2. **Official-Asset Exclusion First**: Registered official identifiers are verified prior to threat scoring. A verified brand asset is **never** flagged as an impersonation threat.
3. **Similarity != Malicious Intent**: High edit-distance or token similarity alone is not sufficient to claim criminal intent. Findings are scored across multiple independent signals with structured explanations.

---

## 2. Official-Asset Exclusion Rules

Before any candidate undergoes risk evaluation, it is compared against all registered official assets:

| Candidate Vector | Exclusion Check | Verdict | Risk Score |
| :--- | :--- | :--- | :--- |
| **Social Profile** | Candidate platform matches registered asset platform AND normalized handle matches exact registered identifier (e.g. `@acmefinance`). | `CONFIRMED_OFFICIAL_MATCH` | **0.0** (Excluded) |
| **Mobile App** | Candidate platform matches registered store AND package/bundle ID matches exact registered identifier (e.g. `com.acme.finance.app`). | `CONFIRMED_OFFICIAL_MATCH` | **0.0** (Excluded) |
| **Mobile App** | Candidate publisher matches registered official publisher AND developer website matches primary domain. | `LIKELY_OFFICIAL_MATCH` | **0.0** (Excluded) |
| **Any Unregistered** | Candidate does not match any registered official identifiers. | `POTENTIAL_IMPERSONATION` | Proceeds to Scoring |

> **Critical Safety Rule**: A matching display name alone does *not* qualify for exclusion, because impostors frequently clone exact brand display names. Strong identifiers (canonical account handle or bundle ID) are mandatory for exclusion.

---

## 3. Calibrated Scoring Weights

### Social Media Profiles (Max 100 Points)

1. **Display-Name Similarity (Max 25 pts)**:
   - Evaluates normalized Levenshtein ratio, Token Sort ratio, and Damerau-Levenshtein distance.
   - Detects character transpositions (`amce` for `acme`) and 1-letter typos.
2. **Handle / Username Typosquatting (Max 25 pts)**:
   - Handles are stripped of `@`, dots, and hyphens.
   - Identifies typosquatting mutations, character deletions, and additions.
3. **Trademark & Logo Analysis (Max 20 pts)**:
   - Compares candidate iconography against official brand trademark references.
   - Detects exact matches, recompressed variants, and cloned logos.
4. **Bio & Description Overlap (Max 15 pts)**:
   - Measures token Jaccard similarity and brand keyword inclusion in profile bio.
5. **Customer Support Scam & Phishing Claims (Max 10 pts)**:
   - Scans for high-risk scam triggers: `customer care`, `helpdesk`, `dm for assistance`, `24/7 support`, `account recovery`, `toll free`, `giveaway`, `airdrop`.
6. **Telemetry & Corroborating Signals (Max 5 pts)**:
   - Flags low engagement (< 100 followers) combined with deceptive official claims, and unverified self-claimed badges.

### Mobile Applications (Max 100 Points)

1. **Application Title Similarity (Max 25 pts)**:
   - Measures title alignment and brand name incorporation.
2. **App Icon Trademark Similarity (Max 20 pts)**:
   - Identifies visual cloning of official app launcher icons.
3. **Store Listing Description Overlap (Max 15 pts)**:
   - Evaluates app description overlap and unauthorized brand usage.
4. **Publisher / Developer Discrepancy (Max 15 pts)**:
   - Awards full discrepancy points if the publisher does not match the registered corporate developer.
5. **Package ID / Namespace Imitation (Max 10 pts)**:
   - Detects brand name imitation in Android reverse-domain package names (e.g. `com.acme.quickloan.fastpay`).
6. **Listing Telemetry & Security Signals (Max 15 pts)**:
   - Analyzes low download counts, review anomalies, missing developer websites, and excessive permissions.

---

## 4. Risk Severity Tiers

- **`0 – 29` (LOW)**: Benign or incidental word overlap. Insufficient evidence of brand intent.
- **`30 – 59` (MEDIUM)**: Moderate similarity requiring monitoring or low-confidence third-party tools.
- **`60 – 79` (HIGH)**: Clear brand targeting, typosquatted handle, or unverified publisher using brand assets.
- **`80 – 100` (CRITICAL)**: High-confidence malicious impersonation combining cloned trademarks, typosquatting, and active customer care or credential harvesting scams.
