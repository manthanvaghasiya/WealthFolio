// File: src/utils/helpers.js

// Format Numbers to Indian Currency (e.g., 50000 -> ₹50,000)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format Dates (e.g., 2023-11-20 -> 20 Nov 2023)
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};