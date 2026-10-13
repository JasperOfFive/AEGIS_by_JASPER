from app.adapters.base import BaseSourceAdapter, AdapterResult, NormalizedCandidateRecord
from app.adapters.fixtures.social_adapter import SocialMediaFixtureAdapter
from app.adapters.fixtures.app_store_adapter import AppStoreFixtureAdapter
from app.adapters.threat_intel_adapter import ThreatIntelFeedAdapter
from app.adapters.app_store_live_adapter import AppStoreLiveAdapter
from app.adapters.social_live_adapter import SocialMediaLiveAdapter
from app.adapters.registry import registry, AdapterRegistry

__all__ = [
    "BaseSourceAdapter",
    "AdapterResult",
    "NormalizedCandidateRecord",
    "SocialMediaLiveAdapter",
    "AppStoreLiveAdapter",
    "SocialMediaFixtureAdapter",
    "AppStoreFixtureAdapter",
    "ThreatIntelFeedAdapter",
    "registry",
    "AdapterRegistry",
]
