from datetime import datetime, timezone
from typing import List
from app.adapters.base import BaseSourceAdapter, AdapterResult, NormalizedCandidateRecord
from app.adapters.fixtures.dataset import SOCIAL_FIXTURES
from app.core.logging import logger


class SocialMediaFixtureAdapter(BaseSourceAdapter):
    """
    Deterministic social media fixture adapter.
    Simulates collection from platforms such as Instagram, Facebook, TikTok, LinkedIn, YouTube.
    Clearly labeled as fixture data in provenance and metadata.
    """

    @property
    def source_name(self) -> str:
        return "social_media_fixture_adapter"

    @property
    def source_type(self) -> str:
        return "social"

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
        logger.info(f"SocialMediaFixtureAdapter collecting records for brand '{brand_name}' (simulate_failure={simulate_failure})")

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
                error_message="Simulated upstream social media API timeout / rate limit error (HTTP 503)."
            )

        candidates: List[NormalizedCandidateRecord] = []
        brand_token = brand_name.lower().replace(" ", "")

        for item in SOCIAL_FIXTURES:
            # Dynamically adapt fixture brand name if testing an arbitrary brand
            display_name = item["display_name"]
            username = item["username"]
            bio = item["bio"]

            # Replace "Acme" with brand name if target brand is different
            if "acme" not in brand_name.lower():
                display_name = display_name.replace("Acme", brand_name).replace("acme", brand_token)
                username = username.replace("acme", brand_token)
                if bio:
                    bio = bio.replace("Acme", brand_name).replace("acme", brand_token)

            record = NormalizedCandidateRecord(
                candidate_type="social_profile",
                platform=item["platform"],
                display_name=display_name,
                username_or_package=username,
                publisher_or_developer=None,
                description=bio,
                external_url=item["profile_url"],
                logo_reference=item["logo_reference"],
                source_provenance=item["provenance"],
                metadata_json={
                    "follower_count": item["follower_count"],
                    "claimed_verified": item["claimed_verified"],
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
