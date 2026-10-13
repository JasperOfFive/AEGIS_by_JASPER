from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings
from app.adapters.registry import registry

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    adapters = [
        {"name": a.source_name, "type": a.source_type, "is_fixture": a.is_fixture}
        for a in registry.list_all()
    ]

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_connected": db_ok,
        "active_adapters": adapters
    }
