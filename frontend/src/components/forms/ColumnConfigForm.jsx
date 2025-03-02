import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

/**
 * Form for configuring a single column
 * @param {Object} props - Component props
 * @param {string} props.columnName - Name of the column being configured
 * @param {Array<string>} props.csvColumns - All CSV columns
 * @param {Array<string>} props.contextColumns - Selected context columns
 * @param {number} props.batchSize - Batch size for processing
 * @param {boolean} props.ignoreValued - Whether to ignore rows with values
 * @param {string} props.transformationInstruction - Specific instruction for this column
 * @param {Function} props.onRemove - Callback when column is removed
 * @param {Function} props.onUpdate - Callback when configuration is updated
 * @returns {JSX.Element} - ColumnConfigForm component
 */
const ColumnConfigForm = ({
  columnName,
  csvColumns = [],
  contextColumns = [],
  batchSize = 10,
  ignoreValued = false,
  transformationInstruction = '',
  onRemove,
  onUpdate
}) => {
  const [selectedContexts, setSelectedContexts] = useState(contextColumns || []);
  const [currentBatchSize, setCurrentBatchSize] = useState(batchSize || 10);
  const [currentIgnoreValued, setCurrentIgnoreValued] = useState(ignoreValued || false);
  const [currentTransformationInstruction, setCurrentTransformationInstruction] = useState(transformationInstruction || '');
  
  // Update parent component when values change
  useEffect(() => {
    if (onUpdate) {
      onUpdate(selectedContexts, currentBatchSize, currentIgnoreValued, currentTransformationInstruction);
    }
  }, [selectedContexts, currentBatchSize, currentIgnoreValued, currentTransformationInstruction, onUpdate]);
  
  const handleContextChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setSelectedContexts(selectedValues);
  };
  
  const handleBatchSizeChange = (e) => {
    const value = parseInt(e.target.value) || 10;
    setCurrentBatchSize(Math.min(Math.max(value, 1), 50)); // Clamp between 1 and 50
  };
  
  const handleIgnoreValuedChange = (e) => {
    setCurrentIgnoreValued(e.target.checked);
  };

  const handleTransformationInstructionChange = (e) => {
    setCurrentTransformationInstruction(e.target.value);
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          {columnName} 
          {!csvColumns.includes(columnName) && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">New Column</span>
          )}
        </h3>
        <Button
          onClick={onRemove}
          variant="danger"
          className="text-sm"
          size="sm"
        >
          Remove
        </Button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Context Columns
          </label>
          <select
            multiple
            value={selectedContexts}
            onChange={handleContextChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            size={Math.min(csvColumns.length, 5)}
          >
            {csvColumns.map(column => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select columns to use as context for enhancement (hold Ctrl/Cmd to select multiple)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transformation Instruction
          </label>
          <textarea
            value={currentTransformationInstruction}
            onChange={handleTransformationInstructionChange}
            placeholder="Example: Categorize as 'Edible' or 'Inedible' based on product type"
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            rows={2}
          />
          <p className="mt-1 text-xs text-gray-500">
            Specific instructions for how to transform this column
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Size
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={currentBatchSize}
              onChange={handleBatchSizeChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Number of rows to process at once (1-50)
            </p>
          </div>
          
          <div className="flex items-start pt-6">
            <div className="flex items-center h-5">
              <input
                id={`ignore-valued-${columnName}`}
                type="checkbox"
                checked={currentIgnoreValued}
                onChange={handleIgnoreValuedChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={`ignore-valued-${columnName}`} className="font-medium text-gray-700">
                Ignore rows with existing values
              </label>
              <p className="text-gray-500">
                Skip processing rows that already have values
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnConfigForm; 