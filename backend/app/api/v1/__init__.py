from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.opportunities import router as opportunities_router
from app.api.v1.matches import router as matches_router
from app.api.v1.saved import router as saved_router
from app.api.v1.deadlines import router as deadlines_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.agents import router as agents_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.resume import router as resume_router
from app.api.v1.agent import router as agent_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(opportunities_router)
api_router.include_router(matches_router)
api_router.include_router(saved_router)
api_router.include_router(deadlines_router)
api_router.include_router(notifications_router)
api_router.include_router(agents_router)
api_router.include_router(assistant_router)
api_router.include_router(analytics_router)
api_router.include_router(resume_router)
api_router.include_router(agent_router)
