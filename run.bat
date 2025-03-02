@echo off
echo Data Smith - CSV Enhancer

REM Check if Python virtual environment exists
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies if needed
if not exist venv\.dependencies_installed (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    echo. > venv\.dependencies_installed
)

REM Install Node.js dependencies if needed
if not exist node_modules (
    echo Installing Node.js dependencies...
    npm install
)

REM Start backend and frontend in parallel
echo Starting backend and frontend...
start cmd /k "call uvicorn api:app --reload --host 0.0.0.0 --port 8000"
start cmd /k "npm run dev" 