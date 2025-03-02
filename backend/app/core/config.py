import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

# API settings
API_PREFIX = "/api"
PROJECT_NAME = "Data Smith - CSV Enhancer"
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

# OpenAI settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# File storage settings
UPLOAD_DIR = os.path.join(BASE_DIR, "data", "uploads")
RESULT_DIR = os.path.join(BASE_DIR, "data", "results")

# Create directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)

# CORS settings
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:8000",  # FastAPI when serving static files
    "http://localhost",
    "https://localhost",
    "http://localhost:3000",
] 