from datetime import datetime, timezone
from typing import List
from app.adapters.base import BaseSourceAdapter, AdapterResult, NormalizedCandidateRecord
from app.adapters.fixtures.dataset import APP_STORE_FIXTURES
from app.core.logging import logger


class AppStoreFixtureAdapter(BaseSourceAdapter):
    """
    Deterministic app store fixture adapter.
    Simulates collection from app repositories (Google Play, Apple App Store).
    Clearly labeled as fixture data in provenance and metadata.
    """

    @property
    def source_name(self) -> str:
        return "app_store_fixture_adapter"

    @property
    def source_type(self) -> str:
        return "app_store"

    @property
    def is_fixture(self) -> bool:
        return True

    def collect(
        self,
        brand_name: str,
        brand_id: str,
        simulate_failure: bool = False
    ) -> AdapterResult:
        started_at = datetime.now(timezone.utc)
        logger.info(f"AppStoreFixtureAdapter collecting records for brand '{brand_name}' (simulate_failure={simulate_failure})")

        if simulate_failure:
            completed_at = datetime.now(timezone.utc)
            return AdapterResult(
                source_name=self.source_name,
                source_type=self.source_type,
                status="failed",
                records_collected=0,
                candidates=[],
                started_at=started_at,
                completed_at=completed_at,
                error_message="Simulated store catalog crawler error: upstream service unavailable (HTTP 502 Bad Gateway)."
            )

        candidates: List[NormalizedCandidateRecord] = []
        brand_token = brand_name.lower().replace(" ", "")

        for item in APP_STORE_FIXTURES:
            app_name = item["app_name"]
            package_id = item["package_id"]
            publisher = item["publisher"]
            desc = item["description"]
            url = item["listing_url"]

            if "acme" not in brand_name.lower():
                app_name = app_name.replace("Acme", brand_name).replace("acme", brand_token)
                package_id = package_id.replace("acme", brand_token)
                if desc:
                    desc = desc.replace("Acme", brand_name).replace("acme", brand_token)

            record = NormalizedCandidateRecord(
                candidate_type="mobile_app",
                platform=item["store"],
                display_name=app_name,
                username_or_package=package_id,
                publisher_or_developer=publisher,
                description=desc,
                external_url=url,
                logo_reference=item["logo_reference"],
                source_provenance=item["provenance"],
                metadata_json={
                    "downloads": item["downloads"],
                    "rating": item["rating"],
                    "developer_website": item["developer_website"],
                    "suspicious_permissions": item.get("suspicious_permissions", False),
                    "is_fixture": True,
                    "adapter": self.source_name,
                },
                observed_at=datetime.now(timezone.utc)
            )
            candidates.append(record)

        completed_at = datetime.now(timezone.utc)
        return AdapterResult(
            source_name=self.source_name,
            source_type=self.source_type,
            status="success",
            records_collected=len(candidates),
            candidates=candidates,
            started_at=started_at,
            completed_at=completed_at,
            error_message=None
        )
