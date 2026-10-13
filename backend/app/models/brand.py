import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List
from sqlalchemy import String, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.brand_asset import BrandAsset
    from app.models.scan import ScanRun
    from app.models.finding import Finding


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    primary_website: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    assets: Mapped[List["BrandAsset"]] = relationship("BrandAsset", back_populates="brand", cascade="all, delete-orphan")
    scans: Mapped[List["ScanRun"]] = relationship("ScanRun", back_populates="brand", cascade="all, delete-orphan")
    findings: Mapped[List["Finding"]] = relationship("Finding", back_populates="brand", cascade="all, delete-orphan")
