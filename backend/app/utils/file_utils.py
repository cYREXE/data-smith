import os
import shutil
from typing import List
from pathlib import Path

def ensure_dir_exists(dir_path: str) -> None:
    """Ensure a directory exists, create it if it doesn't"""
    os.makedirs(dir_path, exist_ok=True)

def clean_directory(dir_path: str) -> None:
    """Remove all files from a directory"""
    for filename in os.listdir(dir_path):
        file_path = os.path.join(dir_path, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

def get_file_extension(filename: str) -> str:
    """Get the extension of a file"""
    return os.path.splitext(filename)[1].lower()

def list_files_with_extension(dir_path: str, extension: str) -> List[str]:
    """List all files in a directory with a specific extension"""
    return [f for f in os.listdir(dir_path) if f.endswith(extension)] 