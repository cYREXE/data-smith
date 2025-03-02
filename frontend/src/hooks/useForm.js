import { useState } from 'react';

/**
 * Custom hook for managing form state
 * @param {Object} initialValues - Initial form values
 * @returns {Array} - Form state, handleChange function, resetForm function
 */
const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const resetForm = () => {
    setValues(initialValues);
  };

  return [values, handleChange, resetForm];
};

export default useForm; 