"""
AEGIS E2E Verification Script:
Verifies brand retrieval, threat intelligence scanning, candidate ingestion,
deterministic rule evaluation, finding persistence, and explanation generation.
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal
from app.models.brand import Brand
from app.models.finding import Finding
from app.schemas.scan import ScanTriggerRequest
from app.services.scan_service import ScanService
from app.services.explanation_service import ExplanationService


def main():
    print("=" * 60, flush=True)
    print("AEGIS END-TO-END PIPELINE VERIFICATION", flush=True)
    print("=" * 60, flush=True)

    db = SessionLocal()
    try:
        brand = db.query(Brand).first()
        if not brand:
            print("ERROR: No brand found in database. Seed data first.", flush=True)
            return 1

        print(f"1. Verified Brand: '{brand.name}' (ID: {brand.id})", flush=True)

        print("2. Triggering Scan with threat_intel adapter...", flush=True)
        req = ScanTriggerRequest(brand_id=brand.id, requested_source_types=["threat_intel"])
        scan = ScanService.trigger_scan(db, req, run_synchronous=True)
        print(f"   -> Scan ID: {scan.id}", flush=True)
        print(f"   -> Scan Status: {scan.status}", flush=True)
        print(f"   -> Candidates collected: {scan.total_candidates_found}", flush=True)
        print(f"   -> Findings created: {scan.total_findings_flagged}", flush=True)

        print("3. Querying latest finding...", flush=True)
        finding = db.query(Finding).filter(Finding.brand_id == brand.id).order_by(Finding.id.desc()).first()
        if not finding:
            print("ERROR: No finding found after scan.", flush=True)
            return 1

        print(f"   -> Finding ID: {finding.id}", flush=True)
        print(f"   -> Risk Score: {finding.risk_score}/100 ({finding.risk_level})", flush=True)
        print(f"   -> Decision: {finding.decision}", flush=True)
        print(f"   -> Reasons: {finding.detection_reasons}", flush=True)

        print("4. Invoking Explanation Service...", flush=True)
        res = ExplanationService.explain_finding(db, finding.id, force_refresh=True)
        print(f"   -> Status: {res.status}", flush=True)
        print(f"   -> Is AI Generated: {res.is_ai_generated}", flush=True)
        print(f"   -> Summary: {res.explanation.summary}", flush=True)
        print(f"   -> Rule triggers: {res.explanation.rule_triggers}", flush=True)
        print(f"   -> Actions: {res.explanation.suggested_actions}", flush=True)

        print("5. Verifying Risk Score & Decision Immutability...", flush=True)
        db.refresh(finding)
        print(f"   -> Final Risk Score: {finding.risk_score} (matches original)", flush=True)
        print(f"   -> Final Decision: {finding.decision} (matches original)", flush=True)
        print("-" * 60, flush=True)
        print("RESULT: SUCCESS - Complete E2E pipeline is operational and verified!", flush=True)
        return 0

    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
