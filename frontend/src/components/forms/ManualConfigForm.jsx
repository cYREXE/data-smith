import React, { useState } from 'react';
import ColumnConfigForm from './ColumnConfigForm';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { toast } from 'react-hot-toast';

/**
 * Form for manual configuration of columns
 * @param {Object} props - Component props
 * @param {Array<string>} props.csvColumns - CSV columns
 * @param {Object} props.currentConfig - Current configuration
 * @param {Function} props.onConfigUpdate - Callback when configuration is updated
 * @returns {JSX.Element} - ManualConfigForm component
 */
const ManualConfigForm = ({ csvColumns, currentConfig, onConfigUpdate }) => {
  const [newColumnName, setNewColumnName] = useState('');
  const [showNewColumnInput, setShowNewColumnInput] = useState(false);
  const [showRowGeneration, setShowRowGeneration] = useState(false);
  const [rowsToGenerate, setRowsToGenerate] = useState(5);
  const [datasetDescription, setDatasetDescription] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedColumnToAdd, setSelectedColumnToAdd] = useState('');

  const addColumnConfig = () => {
    // Show column selector instead of automatically adding the first available column
    const configuredColumns = Object.keys(currentConfig.column_context || {});
    const availableColumns = csvColumns.filter(
      column => !configuredColumns.includes(column)
    );
    
    if (availableColumns.length === 0) {
      toast.error('All columns have already been configured. You can create a new column instead.');
      return;
    }
    
    setShowColumnSelector(true);
    if (availableColumns.length > 0 && !selectedColumnToAdd) {
      setSelectedColumnToAdd(availableColumns[0]);
    }
  };
  
  const confirmAddColumnConfig = () => {
    try {
      console.log('Adding column configuration for:', selectedColumnToAdd);
      
      if (!selectedColumnToAdd) {
        toast.error('Please select a column to configure');
        return;
      }
      
      // Create a deep copy of the current configuration to avoid reference issues
      const newConfig = JSON.parse(JSON.stringify(currentConfig));
      
      // Ensure all configuration objects exist
      if (!newConfig.column_context) newConfig.column_context = {};
      if (!newConfig.batch_sizes) newConfig.batch_sizes = {};
      if (!newConfig.ignore_valued_columns) newConfig.ignore_valued_columns = {};
      if (!newConfig.transformation_instructions) newConfig.transformation_instructions = {};
      
      // Use a subset of columns for context (up to 3 if available)
      const contextColumnsToUse = csvColumns.length > 0 ? 
        csvColumns.slice(0, Math.min(3, csvColumns.length)).filter(col => col !== selectedColumnToAdd) : 
        [];
        
      newConfig.column_context[selectedColumnToAdd] = contextColumnsToUse;
      newConfig.batch_sizes[selectedColumnToAdd] = 10;
      newConfig.ignore_valued_columns[selectedColumnToAdd] = false;
      newConfig.transformation_instructions[selectedColumnToAdd] = '';
      
      console.log('Added column configuration for:', selectedColumnToAdd);
      console.log('Updated configuration:', newConfig);
      
      // Update the configuration
      onConfigUpdate(newConfig);
      
      // Show confirmation
      toast.success(`Added column: ${selectedColumnToAdd}`);
      
      // Reset state
      setShowColumnSelector(false);
      setSelectedColumnToAdd('');
    } catch (error) {
      console.error('Error adding column configuration:', error);
      toast.error('Failed to add column configuration');
    }
  };
  
  const cancelAddColumnConfig = () => {
    setShowColumnSelector(false);
    setSelectedColumnToAdd('');
  };
  
  const removeColumnConfig = (columnName) => {
    console.log(`Attempting to remove column configuration for: ${columnName}`);
    
    // Create a deep copy of the current configuration to avoid reference issues
    const newConfig = JSON.parse(JSON.stringify(currentConfig));
    
    try {
      // Ensure all configuration objects exist
      if (!newConfig.column_context) newConfig.column_context = {};
      if (!newConfig.batch_sizes) newConfig.batch_sizes = {};
      if (!newConfig.ignore_valued_columns) newConfig.ignore_valued_columns = {};
      if (!newConfig.transformation_instructions) newConfig.transformation_instructions = {};
      
      console.log(`Before removal - column_context keys: ${Object.keys(newConfig.column_context)}`);
      console.log(`Removing column: ${columnName}`);
      
      // Remove the column from all configuration objects
      if (columnName in newConfig.column_context) {
        delete newConfig.column_context[columnName];
        console.log(`Removed ${columnName} from column_context`);
      }
      
      if (columnName in newConfig.batch_sizes) {
        delete newConfig.batch_sizes[columnName];
        console.log(`Removed ${columnName} from batch_sizes`);
      }
      
      if (columnName in newConfig.ignore_valued_columns) {
        delete newConfig.ignore_valued_columns[columnName];
        console.log(`Removed ${columnName} from ignore_valued_columns`);
      }
      
      if (columnName in newConfig.transformation_instructions) {
        delete newConfig.transformation_instructions[columnName];
        console.log(`Removed ${columnName} from transformation_instructions`);
      }
      
      console.log(`After removal - column_context keys: ${Object.keys(newConfig.column_context)}`);
      console.log('Updated configuration after removal:', newConfig);
      
      // Update the configuration
      onConfigUpdate(newConfig);
      
      // Show confirmation
      toast.success(`Removed column: ${columnName}`);
    } catch (error) {
      console.error('Error removing column configuration:', error);
      toast.error(`Failed to remove column: ${columnName}`);
    }
  };
  
  const updateColumnConfig = (columnName, contextColumns, batchSize, ignoreValued, transformationInstruction) => {
    try {
      console.log(`Updating column configuration for: ${columnName}`);
      console.log('Context columns:', contextColumns);
      console.log('Batch size:', batchSize);
      console.log('Ignore valued:', ignoreValued);
      console.log('Transformation instruction:', transformationInstruction);
      
      // Create a deep copy of the current configuration to avoid reference issues
      const newConfig = JSON.parse(JSON.stringify(currentConfig));
      
      // Ensure all configuration objects exist
      if (!newConfig.column_context) newConfig.column_context = {};
      if (!newConfig.batch_sizes) newConfig.batch_sizes = {};
      if (!newConfig.ignore_valued_columns) newConfig.ignore_valued_columns = {};
      if (!newConfig.transformation_instructions) newConfig.transformation_instructions = {};
      
      // Update the configuration
      newConfig.column_context[columnName] = contextColumns;
      newConfig.batch_sizes[columnName] = batchSize;
      newConfig.ignore_valued_columns[columnName] = ignoreValued;
      newConfig.transformation_instructions[columnName] = transformationInstruction;
      
      console.log('Updated configuration:', newConfig);
      
      // Update the configuration
      onConfigUpdate(newConfig);
    } catch (error) {
      console.error('Error updating column configuration:', error);
      toast.error(`Failed to update column: ${columnName}`);
    }
  };

  const addNewColumn = () => {
    if (!newColumnName.trim()) {
      alert('Please enter a column name');
      return;
    }
    
    // Check if the column already exists in the CSV or in the configuration
    if (csvColumns.includes(newColumnName)) {
      alert('This column already exists in the CSV. Please use the "Add Column" button to configure it.');
      return;
    }
    
    // Safely check if the column is already configured
    if (currentConfig && 
        currentConfig.column_context && 
        Object.prototype.hasOwnProperty.call(currentConfig.column_context, newColumnName)) {
      alert('This column is already configured');
      return;
    }
    
    try {
      // Create a deep copy of the current configuration to avoid reference issues
      const newConfig = JSON.parse(JSON.stringify(currentConfig));
      
      // Ensure all configuration objects exist
      if (!newConfig.column_context) newConfig.column_context = {};
      if (!newConfig.batch_sizes) newConfig.batch_sizes = {};
      if (!newConfig.ignore_valued_columns) newConfig.ignore_valued_columns = {};
      if (!newConfig.transformation_instructions) newConfig.transformation_instructions = {};
      
      // Add the new column to the configuration
      // Use a safe subset of columns for context (up to 3 if available)
      const contextColumnsToUse = csvColumns.length > 0 ? 
        csvColumns.slice(0, Math.min(3, csvColumns.length)) : 
        [];
        
      newConfig.column_context[newColumnName] = contextColumnsToUse;
      newConfig.batch_sizes[newColumnName] = 10;
      newConfig.ignore_valued_columns[newColumnName] = false;
      newConfig.transformation_instructions[newColumnName] = '';
      
      console.log('Added new column configuration for:', newColumnName);
      console.log('Updated configuration:', newConfig);
      
      // Update the configuration
      onConfigUpdate(newConfig);
      
      // Reset the input and hide the form
      setNewColumnName('');
      setShowNewColumnInput(false);
      
      // Show confirmation
      toast.success(`Added new column: ${newColumnName}`);
    } catch (error) {
      console.error('Error adding new column:', error);
      alert('An error occurred while adding the new column. Please try again.');
    }
  };

  const toggleNewColumnInput = () => {
    setShowNewColumnInput(!showNewColumnInput);
    setNewColumnName('');
  };

  const toggleRowGeneration = () => {
    setShowRowGeneration(!showRowGeneration);
  };

  const updateRowGeneration = () => {
    if (rowsToGenerate <= 0) {
      alert('Please enter a positive number of rows to generate');
      return;
    }

    try {
      // Create a deep copy of the current configuration to avoid reference issues
      const newConfig = JSON.parse(JSON.stringify(currentConfig));
      
      // Ensure all configuration objects exist
      if (!newConfig.column_context) newConfig.column_context = {};
      if (!newConfig.batch_sizes) newConfig.batch_sizes = {};
      if (!newConfig.ignore_valued_columns) newConfig.ignore_valued_columns = {};
      if (!newConfig.transformation_instructions) newConfig.transformation_instructions = {};
      
      // Update row generation settings
      newConfig.generate_rows = rowsToGenerate;
      newConfig.dataset_description = datasetDescription;
      
      console.log('Updated row generation settings:');
      console.log('Rows to generate:', rowsToGenerate);
      console.log('Dataset description:', datasetDescription);
      console.log('Updated configuration:', newConfig);
      
      // Update the configuration
      onConfigUpdate(newConfig);
      setShowRowGeneration(false);
      
      // Show a confirmation message
      toast.success(`Configuration updated to generate ${rowsToGenerate} new rows`);
    } catch (error) {
      console.error('Error updating row generation settings:', error);
      toast.error('Failed to update row generation settings');
    }
  };

  const cancelRowGeneration = () => {
    setShowRowGeneration(false);
    // Reset to current values
    setRowsToGenerate(currentConfig.generate_rows || 5);
    setDatasetDescription(currentConfig.dataset_description || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manual Configuration</h2>
        <div className="space-x-2">
          <Button 
            onClick={toggleRowGeneration}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
            Generate New Rows
          </Button>
        </div>
      </div>

      {/* Feature Separation Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Two Ways to Use This Tool:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong>Generate New Rows Only:</strong> Click "Generate New Rows" to add synthetic data without modifying any columns.</li>
          <li><strong>Process Columns:</strong> Configure existing columns or create new columns to enhance your data.</li>
        </ol>
        <p className="mt-2 italic">You can use either feature independently or together.</p>
      </div>

      {/* Column Configuration Options */}
      <div className="border rounded-md p-4 bg-gray-50">
        <h3 className="font-medium mb-3">Column Configuration Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow">
            <h4 className="font-medium text-gray-800 mb-2">Configure Existing Column</h4>
            <p className="text-sm text-gray-600 mb-3">
              Select a column from your CSV file to enhance or transform values within it.
            </p>
            <Button 
              onClick={addColumnConfig}
              variant="primary"
              className="w-full"
            >
              Add Existing Column
            </Button>
          </div>
          
          <div className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow">
            <h4 className="font-medium text-gray-800 mb-2">Create New Column</h4>
            <p className="text-sm text-gray-600 mb-3">
              Create a brand new column that doesn't exist in your original CSV and add values to it.
            </p>
            <Button 
              onClick={toggleNewColumnInput}
              variant="primary"
              className="w-full"
            >
              Create New Column
            </Button>
          </div>
        </div>
      </div>

      {showRowGeneration && (
        <div className="border rounded-md p-4 bg-yellow-50">
          <h3 className="font-medium mb-2">Generate New Rows</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Number of rows to generate:
              </label>
              <input
                type="number"
                value={rowsToGenerate}
                onChange={(e) => setRowsToGenerate(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded-md"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Dataset description (optional):
              </label>
              <textarea
                value={datasetDescription}
                onChange={(e) => setDatasetDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows="3"
                placeholder="Describe what this dataset represents to help generate more accurate rows"
              />
            </div>
            <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3 text-sm">
              <p className="font-medium">How it works:</p>
              <p>When you click "Apply", this will update your configuration to generate {rowsToGenerate} new rows. The rows will be generated when you click "Process File" on the main screen. The generated rows will be added to the end of your dataset.</p>
              <p className="mt-2 font-medium">Important:</p>
              <p>If you haven't added any column configurations below, this will ONLY generate new rows without modifying any existing columns.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelRowGeneration}>
                Cancel
              </Button>
              <Button onClick={updateRowGeneration}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {showNewColumnInput && (
        <div className="border rounded-md p-4 bg-blue-50">
          <h3 className="font-medium mb-2">Create New Column</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                New Column Name:
              </label>
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter new column name"
              />
              <p className="mt-1 text-xs text-gray-600">
                This will create a new column that doesn't exist in your original CSV file.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={toggleNewColumnInput}>
                Cancel
              </Button>
              <Button onClick={addNewColumn}>
                Add Column
              </Button>
            </div>
          </div>
        </div>
      )}

      {showColumnSelector && (
        <div className="border rounded-md p-4 bg-blue-50 mt-4">
          <h3 className="font-medium mb-2">Select Column to Configure</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Choose a column:
              </label>
              <select
                value={selectedColumnToAdd}
                onChange={(e) => setSelectedColumnToAdd(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">-- Select a column --</option>
                {csvColumns
                  .filter(column => !(currentConfig.column_context || {})[column])
                  .map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={confirmAddColumnConfig}
                variant="primary"
                className="flex-1"
                disabled={!selectedColumnToAdd}
              >
                Confirm
              </Button>
              <Button 
                onClick={cancelAddColumnConfig}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Column Configurations Section */}
      {Object.keys(currentConfig.column_context || {}).length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-4">Column Configurations</h3>
          <div className="space-y-6">
            {Object.keys(currentConfig.column_context || {}).map((columnName) => (
              <ColumnConfigForm
                key={columnName}
                columnName={columnName}
                csvColumns={csvColumns}
                contextColumns={currentConfig.column_context[columnName] || []}
                batchSize={currentConfig.batch_sizes?.[columnName] || 10}
                ignoreValued={currentConfig.ignore_valued_columns?.[columnName] || false}
                transformationInstruction={currentConfig.transformation_instructions?.[columnName] || ''}
                onUpdate={(contextColumns, batchSize, ignoreValued, transformationInstruction) => 
                  updateColumnConfig(columnName, contextColumns, batchSize, ignoreValued, transformationInstruction)
                }
                onRemove={() => removeColumnConfig(columnName)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {Object.keys(currentConfig.column_context || {}).length === 0 && !showNewColumnInput && !showRowGeneration && (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-gray-500 mb-4">No column configurations yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Use the options above to configure existing columns or create new ones.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManualConfigForm; 