from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import pandas as pd
import json
from csv_enhancer import CSVEnhancer, generate_config_from_description

# Create FastAPI app
app = FastAPI(title="CSV Enhancer API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload and result directories
UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Define request models
class ConfigRequest(BaseModel):
    description: str
    columns: List[str]

class ProcessRequest(BaseModel):
    filename: str
    config: Dict[str, Any]

# API routes
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Only CSV files are accepted.")
    
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Read CSV headers
    try:
        df = pd.read_csv(file_path)
        columns = df.columns.tolist()
    except Exception as e:
        os.remove(file_path)  # Clean up on error
        raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")
    
    return {
        "success": True,
        "filename": file.filename,
        "columns": columns
    }

@app.post("/api/generate-config")
async def generate_config(request: ConfigRequest):
    try:
        config = generate_config_from_description(request.description, request.columns)
        return {"config": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating configuration: {str(e)}")

@app.post("/api/process")
async def process_file(request: ProcessRequest, background_tasks: BackgroundTasks):
    filepath = os.path.join(UPLOAD_FOLDER, request.filename)
    result_path = os.path.join(RESULT_FOLDER, f"enhanced_{request.filename}")
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        # Initialize the enhancer with the configuration
        enhancer = CSVEnhancer(request.config)
        
        # Process the file in the background
        background_tasks.add_task(enhancer.process_file, filepath, result_path)
        
        return {
            "success": True,
            "result_file": f"enhanced_{request.filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(RESULT_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="text/csv"
    )

# Mount static files for production
# Uncomment these lines when deploying to production
# @app.on_event("startup")
# async def startup_event():
#     if os.path.exists("dist"):
#         app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True) 