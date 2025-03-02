import React from 'react';

/**
 * Reusable CodeBlock component for displaying code or JSON
 * @param {Object} props - Component props
 * @param {Object|string} props.content - Content to display
 * @param {number} props.maxHeight - Maximum height in pixels
 * @returns {JSX.Element} - CodeBlock component
 */
const CodeBlock = ({ content, maxHeight = 240 }) => {
  // Format content if it's an object
  const formattedContent = typeof content === 'object' 
    ? JSON.stringify(content, null, 2) 
    : content;

  return (
    <pre 
      className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto text-gray-700"
      style={{ maxHeight: `${maxHeight}px` }}
    >
      {formattedContent}
    </pre>
  );
};

export default CodeBlock; 