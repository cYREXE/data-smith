#!/bin/bash

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Install Python dependencies if needed
if [ ! -f "venv/.dependencies_installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch venv/.dependencies_installed
fi

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Start backend and frontend in parallel
echo "Starting backend and frontend..."
(trap 'kill 0' SIGINT; uvicorn api:app --reload --host 0.0.0.0 --port 8000 & npm run dev) 