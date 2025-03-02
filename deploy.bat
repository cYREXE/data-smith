@echo off
echo Data Smith - CSV Enhancer Deployment
echo ====================================

REM Check if Python virtual environment exists
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

REM Build frontend
echo Building frontend...
npm run build

REM Update FastAPI to serve static files
echo Updating FastAPI to serve static files...
powershell -Command "(Get-Content api.py) -replace '# @app.on_event\(""startup""\)', '@app.on_event(""startup"")' | Set-Content api.py"
powershell -Command "(Get-Content api.py) -replace '#     if os.path.exists\(""dist""\)', '    if os.path.exists(""dist"")' | Set-Content api.py"
powershell -Command "(Get-Content api.py) -replace '#         app.mount', '        app.mount' | Set-Content api.py"

echo Deployment preparation complete!
echo To start the application in production mode, run:
echo uvicorn api:app --host 0.0.0.0 --port 8000 