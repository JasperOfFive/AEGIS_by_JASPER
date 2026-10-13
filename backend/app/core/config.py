import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AEGIS — Digital Risk Protection Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Base paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/aegis.db"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Detection Scoring Weights (Social)
    WEIGHT_SOCIAL_NAME: float = 25.0
    WEIGHT_SOCIAL_HANDLE: float = 25.0
    WEIGHT_SOCIAL_LOGO: float = 20.0
    WEIGHT_SOCIAL_BIO: float = 15.0
    WEIGHT_SOCIAL_SUSPICIOUS_TERMS: float = 10.0
    WEIGHT_SOCIAL_METADATA: float = 5.0
    
    # Detection Scoring Weights (Apps)
    WEIGHT_APP_NAME: float = 25.0
    WEIGHT_APP_LOGO: float = 20.0
    WEIGHT_APP_DESCRIPTION: float = 15.0
    WEIGHT_APP_PUBLISHER_MISMATCH: float = 15.0
    WEIGHT_APP_PACKAGE_SIGNALS: float = 10.0
    WEIGHT_APP_CORROBORATING: float = 15.0
    # Apinex DeepSeek Explanation Service Configuration
    APINEX_API_KEY: str = ""
    APINEX_BASE_URL: str = "https://api.apinex.bond/v1"
    APINEX_MODEL: str = "free/deepseek-v4.1-flash"
    APINEX_TIMEOUT_SECONDS: float = 60.0

    # Live Social Media Monitoring API Credentials (Optional)
    GITHUB_TOKEN: str = ""
    REDDIT_CLIENT_ID: str = ""
    REDDIT_CLIENT_SECRET: str = ""
    YOUTUBE_API_KEY: str = ""
    TWITTER_BEARER_TOKEN: str = ""
    META_ACCESS_TOKEN: str = ""

    # Live App Store Monitoring API Credentials (Optional)
    GOOGLE_PLAY_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
os.makedirs(settings.DATA_DIR, exist_ok=True)
