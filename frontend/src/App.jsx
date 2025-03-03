import { useState } from 'react';
import FileUploadForm from './components/forms/FileUploadForm';
import NaturalLanguageForm from './components/forms/NaturalLanguageForm';
import ManualConfigForm from './components/forms/ManualConfigForm';
import CodeBlock from './components/ui/CodeBlock';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import Tabs from './components/ui/Tabs';
import Header from './components/ui/Header';
import Footer from './components/ui/Footer';
import DisclaimerModal from './components/ui/DisclaimerModal';
import { processFile, getDownloadUrl } from './services/api';
import { toast } from 'react-hot-toast';

function App() {
  const [currentFilename, setCurrentFilename] = useState('');
  const [csvColumns, setCsvColumns] = useState([]);
  const [currentConfig, setCurrentConfig] = useState({
    column_context: {},
    batch_sizes: {},
    ignore_valued_columns: {},
    generate_rows: 0
  });
  const [activeTab, setActiveTab] = useState('description');
  const [showResults, setShowResults] = useState(false);
  const [resultFile, setResultFile] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState('');

  const handleFileUploaded = (filename, columns) => {
    setCurrentFilename(filename);
    setCsvColumns(columns);
  };

  const handleConfigUpdate = (newConfig) => {
    setCurrentConfig(newConfig);
  };

  const handleProcessFile = async () => {
    if (!currentFilename) {
      toast.error('Please upload a CSV file first');
      return;
    }
    
    // Check if we have either columns to process or rows to generate
    const hasColumnsToProcess = Object.keys(currentConfig.column_context || {}).length > 0;
    const hasRowsToGenerate = (currentConfig.generate_rows || 0) > 0;
    
    if (!hasColumnsToProcess && !hasRowsToGenerate) {
      toast.error('Please configure at least one column or set the number of rows to generate');
      return;
    }
    
    setIsProcessing(true);
    setShowResults(true);
    setProcessingStatus('processing');
    
    try {
      // Show what's being processed
      if (hasRowsToGenerate && hasColumnsToProcess) {
        toast.success(`Processing file: Generating ${currentConfig.generate_rows} rows and processing ${Object.keys(currentConfig.column_context).length} columns`);
      } else if (hasRowsToGenerate) {
        toast.success(`Processing file: Generating ${currentConfig.generate_rows} rows`);
      } else {
        toast.success(`Processing file: Processing ${Object.keys(currentConfig.column_context).length} columns`);
      }
      
      const response = await processFile(currentFilename, currentConfig);
      
      if (response.success) {
        setResultFile(response.result_file);
        setProcessingStatus('success');
        
        // Show what was processed
        if (hasRowsToGenerate && hasColumnsToProcess) {
          toast.success(`Processing complete! Generated ${currentConfig.generate_rows} rows and processed ${Object.keys(currentConfig.column_context).length} columns`);
        } else if (hasRowsToGenerate) {
          toast.success(`Processing complete! Generated ${currentConfig.generate_rows} rows`);
        } else {
          toast.success(`Processing complete! Processed ${Object.keys(currentConfig.column_context).length} columns`);
        }
      } else {
        setProcessingStatus('error');
        toast.error(response.error || 'Error processing file');
      }
    } catch (error) {
      console.error('Error:', error);
      setProcessingStatus('error');
      toast.error(error.response?.data?.detail || 'Error processing file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadClick = (url) => {
    setPendingDownloadUrl(url);
    setShowDisclaimerModal(true);
  };

  const handleDisclaimerConfirm = () => {
    // Proceed with download
    if (pendingDownloadUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = pendingDownloadUrl;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset state
      setPendingDownloadUrl('');
      setShowDisclaimerModal(false);
    }
  };

  const renderStatus = () => {
    switch (processingStatus) {
      case 'processing':
        return (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-md flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing your CSV file... This may take a few minutes.
          </div>
        );
      case 'success':
        return (
          <div className="bg-green-50 text-green-700 p-4 rounded-md">
            Processing complete!
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            Error processing file. Please try again.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Transformation Tool</h2>
            <p className="text-gray-600">Transform your CSV data with AI-powered enhancements</p>
          </div>
          
          <Card variant="primary" className="mb-8">
            <h3 className="text-lg font-medium mb-4">Upload Your Dataset</h3>
            <FileUploadForm onFileUploaded={handleFileUploaded} />
          </Card>
          
          {csvColumns.length > 0 && (
            <div className="space-y-8">
              <Card title="Configure Transformation" variant="default" className="mb-6">
                <Tabs 
                  tabs={[
                    { id: 'description', label: 'Natural Language' },
                    { id: 'manual', label: 'Manual Configuration' }
                  ]}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
                
                <div className="p-4">
                  {activeTab === 'description' ? (
                    <NaturalLanguageForm 
                      csvColumns={csvColumns}
                      onConfigGenerated={(config) => {
                        setCurrentConfig(config);
                        setActiveTab('manual');
                      }}
                    />
                  ) : (
                    <ManualConfigForm 
                      csvColumns={csvColumns}
                      currentConfig={currentConfig}
                      onConfigUpdate={handleConfigUpdate}
                    />
                  )}
                </div>
              </Card>
              
              <Card title="Configuration Preview" variant="secondary" className="mb-6">
                <CodeBlock content={currentConfig} />
              </Card>
              
              <div className="flex justify-center">
                <Button
                  variant="success"
                  onClick={handleProcessFile}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                  className="px-6 py-3 text-lg"
                >
                  {isProcessing ? 'Processing...' : 'Transform Data'}
                </Button>
              </div>
            </div>
          )}
          
          {showResults && (
            <Card title="Results" variant="primary" className="mt-8">
              {renderStatus()}
              
              {processingStatus === 'success' && resultFile && (
                <div className="mt-6 text-center">
                  <Button
                    variant="primary"
                    className="inline-flex items-center px-4 py-2"
                    onClick={() => handleDownloadClick(getDownloadUrl(resultFile))}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download Transformed CSV
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
      
      <DisclaimerModal 
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
        onConfirm={handleDisclaimerConfirm}
      />
    </div>
  );
}

export default App; 