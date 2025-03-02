import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * Upload a CSV file to the server
 * @param {File} file - The CSV file to upload
 * @returns {Promise<Object>} - Response with filename and columns
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Generate a configuration based on a natural language description
 * @param {string} description - Natural language description of what to do
 * @param {Array<string>} columns - CSV columns
 * @returns {Promise<Object>} - Response with generated configuration
 */
export const generateConfig = async (description, columns) => {
  const response = await axios.post(`${API_BASE_URL}/generate-config`, {
    description,
    columns,
  });
  
  return response.data;
};

/**
 * Process a CSV file with a configuration
 * @param {string} filename - The filename to process
 * @param {Object} config - The configuration to use
 * @returns {Promise<Object>} - Response with result file
 */
export const processFile = async (filename, config) => {
  const response = await axios.post(`${API_BASE_URL}/process`, {
    filename,
    config,
  });
  
  return response.data;
};

/**
 * Get the download URL for a processed file
 * @param {string} filename - The filename to download
 * @returns {string} - The download URL
 */
export const getDownloadUrl = (filename) => {
  return `${API_BASE_URL}/download/${filename}`;
}; 