import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
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

  return (
    <Card title="Step 1: Upload CSV File" className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="csvFile" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select CSV file
          </label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />
        </div>
        <Button
          type="submit"
          isLoading={isUploading}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
    </Card>
  );
};

export default FileUploadForm; 