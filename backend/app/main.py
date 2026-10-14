import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import logger
from app.core.errors import AegisError, EntityNotFoundError
from app.db.init_db import init_db
from app.api.router import api_router
from app.db.session import SessionLocal
from app.workers.scan_executor import ScanExecutionManager
from app.services.scheduler_service import SchedulerService


async def recurring_scheduler_task():
    while True:
        try:
            await asyncio.sleep(30)
            db = SessionLocal()
            try:
                SchedulerService.check_and_dispatch_due_schedules(db)
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in recurring scheduler task: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    init_db()

    # Safe startup recovery for abandoned queued or running scans
    recovery_db = SessionLocal()
    try:
        recovered = ScanExecutionManager.recover_abandoned_scans(recovery_db)
        if recovered > 0:
            logger.info(f"Startup recovery completed: {recovered} abandoned scan(s) safely marked as failed.")
    except Exception as e:
        logger.error(f"Error during startup scan recovery: {e}")
    finally:
        recovery_db.close()

    # Start background recurring scheduler task
    scheduler_task = asyncio.create_task(recurring_scheduler_task())

    yield

    logger.info(f"Shutting down {settings.PROJECT_NAME}...")
    scheduler_task.cancel()
    try:
        await scheduler_task
    except asyncio.CancelledError:
        pass
    ScanExecutionManager.get_instance().shutdown(wait=False)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AEGIS — Digital Risk Protection Platform for Social Media and Mobile App Impersonation Monitoring",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(EntityNotFoundError)
async def entity_not_found_handler(request: Request, exc: EntityNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message, "error_type": "EntityNotFoundError"}
    )


@app.exception_handler(AegisError)
async def aegis_error_handler(request: Request, exc: AegisError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message, "error_type": exc.__class__.__name__}
    )


# Mount API V1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "api_docs": "/docs",
        "api_v1_base": settings.API_V1_STR,
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }
