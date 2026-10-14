from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.review_service import ReviewService
from app.schemas.review import ReviewCreate, ReviewResponse
from app.models.user import User
from app.security.auth import get_current_user

router = APIRouter(prefix="/findings", tags=["Reviews"])


@router.post("/{finding_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_finding_review(finding_id: str, payload: ReviewCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    review = ReviewService.add_review(db, finding_id, payload, user.id)
    return ReviewResponse.model_validate(review)


@router.get("/{finding_id}/reviews", response_model=List[ReviewResponse])
def get_finding_reviews(finding_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    reviews = ReviewService.get_history(db, finding_id, user.id)
    return [ReviewResponse.model_validate(r) for r in reviews]
