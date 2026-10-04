import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.v1 import api_router
from app.seeds.seed_data import seed_database
from app.agents.orchestrator import orchestrator
from app.models.user import User

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

# Ensure database tables and seeds are initialized immediately
try:
    Base.metadata.create_all(bind=engine)
    _db = SessionLocal()
    seed_database(_db)
    _db.close()
except Exception as _e:
    logger.warning(f"Initial startup DB init warning: {_e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables and seed initial database
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        seed_database(db)
        from app.models.match import UserMatch
        if db.query(UserMatch).count() == 0:
            demo_user = db.query(User).filter(User.email == "alex.chen@university.edu").first()
            if demo_user:
                orchestrator.match_single_student(db, demo_user.id)
        db.close()
    except Exception as e:
        logger.error(f"Error during startup seeding: {e}", exc_info=True)
        
    logger.info(f"{settings.PROJECT_NAME} v{settings.VERSION} initialized and ready.")
    yield
    logger.info("Shutting down Academic Intelligence Agent backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agentic AI Academic Intelligence Platform for College Students.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "agent_framework": "Multi-Agent Autonomous Orchestrator",
        "llm_engine": "Google Gemini 2.5 Flash / Resilient Heuristic Fallback"
    }

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for interactive API documentation.",
        "api_v1": settings.API_V1_STR,
        "docs_url": "/docs"
    }
