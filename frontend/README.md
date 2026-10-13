# AEGIS — Digital Risk Protection Platform (DRP)

AEGIS is an enterprise-grade Digital Risk Protection (DRP) and Brand Security Intelligence platform built with **React 19, TypeScript, Vite, Tailwind CSS, Three.js, OGL, and Recharts**. It detects and mitigates phishing websites, typosquatting domains, rogue mobile APKs, executive impersonation profiles, and dark web credential leaks.

---

## 🎨 Visual System & Architecture

The application faithfully recreates the visual hierarchy and color harmony of both AEGIS dashboard designs:
- **Dark Mode (Default):** Deep near-black charcoal background (`#0B0D0C`), champagne-gold accents (`#E8C18B`), fine luminous borders, subtle glass panels, and semantic risk signals (Critical: Rose `#F43F5E`, High: Orange `#F97316`, Medium: Amber `#FBBF24`, Low: Slate `#94A3B8`, Success: Emerald `#10B981`).
- **Light Mode:** Warm ivory background (`#F7F3ED`), pale cream cards, muted gold accents, and deep charcoal typography with high contrast accessibility.

---

## 🚀 Live Integrated UI Components

All 7 required component integrations are active and verified:
1. **Radial Glow Button:** Used for high-impact CTAs, initiating scans (`Run New Scan →`), and action triggers with animated conic radial glow gradients.
2. **Target Cursor (`@react-bits/TargetCursor-JS-CSS`):** Custom four-corner target reticle cursor with spring physics that tracks the pointer and targets interactive elements on desktop.
3. **Lightfall (`@react-bits/Lightfall-JS-CSS`):** WebGL shader simulating celestial streaks of light falling down a tunnel on the public marketing landing page.
4. **Dither Veil (`@react-bits/DitherVeil-JS-CSS`):** Retro dither shader animation for logo treatment and brand elements.
5. **Magic Bento (`@react-bits/MagicBento-JS-CSS`):** Bento card grid showcasing threat detection vectors (phishing URLs, mobile trojans, typosquatting, credential dumps).
6. **Lanyard (`@react-bits/Lanyard-JS-CSS`):** 3D physics-enabled ID card badge swinging in real-time WebGL in the **Creators / About section**.
7. **Flowing Menu (`@react-bits/FlowingMenu-JS-CSS`):** Smooth horizontal marquee interactions for rich navigation.

---

## 🗺️ Application Routes

- `/` — **Public Cinematic Landing Page:** Hero with Lightfall & Dither Veil, full-spectrum threat coverage, interactive mini-dashboard preview, Magic Bento capabilities, and interactive Lanyard badge in Creators & Mission section.
- `/app` — **Overview Dashboard (Matches Reference):**
  - KPI Cards: Monitored Brands (12), Total Findings (248), High Priority (37), Active Scans (3) with mini sparklines.
  - Risk Distribution Donut Chart: Critical (14, 6%), High (37, 15%), Medium (89, 36%), Low (108, 43%) with 7/30/90 day filters.
  - Scan Activity Feed: Real-time progress bars, completion tags, and retry triggers.
  - Recent Findings Table: Source icons, titles, similarity percentages, risk chips, and triage action menus.
  - Threat Intelligence Graph: Entity mapping connecting core brands to rogue profiles, domains, and apps.
- `/app/brands` — **Brand Profiles:** Multi-brand catalog, trademark keywords, risk score meters, and registration modal.
- `/app/social` — **Social Monitoring:** Discovered impersonation accounts across Instagram, TikTok, Facebook, and X.
- `/app/apps` — **App Monitoring:** Trojanized mobile APKs, permissions risk analysis, and malware signature checks.
- `/app/threat-intelligence` — **Full Relational Graph:** Interactive node topology with pan, zoom controls, and detail inspector.
- `/app/findings` — **Findings & Investigations:** Dense filterable table with keyword search, sorting, CSV export, and slide-out Investigation Drawer.
- `/app/scan-history` — **Scan History:** Historical scan audit logs with retry workflows and progress monitors.
- `/app/reports` — **Security Reports:** Executive risk briefing, printable summary, and downloadable report generator.
- `/app/settings` — **Platform Settings:** SecOps analyst profile, team management, alerting webhook rules, and API keys.

---

## 🧪 Simulated Scan & Local Persistence Workflow

- Click **"Run New Scan →"** on the dashboard or top header.
- Select target brand, attack surfaces (domains, social, mobile, darkweb), and scan depth.
- Watch simulated telemetry run in real-time with automated discovery generation and dashboard KPI updates.
- All investigation statuses, new brands, and notes persist in browser `localStorage`.

---

## 💻 Running Locally

```bash
# Clone and enter directory
cd /home/user/aegis-app

# Install dependencies
npm install

# Start development server
npm run dev -- --host 0.0.0.0 --port 5173

# Production build test
npm run build
```
