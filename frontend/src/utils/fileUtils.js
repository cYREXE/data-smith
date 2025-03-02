/**
 * Check if a file is a CSV file
 * @param {File} file - The file to check
 * @returns {boolean} - Whether the file is a CSV
 */
export const isCSVFile = (file) => {
  return file && file.name.endsWith('.csv');
};

/**
 * Format file size in a human-readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 