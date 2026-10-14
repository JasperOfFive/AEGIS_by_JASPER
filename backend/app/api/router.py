from fastapi import APIRouter
from app.api.routes import health, dashboard, brands, assets, scans, findings, reviews, imports, ai, auth

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(health.router)
api_router.include_router(dashboard.router)
api_router.include_router(brands.router)
api_router.include_router(assets.router)
api_router.include_router(scans.router)
api_router.include_router(findings.router)
api_router.include_router(reviews.router)
api_router.include_router(imports.router)
api_router.include_router(ai.router)
