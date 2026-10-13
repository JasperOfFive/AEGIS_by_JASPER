import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.brand import Brand


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class BrandAsset(Base):
    __tablename__ = "brand_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_id: Mapped[str] = mapped_column(String(36), ForeignKey("brands.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True) 
    platform: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True) 
    normalized_identifier: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    display_value: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    image_reference: Mapped[str | None] = mapped_column(Text, nullable=True)
    verification_status: Mapped[str] = mapped_column(String(32), default="verified", nullable=False) # verified, pending, unverified
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    brand: Mapped["Brand"] = relationship("Brand", back_populates="assets")

    __table_args__ = (
        UniqueConstraint("brand_id", "asset_type", "platform", "normalized_identifier", name="uq_brand_asset_identity"),
    )
