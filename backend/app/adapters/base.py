from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional


@dataclass
class NormalizedCandidateRecord:
    candidate_type: str        # "social_profile" or "mobile_app"
    platform: str              # "instagram", "facebook", "tiktok", "youtube", "linkedin", "google_play", "apple_app_store"
    display_name: str
    username_or_package: Optional[str]
    publisher_or_developer: Optional[str]
    description: Optional[str]
    external_url: Optional[str]
    logo_reference: Optional[str]
    source_provenance: str
    metadata_json: Dict[str, Any] = field(default_factory=dict)
    observed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "candidate_type": self.candidate_type,
            "platform": self.platform,
            "display_name": self.display_name,
            "username_or_package": self.username_or_package,
            "publisher_or_developer": self.publisher_or_developer,
            "description": self.description,
            "external_url": self.external_url,
            "logo_reference": self.logo_reference,
            "source_provenance": self.source_provenance,
            "metadata_json": self.metadata_json,
        }


@dataclass
class AdapterResult:
    source_name: str
    source_type: str           # "social" or "app_store"
    status: str                # "success", "partial", "failed", "skipped"
    records_collected: int
    candidates: List[NormalizedCandidateRecord]
    started_at: datetime
    completed_at: datetime
    error_message: Optional[str] = None


class BaseSourceAdapter(ABC):
    @property
    @abstractmethod
    def source_name(self) -> str:
        """Unique identifier for this adapter source."""
        pass

    @property
    @abstractmethod
    def source_type(self) -> str:
        """Category: 'social' or 'app_store'."""
        pass

    @property
    @abstractmethod
    def is_fixture(self) -> bool:
        """Indicates whether this adapter provides fixture data or live integration."""
        pass

    @abstractmethod
    def collect(
        self,
        brand_name: str,
        brand_id: str,
        simulate_failure: bool = False
    ) -> AdapterResult:
        """Fetch, normalize, and return candidate records."""
        pass
