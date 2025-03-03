import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import { uploadFile } from '../../services/api';
import { isCSVFile } from '../../utils/fileUtils';

/**
 * File upload form component
 * @param {Object} props - Component props
 * @param {Function} props.onFileUploaded - Callback when file is uploaded
 * @returns {JSX.Element} - FileUploadForm component
 */
const FileUploadForm = ({ onFileUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && isCSVFile(selectedFile)) {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast.error('Please select a CSV file');
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const response = await uploadFile(file);
      
      if (response.success) {
        onFileUploaded(response.filename, response.columns);
        toast.success('File uploaded successfully');
      } else {
        toast.error(response.error || 'Error uploading file');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isCSVFile(droppedFile)) {
      setFile(droppedFile);
    } else if (droppedFile) {
      toast.error('Please select a CSV file');
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : file 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400'
          } transition-colors duration-200`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="csvFile"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              {file ? (
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              )}
            </div>
            
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop your CSV file here, or
                </p>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
                  onClick={handleBrowseClick}
                >
                  browse for a file
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  Only CSV files are supported
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          type="submit"
          variant="primary"
          isLoading={isUploading}
          disabled={isUploading || !file}
          className="px-6"
        >
          {isUploading ? 'Uploading...' : file ? 'Upload File' : 'Select a File'}
        </Button>
      </div>
    </form>
  );
};

export default FileUploadForm; 