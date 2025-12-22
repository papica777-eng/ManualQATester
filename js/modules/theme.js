'use strict';

/**
 * Theme Management Module
 * Handles dark/light mode toggling and persistence
 * @module theme
 */

import { CONFIG } from '../config.js';
import { handleError } from './utils.js';

const Theme = (() => {
  // Private state
  let themeToggleBtn = null;
  let body = null;
  
  /**
   * Load theme preference from localStorage
   * @private
   * @returns {string} Current theme ('light' or 'dark')
   */
  const _loadTheme = () => {
    try {
      return localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || CONFIG.THEME.DEFAULT;
    } catch (error) {
      handleError(error, 'Theme._loadTheme');
      return CONFIG.THEME.DEFAULT;
    }
  };
  
  /**
   * Save theme preference to localStorage
   * @private
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  const _saveTheme = (theme) => {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
    } catch (error) {
      handleError(error, 'Theme._saveTheme');
    }
  };
  
  /**
   * Apply theme to the document
   * @private
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  const _applyTheme = (theme) => {
    if (!body) return;
    
    if (theme === 'light') {
      body.classList.add('light-mode');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
      }
    } else {
      body.classList.remove('light-mode');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
      }
    }
  };
  
  /**
   * Toggle between light and dark themes
   * @private
   */
  const _toggleTheme = () => {
    if (!body) return;
    
    body.classList.toggle('light-mode');
    const theme = body.classList.contains('light-mode') ? 'light' : 'dark';
    _saveTheme(theme);
    _applyTheme(theme);
  };
  
  /**
   * Initialize theme module
   * @public
   */
  const init = () => {
    body = document.body;
    themeToggleBtn = document.getElementById('themeToggle');
    
    if (!themeToggleBtn) {
      console.warn('Theme toggle button not found');
      return;
    }
    
    // Load and apply saved theme
    const currentTheme = _loadTheme();
    _applyTheme(currentTheme);
    
    // Add event listener
    themeToggleBtn.addEventListener('click', _toggleTheme);
    
    console.log('✅ Theme module initialized');
  };
  
  /**
   * Get current theme
   * @public
   * @returns {string} Current theme name
   */
  const getCurrentTheme = () => {
    return body?.classList.contains('light-mode') ? 'light' : 'dark';
  };
  
  // Public API
  return {
    init,
    getCurrentTheme
  };
})();

export default Theme;
