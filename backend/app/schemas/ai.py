from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class AIExplanationStructured(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    summary: str = Field(..., description="High-level analyst summary of why this threat was flagged.")
    rule_triggers: List[str] = Field(default_factory=list, description="Specific deterministic rules that matched.")
    evidence_supported: List[str] = Field(default_factory=list, description="Concrete corroborating evidence confirmed in records.")
    uncertainties: List[str] = Field(default_factory=list, description="Unverified aspects, blindspots, or ambiguities.")
    suggested_actions: List[str] = Field(default_factory=list, description="Actionable human triage and remediation recommendations.")


class AIExplanationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    finding_id: str
    status: str = Field(
        ...,
        description="success, fallback_rule, not_configured, provider_error, timeout, rate_limit, invalid_response"
    )
    is_ai_generated: bool
    model: Optional[str] = None
    generated_at: Optional[datetime] = None
    cached: bool = False
    explanation: AIExplanationStructured
    error_message: Optional[str] = None


class AIStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    configured: bool
    provider: str = "Apinex (DeepSeek)"
    model: str
    base_url: str
    timeout_seconds: float
    status: str # "ready" or "unconfigured"
