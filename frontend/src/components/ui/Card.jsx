import React from 'react';

/**
 * Reusable Card component for content sections
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Card variant (default, primary, secondary)
 * @returns {JSX.Element} - Card component
 */
const Card = ({ title, children, className = '', variant = 'default' }) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-white',
    primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
    secondary: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
  };

  return (
    <div className={`rounded-lg shadow-md overflow-hidden border ${variantStyles[variant]} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 bg-opacity-80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card; 