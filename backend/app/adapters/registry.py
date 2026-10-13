from typing import Dict, List
from app.adapters.base import BaseSourceAdapter
from app.adapters.fixtures.social_adapter import SocialMediaFixtureAdapter
from app.adapters.fixtures.app_store_adapter import AppStoreFixtureAdapter
from app.adapters.threat_intel_adapter import ThreatIntelFeedAdapter
from app.adapters.app_store_live_adapter import AppStoreLiveAdapter
from app.adapters.social_live_adapter import SocialMediaLiveAdapter


class AdapterRegistry:
    def __init__(self):
        self._adapters: Dict[str, BaseSourceAdapter] = {}
        self._register_default_adapters()

    def _register_default_adapters(self):
        # Register primary live adapters
        self.register(SocialMediaLiveAdapter())
        self.register(AppStoreLiveAdapter())
        self.register(ThreatIntelFeedAdapter())

        # Register legacy fixture adapters under explicit names
        self.register(SocialMediaFixtureAdapter())
        self.register(AppStoreFixtureAdapter())

    def register(self, adapter: BaseSourceAdapter):
        self._adapters[adapter.source_name] = adapter

    def get_adapter(self, source_name: str) -> BaseSourceAdapter | None:
        return self._adapters.get(source_name)

    def get_adapters_for_types(self, source_types: List[str]) -> List[BaseSourceAdapter]:
        selected = []
        for adapter in self._adapters.values():
            # If specific adapter source_name is in requested types
            if adapter.source_name in source_types:
                selected.append(adapter)
            # If category is requested (e.g. "social", "app_store", "threat_intel")
            elif adapter.source_type in source_types:
                # Prioritize live adapters when standard category name is provided
                if not adapter.is_fixture or not any(a.source_type == adapter.source_type and not a.is_fixture for a in self._adapters.values()):
                    selected.append(adapter)
        return selected

    def list_all(self) -> List[BaseSourceAdapter]:
        return list(self._adapters.values())


registry = AdapterRegistry()
