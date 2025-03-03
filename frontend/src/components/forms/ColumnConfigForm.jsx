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
  
  // Update parent component when values change, but with debounce for text inputs
  useEffect(() => {
    if (onUpdate) {
      // Use a timeout to debounce updates for transformation instructions
      const timeoutId = setTimeout(() => {
        onUpdate(selectedContexts, currentBatchSize, currentIgnoreValued, currentTransformationInstruction);
      }, 300); // 300ms debounce
      
      return () => clearTimeout(timeoutId); // Clean up on unmount or when dependencies change
    }
  }, [selectedContexts, currentBatchSize, currentIgnoreValued, currentTransformationInstruction, onUpdate]);
  
  // Update local state when props change
  useEffect(() => {
    setSelectedContexts(contextColumns || []);
    setCurrentBatchSize(batchSize || 10);
    setCurrentIgnoreValued(ignoreValued || false);
    setCurrentTransformationInstruction(transformationInstruction || '');
  }, [contextColumns, batchSize, ignoreValued, transformationInstruction]);
  
  const handleContextChange = (e) => {
    // Get all selected options from the select element
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedValues = selectedOptions.map(option => option.value);
    
    console.log('Selected context columns:', selectedValues);
    
    // Update the state with the new selection
    setSelectedContexts(selectedValues);
  };
  
  const handleBatchSizeChange = (e) => {
    const value = parseInt(e.target.value) || 10;
    const clampedValue = Math.min(Math.max(value, 1), 50); // Clamp between 1 and 50
    console.log('Batch size changed:', clampedValue);
    setCurrentBatchSize(clampedValue);
  };
  
  const handleIgnoreValuedChange = (e) => {
    console.log('Ignore valued changed:', e.target.checked);
    setCurrentIgnoreValued(e.target.checked);
  };

  const handleTransformationInstructionChange = (e) => {
    setCurrentTransformationInstruction(e.target.value);
  };

  const handleAddAllContextColumns = () => {
    // Add all available columns as context (except the current column)
    const allColumnsExceptCurrent = csvColumns.filter(col => col !== columnName);
    console.log('Adding all context columns:', allColumnsExceptCurrent);
    setSelectedContexts(allColumnsExceptCurrent);
  };

  const handleClearContextColumns = () => {
    // Clear all selected context columns
    console.log('Clearing all context columns');
    setSelectedContexts([]);
  };
  
  // Individual column selection handlers for better control
  const handleColumnClick = (column) => {
    let newSelection;
    
    if (selectedContexts.includes(column)) {
      // If already selected, remove it
      newSelection = selectedContexts.filter(c => c !== column);
    } else {
      // If not selected, add it
      newSelection = [...selectedContexts, column];
    }
    
    console.log('Updated context columns:', newSelection);
    setSelectedContexts(newSelection);
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
          <div className="mb-2 flex space-x-2">
            <Button 
              onClick={handleAddAllContextColumns} 
              variant="outline" 
              className="text-xs py-1"
              size="sm"
            >
              Select All
            </Button>
            <Button 
              onClick={handleClearContextColumns} 
              variant="outline" 
              className="text-xs py-1"
              size="sm"
            >
              Clear All
            </Button>
          </div>
          
          {/* Replace select with checkboxes for better control */}
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
            {csvColumns.map(column => (
              <div key={column} className="flex items-center mb-1 last:mb-0">
                <input
                  type="checkbox"
                  id={`context-${columnName}-${column}`}
                  checked={selectedContexts.includes(column)}
                  onChange={() => handleColumnClick(column)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor={`context-${columnName}-${column}`}
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  {column}
                </label>
              </div>
            ))}
          </div>
          
          <p className="mt-1 text-xs text-gray-500">
            Select columns to use as context for enhancement
          </p>
          <p className="mt-1 text-xs font-medium text-blue-600">
            Selected: {selectedContexts.length > 0 ? selectedContexts.join(', ') : 'None'}
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
            rows={3}
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
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                max="50"
                value={currentBatchSize}
                onChange={handleBatchSizeChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
              <div className="ml-2 flex space-x-1">
                <button 
                  type="button"
                  onClick={() => setCurrentBatchSize(Math.max(currentBatchSize - 5, 1))}
                  className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
                >
                  -5
                </button>
                <button 
                  type="button"
                  onClick={() => setCurrentBatchSize(Math.min(currentBatchSize + 5, 50))}
                  className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
                >
                  +5
                </button>
              </div>
            </div>
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
                className="focus:ring-blue-500 h-5 w-5 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label 
                htmlFor={`ignore-valued-${columnName}`} 
                className="font-medium text-gray-700 cursor-pointer"
                onClick={() => setCurrentIgnoreValued(!currentIgnoreValued)}
              >
                Ignore rows with existing values
              </label>
              <p className="text-gray-500">
                Skip processing rows that already have values
              </p>
              <p className="mt-1 text-xs font-medium text-blue-600">
                Current setting: {currentIgnoreValued ? 'Yes (will ignore existing values)' : 'No (will process all rows)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnConfigForm; 