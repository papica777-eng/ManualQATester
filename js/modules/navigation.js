'use strict';

/**
 * Navigation Module
 * Handles mobile menu, smooth scrolling, and active link highlighting
 * @module navigation
 */

import { handleError, safeQuerySelector, safeQuerySelectorAll } from './utils.js';

const Navigation = (() => {
  // Private state
  let mobileMenuToggle = null;
  let navMenu = null;
  let navLinks = null;
  let sections = null;
  
  /**
   * Toggle mobile menu
   * @private
   */
  const _toggleMobileMenu = () => {
    if (!navMenu || !mobileMenuToggle) return;
    
    navMenu.classList.toggle('mobile-menu-active');
    const icon = mobileMenuToggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  };
  
  /**
   * Close mobile menu
   * @private
   */
  const _closeMobileMenu = () => {
    if (!navMenu || !mobileMenuToggle) return;
    
    navMenu.classList.remove('mobile-menu-active');
    const icon = mobileMenuToggle.querySelector('i');
    if (icon) {
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-times');
    }
  };
  
  /**
   * Handle smooth scroll navigation
   * @private
   * @param {Event} e - Click event
   */
  const _handleSmoothScroll = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    
    e.preventDefault();
    const target = safeQuerySelector(href);
    
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      _closeMobileMenu();
    }
  };
  
  /**
   * Update active navigation link based on scroll position
   * @private
   */
  const _updateActiveLink = () => {
    if (!sections || !navLinks) return;
    
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };
  
  /**
   * Initialize navigation module
   * @public
   */
  const init = () => {
    mobileMenuToggle = safeQuerySelector('#mobileMenuToggle');
    navMenu = safeQuerySelector('#navMenu');
    navLinks = safeQuerySelectorAll('.nav-link');
    sections = safeQuerySelectorAll('section[id]');
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', _toggleMobileMenu);
    } else {
      console.warn('Mobile menu toggle not found');
    }
    
    // Smooth scroll for all hash links
    const hashLinks = safeQuerySelectorAll('a[href^="#"]');
    hashLinks.forEach(anchor => {
      anchor.addEventListener('click', _handleSmoothScroll);
    });
    
    // Active link highlighting on scroll
    window.addEventListener('scroll', _updateActiveLink);
    
    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          _closeMobileMenu();
        }
      });
    });
    
    console.log('✅ Navigation module initialized');
  };
  
  // Public API
  return {
    init,
    closeMobileMenu: _closeMobileMenu
  };
})();

export default Navigation;
