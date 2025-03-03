import React from 'react';

/**
 * Reusable Button component
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, success, danger, outline)
 * @param {boolean} props.isLoading - Whether the button is in loading state
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Button component
 */
const Button = ({ 
  variant = 'primary', 
  isLoading = false, 
  disabled = false, 
  onClick, 
  children, 
  className = '',
  ...rest 
}) => {
  // Base classes
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white focus:ring-blue-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 focus:ring-gray-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white focus:ring-green-500',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white focus:ring-red-500',
    outline: 'bg-transparent border border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };
  
  // Disabled/loading classes
  const stateClasses = (isLoading || disabled) 
    ? 'opacity-70 cursor-not-allowed shadow-none' 
    : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${stateClasses} ${className}`}
      onClick={onClick}
      disabled={isLoading || disabled}
      {...rest}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
};

export default Button; 