'use strict';

/**
 * Forms Module
 * Handles contact form submission and validation
 * @module forms
 */

import { handleError, safeQuerySelector } from './utils.js';

const Forms = (() => {
  // Private state
  let contactForm = null;
  
  /**
   * Handle form submission
   * @private
   * @param {Event} e - Submit event
   */
  const _handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactForm) return;
    
    try {
      const submitButton = contactForm.querySelector('button[type="submit"]');
      if (!submitButton) return;
      
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitButton.disabled = true;
      
      // Get form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      
      // Simulate form processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In production, this would send data to a backend
      console.log('Form data:', data);
      
      // Show success message
      alert('Thank you for your message! This is a demo contact form. In a production environment, this would send your message.');
      
      // Reset form
      contactForm.reset();
      
      // Restore button
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
      
    } catch (error) {
      handleError(error, 'Forms._handleSubmit');
      
      // Restore button on error
      const submitButton = contactForm?.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.innerHTML = 'Send Message';
        submitButton.disabled = false;
      }
    }
  };
  
  /**
   * Validate email format
   * @private
   * @param {string} email - Email address to validate
   * @returns {boolean} True if valid
   */
  const _validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  /**
   * Initialize forms module
   * @public
   */
  const init = () => {
    contactForm = safeQuerySelector('#contactForm');
    
    if (!contactForm) {
      console.warn('Contact form not found');
      return;
    }
    
    contactForm.addEventListener('submit', _handleSubmit);
    
    console.log('✅ Forms module initialized');
  };
  
  // Public API
  return {
    init
  };
})();

export default Forms;
