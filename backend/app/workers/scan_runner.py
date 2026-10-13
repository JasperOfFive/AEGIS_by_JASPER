from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.brand import Brand
from app.models.brand_asset import BrandAsset
from app.models.scan import ScanRun, ScanSourceResult
from app.adapters.registry import registry
from app.adapters.base import BaseSourceAdapter, AdapterResult
from app.services.candidate_service import CandidateService
from app.services.finding_service import FindingService
from app.detection.engine import evaluate_candidate
from app.core.logging import logger


class ScanRunner:
    @staticmethod
    def execute_scan(
        db: Session,
        scan_run_id: str,
        simulate_unavailable_source: Optional[str] = None
    ) -> ScanRun:
        scan = db.scalar(select(ScanRun).where(ScanRun.id == scan_run_id))
        if not scan:
            logger.error(f"ScanRun {scan_run_id} not found.")
            return None

        brand = db.scalar(select(Brand).where(Brand.id == scan.brand_id))
        if not brand:
            scan.status = "failed"
            scan.failure_details = "Associated brand does not exist."
            db.commit()
            return scan

        # Retrieve registered brand assets for official exclusion
        brand_assets = db.scalars(
            select(BrandAsset).where(BrandAsset.brand_id == brand.id)
        ).all()

        # Update status to running
        scan.status = "running"
        scan.started_at = datetime.now(timezone.utc)
        db.commit()

        logger.info(f"Starting scan {scan_run_id} for brand '{brand.name}' with {len(brand_assets)} registered official assets.")

        # Identify target adapters
        adapters: List[BaseSourceAdapter] = registry.get_adapters_for_types(scan.requested_source_types)
        if not adapters:
            adapters = registry.list_all()

        total_candidates_collected = 0
        total_threats_flagged = 0
        has_partial_failures = False
        has_successes = False

        try:
            for adapter in adapters:
                # Check if this adapter is marked for simulated failure
                should_fail = False
                if simulate_unavailable_source:
                    sim_clean = simulate_unavailable_source.lower().strip()
                    if sim_clean in adapter.source_name.lower() or sim_clean in adapter.source_type.lower():
                        should_fail = True

                adapter_res: AdapterResult = adapter.collect(
                    brand_name=brand.name,
                    brand_id=brand.id,
                    simulate_failure=should_fail
                )

                # Persist source result
                source_rec = ScanSourceResult(
                    scan_run_id=scan.id,
                    source_name=adapter_res.source_name,
                    status=adapter_res.status,
                    records_collected=adapter_res.records_collected,
                    started_at=adapter_res.started_at,
                    completed_at=adapter_res.completed_at,
                    error_message=adapter_res.error_message
                )
                db.add(source_rec)
                db.flush()

                if adapter_res.status == "success":
                    has_successes = True
                    total_candidates_collected += len(adapter_res.candidates)

                    for cand_record in adapter_res.candidates:
                        # 1. Upsert candidate
                        candidate = CandidateService.get_or_create(db, cand_record)

                        # 2. Record observation
                        CandidateService.record_observation(
                            db=db,
                            scan_run_id=scan.id,
                            candidate_id=candidate.id,
                            provenance=cand_record.source_provenance,
                            raw_payload=cand_record.to_dict()
                        )

                        # 3. Detection Engine Evaluation
                        detection = evaluate_candidate(
                            brand=brand,
                            brand_assets=brand_assets,
                            candidate=candidate
                        )

                        # 4. If identified as potential impersonation threat, upsert finding
                        if detection.is_threat:
                            FindingService.upsert_finding(
                                db=db,
                                brand_id=brand.id,
                                candidate_id=candidate.id,
                                scan_run_id=scan.id,
                                detection=detection
                            )
                            total_threats_flagged += 1

                elif adapter_res.status == "failed":
                    has_partial_failures = True
                    logger.warning(f"Source adapter '{adapter.source_name}' reported failure: {adapter_res.error_message}")

            # Finalize scan run status
            scan.completed_at = datetime.now(timezone.utc)
            scan.total_candidates_found = total_candidates_collected
            scan.total_findings_flagged = total_threats_flagged

            if has_partial_failures and has_successes:
                scan.status = "partially_completed"
            elif has_partial_failures and not has_successes:
                scan.status = "failed"
                scan.failure_details = "All source adapters encountered failures."
            else:
                scan.status = "completed"

            db.commit()
            db.refresh(scan)
            logger.info(f"Scan {scan_run_id} completed with status '{scan.status}'. Candidates: {total_candidates_collected}, Flagged Threats: {total_threats_flagged}")
            return scan

        except Exception as exc:
            db.rollback()
            try:
                failed_scan = db.scalar(select(ScanRun).where(ScanRun.id == scan_run_id))
                if failed_scan:
                    failed_scan.status = "failed"
                    failed_scan.completed_at = datetime.now(timezone.utc)
                    failed_scan.failure_details = f"Scan execution failure: {str(exc)}"
                    db.commit()
                    return failed_scan
            except Exception as inner:
                logger.error(f"Failed to record scan failure status: {inner}")
            raise
