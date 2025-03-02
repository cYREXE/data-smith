from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

from backend.app.api.router import api_router
from backend.app.core.config import PROJECT_NAME, API_PREFIX, CORS_ORIGINS

# Create FastAPI app
app = FastAPI(title=PROJECT_NAME)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=API_PREFIX)

# Mount static files for production
@app.on_event("startup")
async def startup_event():
    frontend_path = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
    if frontend_path.exists():
        app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="static")

# Root endpoint
@app.get("/")
async def root():
    return {"message": f"Welcome to {PROJECT_NAME} API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True) 