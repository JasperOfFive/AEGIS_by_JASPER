from fastapi import APIRouter
from app.schemas.ai import AIStatusResponse
from app.services.explanation_service import ExplanationService

router = APIRouter(prefix="/ai", tags=["AI Explanation"])


@router.get("/status", response_model=AIStatusResponse)
def get_ai_status():
    """
    Get current configuration status of the Apinex DeepSeek AI explanation service.
    Safe for public/frontend display: never exposes secrets or API keys.
    """
    return ExplanationService.get_status()
