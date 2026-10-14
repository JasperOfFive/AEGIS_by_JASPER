import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Any
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.brand import Brand
    from app.models.candidate import CandidateObservation
    from app.models.finding import Finding


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ScanRun(Base):
    __tablename__ = "scan_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_id: Mapped[str] = mapped_column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False, index=True)
    requested_source_types: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="queued", nullable=False, index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_candidates_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_findings_flagged: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failure_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    brand: Mapped["Brand"] = relationship("Brand", back_populates="scans")
    source_results: Mapped[List["ScanSourceResult"]] = relationship("ScanSourceResult", back_populates="scan_run", cascade="all, delete-orphan")
    observations: Mapped[List["CandidateObservation"]] = relationship("CandidateObservation", back_populates="scan_run", cascade="all, delete-orphan")
    findings: Mapped[List["Finding"]] = relationship("Finding", back_populates="scan_run")

    @property
    def brand_name(self) -> str | None:
        return self.brand.name if self.brand else None


class ScanSourceResult(Base):
    __tablename__ = "scan_source_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_run_id: Mapped[str] = mapped_column(String(36), ForeignKey("scan_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    source_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="success", nullable=False)
    records_collected: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    scan_run: Mapped["ScanRun"] = relationship("ScanRun", back_populates="source_results")
