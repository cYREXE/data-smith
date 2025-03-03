import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { generateConfig } from '../../services/api';

/**
 * Natural language form component
 * @param {Object} props - Component props
 * @param {Array} props.csvColumns - CSV columns
 * @param {Function} props.onConfigGenerated - Callback when config is generated
 * @returns {JSX.Element} - NaturalLanguageForm component
 */
const NaturalLanguageForm = ({ csvColumns, onConfigGenerated }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const exampleInstructions = [
    "Fill in missing values in the 'Price' column based on similar products",
    "Categorize items in the 'Product' column into Electronics, Clothing, or Home Goods",
    "Generate detailed product descriptions based on the 'Name' and 'Category' columns",
    "Standardize price formats in the 'Price' column to always include 2 decimal places",
    "Generate 10 new rows similar to the existing data but with different product names"
  ];

  const handleExampleClick = (example) => {
    setDescription(example);
    setShowExamples(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await generateConfig(description, csvColumns);
      
      if (response.success) {
        onConfigGenerated(response.config);
        toast.success('Configuration generated successfully');
      } else {
        toast.error(response.error || 'Error generating configuration');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Error generating configuration');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Describe Your Transformation
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Tell us in plain language what you want to do with your data. You can specify columns to transform, 
          how to fill missing values, or generate new rows based on existing data.
        </p>
        
        <div className="mb-2 flex justify-between items-center">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Transformation instructions
          </label>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            onClick={() => setShowExamples(!showExamples)}
          >
            {showExamples ? 'Hide Examples' : 'Show Examples'}
            <svg 
              className={`ml-1 h-4 w-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {showExamples && (
          <Card className="mb-4 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Example instructions:</p>
              <ul className="space-y-2">
                {exampleInstructions.map((example, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="text-left w-full px-3 py-2 text-sm rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
                      onClick={() => handleExampleClick(example)}
                    >
                      {example}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}
        
        <form onSubmit={handleSubmit}>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Example: Fill in missing values in the 'Price' column based on similar products, or generate 10 new rows similar to existing data"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[120px] text-gray-700"
            rows={5}
          />
          
          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isGenerating}
              disabled={isGenerating || !description.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate Configuration'}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              How to use natural language instructions
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Be specific about which columns you want to transform</li>
                <li>Specify how many new rows you want to generate (if any)</li>
                <li>Describe the relationships between columns if relevant</li>
                <li>You can review and adjust the generated configuration in the next step</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageForm; 