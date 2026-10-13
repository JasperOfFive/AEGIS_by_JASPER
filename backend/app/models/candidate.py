import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Dict, Any
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.scan import ScanRun
    from app.models.finding import Finding


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True) # "social_profile" or "mobile_app"
    platform: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    canonical_identifier: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    username_or_package: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    publisher_or_developer: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    external_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    logo_reference: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_provenance: Mapped[str] = mapped_column(String(100), nullable=False)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    observations: Mapped[List["CandidateObservation"]] = relationship("CandidateObservation", back_populates="candidate", cascade="all, delete-orphan")
    findings: Mapped[List["Finding"]] = relationship("Finding", back_populates="candidate", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("platform", "username_or_package", name="uq_candidate_platform_identifier"),
    )


class CandidateObservation(Base):
    __tablename__ = "candidate_observations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_run_id: Mapped[str] = mapped_column(String(36), ForeignKey("scan_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id: Mapped[str] = mapped_column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    raw_payload: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    provenance: Mapped[str] = mapped_column(String(100), nullable=False)

    scan_run: Mapped["ScanRun"] = relationship("ScanRun", back_populates="observations")
    candidate: Mapped["Candidate"] = relationship("Candidate", back_populates="observations")
