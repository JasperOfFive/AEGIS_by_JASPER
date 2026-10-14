import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Dict, Any
from sqlalchemy import String, Text, Float, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.brand import Brand
    from app.models.candidate import Candidate
    from app.models.scan import ScanRun
    from app.models.review import Review


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_id: Mapped[str] = mapped_column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id: Mapped[str] = mapped_column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    scan_run_id: Mapped[str] = mapped_column(String(36), ForeignKey("scan_runs.id"), nullable=False, index=True)
    
    risk_score: Mapped[float] = mapped_column(Float, nullable=False, index=True) # 0.0 - 100.0
    risk_level: Mapped[str] = mapped_column(String(32), nullable=False, index=True) # low, medium, high, critical
    decision: Mapped[str] = mapped_column(String(64), nullable=False, index=True) # potential_impersonation, likely_official_match, confirmed_official_match, insufficient_evidence
    
    detection_reasons: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    signal_breakdown: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    evidence_summary: Mapped[str] = mapped_column(Text, nullable=False)
    
    review_status: Mapped[str] = mapped_column(String(32), default="new", nullable=False, index=True) # new, under_review, confirmed_threat, false_positive, resolved, ignored
    
    first_detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    last_detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Optional Apinex AI Evidence Explanation fields
    ai_explanation: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    ai_explanation_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ai_explanation_generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ai_explanation_evidence_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    ai_explanation_status: Mapped[str | None] = mapped_column(String(32), default="none", nullable=True)

    brand: Mapped["Brand"] = relationship("Brand", back_populates="findings")
    candidate: Mapped["Candidate"] = relationship("Candidate", back_populates="findings")
    scan_run: Mapped["ScanRun"] = relationship("ScanRun", back_populates="findings")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="finding", cascade="all, delete-orphan", order_by="Review.created_at.desc()")

    @property
    def brand_name(self) -> str | None:
        return self.brand.name if self.brand else None

    __table_args__ = (
        UniqueConstraint("brand_id", "candidate_id", name="uq_finding_brand_candidate"),
    )
