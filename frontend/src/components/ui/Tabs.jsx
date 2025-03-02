import React from 'react';

/**
 * Reusable Tabs component
 * @param {Object} props - Component props
 * @param {Array<{id: string, label: string}>} props.tabs - Array of tab objects
 * @param {string} props.activeTab - ID of the active tab
 * @param {Function} props.onTabChange - Function to call when tab changes
 * @returns {JSX.Element} - Tabs component
 */
const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs; 