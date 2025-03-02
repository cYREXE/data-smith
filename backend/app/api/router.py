from fastapi import APIRouter
from backend.app.api.endpoints import router as endpoints_router

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(endpoints_router, prefix="") 