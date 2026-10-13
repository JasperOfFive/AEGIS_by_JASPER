from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.review import Review
from app.models.finding import Finding
from app.schemas.review import ReviewCreate
from app.core.errors import EntityNotFoundError, bad_request_exception


VALID_STATUSES = {
    "new",
    "under_review",
    "confirmed_threat",
    "false_positive",
    "resolved",
    "ignored"
}


class ReviewService:
    @staticmethod
    def add_review(
        db: Session,
        finding_id: str,
        data: ReviewCreate
    ) -> Review:
        finding = db.scalar(select(Finding).where(Finding.id == finding_id))
        if not finding:
            raise EntityNotFoundError(f"Finding '{finding_id}' not found.")

        new_status = data.new_status.lower().strip()
        if new_status not in VALID_STATUSES:
            raise bad_request_exception(f"Invalid status '{new_status}'. Allowed: {', '.join(VALID_STATUSES)}")

        prev_status = finding.review_status
        now = datetime.now(timezone.utc)

        # Update finding status
        finding.review_status = new_status
        if new_status in ("resolved", "false_positive", "ignored"):
            finding.resolved_at = now
        else:
            finding.resolved_at = None

        # Append-only audit trail record
        review = Review(
            finding_id=finding_id,
            previous_status=prev_status,
            new_status=new_status,
            reviewer=data.reviewer.strip() if data.reviewer else "security_analyst",
            comment=data.comment.strip(),
            created_at=now
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        return review

    @staticmethod
    def get_history(db: Session, finding_id: str) -> List[Review]:
        return db.scalars(
            select(Review).where(Review.finding_id == finding_id).order_by(Review.created_at.desc())
        ).all()
