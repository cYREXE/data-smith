import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { generateConfig } from '../../services/api';

/**
 * Natural language configuration form
 * @param {Object} props - Component props
 * @param {Array<string>} props.csvColumns - CSV columns
 * @param {Function} props.onConfigGenerated - Callback when config is generated
 * @returns {JSX.Element} - NaturalLanguageForm component
 */
const NaturalLanguageForm = ({ csvColumns, onConfigGenerated }) => {
  const [description, setDescription] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const examples = [
    // Column operations
    "Fill in missing values in the 'Description' column based on the 'Title' column.",
    "Categorize items in the 'Category' column into one of: Electronics, Clothing, Food, or Other.",
    "Change the 'Category' column to classify items as either 'Edible' or 'Inedible' based on the product type.",
    "Generate detailed product descriptions for all items that have short descriptions.",
    "Standardize the 'Price' column to always have two decimal places.",
    
    // New column operations
    "Create summaries in the 'Summary' column based on the 'Description' column.",
    "Add a new column named 'Popularity' and classify each item as Low, Moderate, or High based on other attributes.",
    "Create a new column called 'Recommendation' that suggests related products based on the item description.",
    "Add a 'Sentiment' column that analyzes product reviews and categorizes them as Positive, Neutral, or Negative.",
    
    // Row generation only
    "Only generate 5 new rows that match the patterns in the existing data.",
    "Just add 10 new product entries similar to the existing ones without modifying any columns.",
    "This is a product catalog. Only generate 8 new rows with realistic product data that fits the existing categories."
  ];

  const handleGenerateConfig = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description of what you want to do');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Combine the user's description with the dataset description if provided
      let fullDescription = description;
      if (datasetDescription.trim()) {
        fullDescription = `${description} The dataset represents: ${datasetDescription}`;
      }
      
      const response = await generateConfig(fullDescription, csvColumns);
      
      if (response.config) {
        onConfigGenerated(response.config);
        toast.success('Configuration generated successfully');
      } else {
        toast.error('Failed to generate configuration');
      }
    } catch (error) {
      console.error('Error generating configuration:', error);
      toast.error('Error generating configuration');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example) => {
    setDescription(example);
    setShowExamples(false);
  };

  return (
    <div className="space-y-4">
      {/* Feature Explanation Card */}
      <Card className="bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">Two Ways to Use This Tool:</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <p className="font-medium">1. Process Columns:</p>
            <p>Enhance existing columns or create new ones with AI-generated content.</p>
            <p className="italic">Example: "Categorize items in the 'Category' column" or "Add a 'Sentiment' column"</p>
          </div>
          <div>
            <p className="font-medium">2. Generate New Rows:</p>
            <p>Create new entries that match the patterns in your existing data.</p>
            <p className="italic">Example: "Only generate 5 new rows" or "Just add 10 new product entries"</p>
          </div>
          <div className="mt-1 font-medium">
            <p>You can use either feature independently or together.</p>
          </div>
        </div>
      </Card>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What would you like to do with your CSV data?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you want to do with your data. Be specific about which columns to process or how many rows to generate."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          disabled={isGenerating}
        />
        <div className="mt-1 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <p><strong>Important:</strong> Use specific language to control what happens:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>For row generation only: Use phrases like "only generate rows" or "just add new rows"</li>
              <li>For column processing: Specify which columns to modify or create</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap ml-2"
          >
            {showExamples ? 'Hide Examples' : 'Show Examples'}
          </button>
        </div>
      </div>
      
      {showExamples && (
        <Card title="Example Instructions" className="mt-2">
          <div className="mb-2">
            <h4 className="text-sm font-medium text-gray-700">Column Operations:</h4>
            <ul className="text-sm space-y-1 mb-3">
              {examples.slice(0, 9).map((example, index) => (
                <li key={index} className="hover:bg-gray-50 p-1 rounded cursor-pointer" onClick={() => handleExampleClick(example)}>
                  • {example}
                </li>
              ))}
            </ul>
            <h4 className="text-sm font-medium text-gray-700">Row Generation Only:</h4>
            <ul className="text-sm space-y-1">
              {examples.slice(9).map((example, index) => (
                <li key={index + 9} className="hover:bg-gray-50 p-1 rounded cursor-pointer" onClick={() => handleExampleClick(example)}>
                  • {example}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dataset Description (Optional)
        </label>
        <textarea
          value={datasetDescription}
          onChange={(e) => setDatasetDescription(e.target.value)}
          placeholder="Describe what this dataset represents (e.g., 'This is a product catalog with items, categories, and prices')"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          disabled={isGenerating}
        />
        <p className="mt-1 text-xs text-gray-500">
          Providing context about your dataset helps generate more accurate configurations and data.
        </p>
      </div>
      
      <Button
        onClick={handleGenerateConfig}
        isLoading={isGenerating}
        disabled={isGenerating}
        className="w-full"
      >
        Generate Configuration
      </Button>
    </div>
  );
};

export default NaturalLanguageForm; 