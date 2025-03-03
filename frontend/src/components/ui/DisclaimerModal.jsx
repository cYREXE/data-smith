import React from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * DisclaimerModal component for displaying AI usage disclaimer
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Function} props.onConfirm - Function to call when the user confirms
 * @returns {JSX.Element} - DisclaimerModal component
 */
const DisclaimerModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Important Disclaimer"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            I Understand
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                AI-Generated Content
              </h3>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700">
          <strong>Please be aware that Data-Smith uses generative AI technology to transform and add values to your dataset.</strong>
        </p>
        
        <p className="text-gray-600 text-sm">
          The transformed data:
        </p>
        
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Is not necessarily factually correct</li>
          <li>Is intended for prototyping and development purposes only</li>
          <li>Should not be presented as absolute truth or used for critical decision-making</li>
          <li>Must be verified by a human using truthful sources if used commercially</li>
        </ul>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-sm text-gray-500">
            By downloading this file, you agree that you will not pass on the altered CSV as absolute truth, and you understand the limitations of AI-generated content.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DisclaimerModal; 