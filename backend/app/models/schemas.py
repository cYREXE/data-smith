from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ConfigRequest(BaseModel):
    """Request model for generating configuration from description"""
    description: str
    columns: List[str]

class ProcessRequest(BaseModel):
    """Request model for processing a CSV file with a configuration"""
    filename: str
    config: Dict[str, Any]

class UploadResponse(BaseModel):
    """Response model for file upload"""
    success: bool
    filename: str
    columns: List[str]

class ConfigResponse(BaseModel):
    """Response model for configuration generation"""
    config: Dict[str, Any]

class ProcessResponse(BaseModel):
    """Response model for file processing"""
    success: bool
    result_file: str

class ErrorResponse(BaseModel):
    """Response model for errors"""
    detail: str 