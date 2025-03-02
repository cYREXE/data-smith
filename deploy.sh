#!/bin/bash

# Exit on error
set -e

echo "Data Smith - CSV Enhancer Deployment"
echo "===================================="

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Update FastAPI to serve static files
echo "Updating FastAPI to serve static files..."
sed -i 's/# @app.on_event("startup")/@app.on_event("startup")/g' api.py
sed -i 's/#     if os.path.exists("dist")/    if os.path.exists("dist")/g' api.py
sed -i 's/#         app.mount/        app.mount/g' api.py

echo "Deployment preparation complete!"
echo "To start the application in production mode, run:"
echo "uvicorn api:app --host 0.0.0.0 --port 8000" 