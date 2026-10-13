from app.db.base import Base
from app.db.session import engine
from app.models import Brand, BrandAsset, ScanRun, ScanSourceResult, Candidate, CandidateObservation, Finding, Review
from app.core.logging import logger


def init_db() -> None:
    """Initialize database tables."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")


if __name__ == "__main__":
    init_db()
