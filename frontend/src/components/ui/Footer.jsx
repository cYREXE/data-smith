import React from 'react';

/**
 * Footer component for the Data-Smith application
 * @returns {JSX.Element} - Footer component
 */
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <svg 
                className="w-6 h-6" 
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
                  fill="rgba(255,255,255,0.1)"
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
              <span className="font-semibold">Data-Smith</span>
            </div>
            <p className="text-xs mt-1">Version 0.1.0 alpha</p>
          </div>
          
          <div className="text-sm">
            <p>AI-powered data transformation for prototyping</p>
            <div className="flex space-x-4 mt-2 justify-center md:justify-end">
              <a href="https://buymeacoffee.com/cyrexe" className="hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">Support me</a>
              <a href="https://github.com/cyrexe/data-smith" className="hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/noel-dengg-746408231/" className="hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">My awesomeLinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 