# AEGIS Demonstration & Evaluation Script

Follow this step-by-step walkthrough to demonstrate the core capabilities of the AEGIS Digital Risk Protection Platform.

---

## Preparation (1-Click Setup)

1. Start both Backend and Frontend (see `README.md` or `./start.sh`).
2. Open the AEGIS Dashboard in your browser: `http://localhost:5173`.
3. In the sidebar, click the **⚡ Seed Demo & Scan** button.
   - *What happens*: The system registers "Acme Finance Group", associates its official digital assets (domains, Instagram account, Google Play app package, publisher signature, trademark logo), and launches an immediate multi-source threat scan.

---

## Demonstration Flow

### Step 1: Executive Dashboard & Threat Landscape
- Point out the **Live KPI Cards**: Protected Brands, Active Impersonation Threats, Discovered Entities, Automated Scans.
- Review the **Threat Severity Distribution** donut chart showing calibrated tiers (Critical, High, Medium, Low).
- Review the **Vector Breakdown** showing distribution across Instagram, Google Play, Apple App Store, Facebook, TikTok, LinkedIn, and YouTube.

### Step 2: Zero False-Positive Official Exclusion Guarantee
- Navigate to **Protected Brands** (`/brands`) and click **Acme Finance Group**.
- Review the **Registered Official Assets**:
  - Social: `@acmefinance` (Instagram)
  - Mobile App: `com.acme.finance.app` (Google Play)
  - Publisher: `Acme Financial Group LLC`
  - Trademark: `acme_official_logo_v1`
- **Key Point for Judges**: The detection engine discovered `@acmefinance` on Instagram and `com.acme.finance.app` on Google Play during the scan, but **neither appears in the threat findings list**.
- They were automatically recognized as `CONFIRMED_OFFICIAL_MATCH` and excluded with a risk score of 0.0.

### Step 3: Threat Triage Workbench (`/findings`)
Navigate to **Threat Triage** and demonstrate key threat archetypes:

1. **Customer Care / Phishing Scam**:
   - Find candidate `@acmefinance_helpdesk` on Facebook.
   - Click **Triage / Inspect**.
   - Show the **Side-by-Side Comparison**: Legitimate Brand vs Suspect Profile.
   - Point out the **Detection Signals**:
     - Affix scam keywords detected: `helpdesk`, `customer care`, `complaint cell`.
     - Cloned official logo reference.
     - Soliciting user DMs / WhatsApp.
     - Risk Score: **85+/100 (CRITICAL)**.

2. **1-Character Typosquatting Profile**:
   - Inspect `@acmefinaance` (Instagram).
   - Point out the Single-Character Typo detection signal (extra 'a' inserted).
   - Risk Score: **70+/100 (CRITICAL)**.

3. **Character Transposition Look-Alike**:
   - Inspect `@amcefinance` (LinkedIn).
   - Point out the Adjacent Character Transposition signal (`amce` for `acme`).
   - Risk Score: **65+/100 (HIGH)**.

4. **Malicious Mobile App Impersonator**:
   - Inspect `Acme Mobile Bank : Fast Loans` (`com.acme.quickloan.fastpay`).
   - Point out:
     - Cloned app icon trademark.
     - Publisher mismatch: published by `Digital FinTech Softworks` instead of `Acme Financial Group LLC`.
     - Imitation package namespace.
     - Risk Score: **80+/100 (CRITICAL)**.

5. **Benign Unrelated Entity (False Positive Prevention)**:
   - Filter by Low risk or inspect `@acmeanvils`.
   - Explain why this blacksmith shop sharing the word "Acme" is NOT flagged as a threat (no trademark overlap, no banking bio overlap, no scam affixes).

### Step 4: Human-in-the-Loop Analyst Review & Audit Trail
- Within any open finding modal (e.g. `@acmefinance_helpdesk`):
- Change status to **🚨 Confirmed Threat (Flag for takedown)**.
- Set Analyst name: `sarah_security`.
- Enter analysis comment: *"Confirmed phishing and support impersonation page harvesting account credentials. Escalated to Facebook Brand Protection for domain takedown."*
- Click **Commit Status Update**.
- Notice the **Append-Only Audit Log** updates in real-time with an immutable timestamped entry.
- Demonstrate that previous audit logs are never erased or altered.

### Step 5: Partial Completion & Source Outage Handling
- Navigate to **Scan Operations** (`/scans`).
- Click **Launch New Scan**.
- In the modal, under *Simulate Source Outage (Evaluation Testing)*, select **Simulate Social Media API Outage (HTTP 503)**.
- Click **Launch Scan**.
- Observe the scan run status becomes **Partial Completion** (`partially_completed`).
- Expand the scan details:
  - App Store adapter completed with status `success`.
  - Social Media adapter gracefully caught the simulated error and recorded status `failed` with upstream error diagnostics without crashing the platform.
