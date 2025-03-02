from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse, FileResponse
import os
import pandas as pd

from backend.app.core.config import UPLOAD_DIR, RESULT_DIR
from backend.app.models.schemas import ConfigRequest, ProcessRequest, UploadResponse, ConfigResponse, ProcessResponse
from backend.app.services.csv_enhancer import CSVEnhancer, generate_config_from_description

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload a CSV file and return its columns"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Only CSV files are accepted.")
    
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
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

@router.post("/generate-config", response_model=ConfigResponse)
async def generate_config(request: ConfigRequest):
    """Generate a configuration based on a natural language description"""
    try:
        config = generate_config_from_description(request.description, request.columns)
        return {"config": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating configuration: {str(e)}")

@router.post("/process", response_model=ProcessResponse)
async def process_file(request: ProcessRequest, background_tasks: BackgroundTasks):
    """Process a CSV file with a configuration"""
    filepath = os.path.join(UPLOAD_DIR, request.filename)
    result_path = os.path.join(RESULT_DIR, f"enhanced_{request.filename}")
    
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

@router.get("/download/{filename}")
async def download_file(filename: str):
    """Download a processed CSV file"""
    file_path = os.path.join(RESULT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="text/csv"
    ) 