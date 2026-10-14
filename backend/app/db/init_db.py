from app.db.base import Base
from app.db.session import engine
from sqlalchemy import inspect, text, select
from app.models import Brand, BrandAsset, ScanRun, ScanSourceResult, Candidate, CandidateObservation, Finding, Review, User
from app.core.logging import logger
from app.security.auth import hash_password


def init_db() -> None:
    """Initialize database tables."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    # create_all does not alter existing Render databases; add the ownership
    # column safely and assign legacy rows to the Alex demo profile.
    inspector = inspect(engine)
    if "owner_id" not in {column["name"] for column in inspector.get_columns("brands")}:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE brands ADD COLUMN owner_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE"))
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_brands_owner_id ON brands (owner_id)"))

    with engine.begin() as connection:
        existing = connection.execute(text("SELECT id FROM users WHERE email = :email"), {"email": "alex@aegis.security"}).first()
        if not existing:
            import uuid
            demo_id = str(uuid.uuid4())
            connection.execute(text("INSERT INTO users (id, email, name, organization, password_hash, is_demo, created_at) VALUES (:id, :email, :name, :org, :password_hash, :is_demo, CURRENT_TIMESTAMP)"), {
                "id": demo_id,
                "email": "alex@aegis.security",
                "name": "Alex Carter",
                "org": "AEGIS Security",
                "password_hash": hash_password("password123"),
                "is_demo": True,
            })
        else:
            demo_id = existing[0]
            connection.execute(text("UPDATE users SET name = :name, is_demo = :is_demo WHERE id = :id"), {"name": "Alex Carter", "is_demo": True, "id": demo_id})
        connection.execute(text("UPDATE brands SET owner_id = :owner_id WHERE owner_id IS NULL"), {"owner_id": demo_id})
    logger.info("Database tables initialized successfully.")


if __name__ == "__main__":
    init_db()
