import React from 'react';

/**
 * Header component for the Data-Smith application
 * @returns {JSX.Element} - Header component
 */
const Header = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white py-6 px-4 shadow-lg">
      <div className="container mx-auto max-w-4xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg 
            className="w-10 h-10" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2L2 7L12 12L22 7L12 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="rgba(255,255,255,0.2)"
            />
            <path 
              d="M2 17L12 22L22 17" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M2 12L12 17L22 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data-Smith</h1>
            <p className="text-xs text-blue-100">Transform your CSV for your use case</p>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
            <span className="font-medium">AI-Powered Data Transformation</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 