'use strict';

/**
 * Utility Functions Module
 * @module utils
 */

/**
 * Handle and log errors with context
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @returns {null}
 */
export const handleError = (error, context = 'Unknown') => {
  console.error(`[${context}] Error:`, error);
  
  // Optional: Send to error tracking service if available
  if (window.Sentry) {
    window.Sentry.captureException(error, { tags: { context } });
  }
  
  return null;
};

/**
 * Debounce function calls to limit execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized HTML string
 */
export const sanitizeHTML = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Format date using Intl.DateTimeFormat
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Calculate time ago from a date
 * @param {Date} date - Past date
 * @returns {string} Human-readable time ago string
 */
export const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} years ago`;
  
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;
  
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;
  
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;
  
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;
  
  return `${Math.floor(seconds)} seconds ago`;
};

/**
 * Safe querySelector that handles missing elements
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null} Found element or null
 */
export const safeQuerySelector = (selector, parent = document) => {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    handleError(error, `safeQuerySelector: ${selector}`);
    return null;
  }
};

/**
 * Safe querySelectorAll that handles missing elements
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {NodeList} Found elements or empty NodeList
 */
export const safeQuerySelectorAll = (selector, parent = document) => {
  try {
    return parent.querySelectorAll(selector);
  } catch (error) {
    handleError(error, `safeQuerySelectorAll: ${selector}`);
    return [];
  }
};
