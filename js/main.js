'use strict';

/**
 * Main Application Entry Point
 * Initializes all modules and coordinates the application
 * @module main
 */

import { CONFIG } from './config.js';
import Theme from './modules/theme.js';
import Navigation from './modules/navigation.js';
import Terminal from './modules/terminal.js';
import Forms from './modules/forms.js';
import Animations from './modules/animations.js';
import GitHubAPI from './modules/github-api.js';
import { handleError, safeQuerySelector, safeQuerySelectorAll } from './modules/utils.js';

const App = (() => {
  /**
   * Initialize scroll enhancements
   * @private
   */
  const _initScrollEnhancements = () => {
    const scrollProgress = safeQuerySelector('#scrollProgress');
    const quickJumpNav = safeQuerySelector('#quickJumpNav');
    const keyboardHint = safeQuerySelector('#keyboardHint');
    const backToTopButton = safeQuerySelector('#backToTop');
    let keyboardHintTimeout;
    
    /**
     * Update scroll progress bar
     * @private
     */
    const updateScrollProgress = () => {
      if (!scrollProgress) return;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / scrollHeight) * 100;
      scrollProgress.style.width = `${scrollPercentage}%`;
    };
    
    /**
     * Update active quick jump dot
     * @private
     */
    const updateQuickJumpActive = () => {
      const quickJumpDots = safeQuerySelectorAll('.quick-jump-dot');
      const sections = ['home', 'about', 'skills', 'test-examples', 'case-studies', 'philosophy', 'experience', 'projects', 'contact'];
      let currentSection = 'home';
      
      sections.forEach(sectionId => {
        const section = safeQuerySelector(`#${sectionId}`);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = sectionId;
          }
        }
      });
      
      quickJumpDots.forEach(dot => {
        if (dot.getAttribute('data-section') === currentSection) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };
    
    /**
     * Show keyboard hint
     * @private
     */
    const showKeyboardHint = () => {
      if (!keyboardHint) return;
      keyboardHint.classList.add('show');
      clearTimeout(keyboardHintTimeout);
      keyboardHintTimeout = setTimeout(() => {
        keyboardHint.classList.remove('show');
      }, CONFIG.SCROLL.KEYBOARD_HINT_DURATION);
    };
    
    // Scroll event listener
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      
      // Update progress bar
      updateScrollProgress();
      
      // Show/hide back to top button and quick jump nav
      if (scrollTop > CONFIG.SCROLL.BACK_TO_TOP_THRESHOLD) {
        backToTopButton?.classList.add('show');
        quickJumpNav?.classList.add('show');
      } else {
        backToTopButton?.classList.remove('show');
        quickJumpNav?.classList.remove('show');
      }
      
      // Update active dot in quick jump navigation
      updateQuickJumpActive();
    });
    
    // Back to Top Button
    if (backToTopButton) {
      backToTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
    
    // Quick Jump Navigation
    const quickJumpDots = safeQuerySelectorAll('.quick-jump-dot');
    quickJumpDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const sectionId = dot.getAttribute('data-section');
        const section = safeQuerySelector(`#${sectionId}`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Home key - scroll to top
      if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showKeyboardHint();
      }
      
      // End key - scroll to bottom
      if (e.key === 'End') {
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        showKeyboardHint();
      }
      
      // Page Up/Down - scroll by section
      if (e.key === 'PageUp' || e.key === 'PageDown') {
        e.preventDefault();
        const sections = safeQuerySelectorAll('section[id]');
        const currentScroll = window.pageYOffset;
        let targetSection = null;
        
        if (e.key === 'PageUp') {
          // Find previous section
          for (let i = sections.length - 1; i >= 0; i--) {
            if (sections[i].offsetTop < currentScroll - 100) {
              targetSection = sections[i];
              break;
            }
          }
        } else {
          // Find next section
          for (let i = 0; i < sections.length; i++) {
            if (sections[i].offsetTop > currentScroll + 100) {
              targetSection = sections[i];
              break;
            }
          }
        }
        
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        showKeyboardHint();
      }
    });
    
    // Show keyboard hint briefly on page load
    setTimeout(() => {
      showKeyboardHint();
    }, 2000);
  };
  
  /**
   * Initialize first visit tooltip
   * @private
   */
  const _initFirstVisitTooltip = () => {
    const firstVisitTooltip = safeQuerySelector('#firstVisitTooltip');
    const closeTooltipBtn = safeQuerySelector('#closeTooltip');
    const btnGotIt = safeQuerySelector('#btnGotIt');
    
    const showFirstVisitTooltip = () => {
      try {
        const hasVisited = localStorage.getItem(CONFIG.STORAGE_KEYS.HAS_VISITED);
        if (firstVisitTooltip && !hasVisited) {
          setTimeout(() => {
            firstVisitTooltip.classList.add('show');
          }, CONFIG.SCROLL.FIRST_VISIT_DELAY);
        }
      } catch (error) {
        handleError(error, 'App._initFirstVisitTooltip.showFirstVisitTooltip');
      }
    };
    
    const hideFirstVisitTooltip = () => {
      if (firstVisitTooltip) {
        firstVisitTooltip.classList.remove('show');
        try {
          localStorage.setItem(CONFIG.STORAGE_KEYS.HAS_VISITED, 'true');
        } catch (error) {
          handleError(error, 'App._initFirstVisitTooltip.hideFirstVisitTooltip');
        }
      }
    };
    
    if (closeTooltipBtn) {
      closeTooltipBtn.addEventListener('click', hideFirstVisitTooltip);
    }
    
    if (btnGotIt) {
      btnGotIt.addEventListener('click', hideFirstVisitTooltip);
    }
    
    // Show tooltip on first visit
    showFirstVisitTooltip();
  };
  
  /**
   * Initialize Playwright demo tab switching
   * @private
   */
  const _initPlaywrightDemo = () => {
    window.showDemoTab = function(tabName) {
      // Hide all tab contents
      const tabContents = safeQuerySelectorAll('.demo-tab-content');
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      // Remove active class from all tabs
      const tabs = safeQuerySelectorAll('.demo-tab');
      tabs.forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Show selected tab content
      const selectedContent = safeQuerySelector(`#${tabName}-tab`);
      if (selectedContent) {
        selectedContent.classList.add('active');
      }
      
      // Add active class to clicked tab
      if (window.event?.target) {
        const clickedTab = window.event.target.closest('.demo-tab');
        if (clickedTab) {
          clickedTab.classList.add('active');
        }
      }
    };
  };
  
  /**
   * Initialize console welcome message
   * @private
   */
  const _initConsoleWelcome = () => {
    console.log('%c👋 Hello Developer!', 'color: #2563EB; font-size: 20px; font-weight: bold;');
    console.log('%cInterested in my work? Let\'s connect!', 'color: #60A5FA; font-size: 14px;');
    console.log('%cEmail: papica777@gmail.com', 'color: #10B981; font-size: 12px;');
    console.log(`%cPortfolio Version: ${CONFIG.VERSION} | Built with Vanilla JS & ES6+ Modules`, 'color: #94A3B8; font-size: 11px;');
  };
  
  /**
   * Bootstrap the application
   * @private
   */
  const _bootstrap = () => {
    console.log(`🚀 Initializing Portfolio v${CONFIG.VERSION}`);
    
    try {
      // Initialize all modules
      Theme.init();
      Navigation.init();
      Terminal.init();
      Forms.init();
      Animations.init();
      
      // Load GitHub data
      GitHubAPI.displayActivity();
      GitHubAPI.displayProjects();
      
      // Initialize scroll enhancements
      _initScrollEnhancements();
      
      // Initialize first visit tooltip
      _initFirstVisitTooltip();
      
      // Initialize Playwright demo
      _initPlaywrightDemo();
      
      // Show console welcome message
      _initConsoleWelcome();
      
      // Log successful initialization
      console.log('✅ All modules initialized successfully');
      
      // Expose limited API for debugging in development
      // Check if running in production by looking for common production indicators
      const isProduction = window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1' &&
                          !window.location.hostname.includes('local');
      
      if (!isProduction) {
        window.__DEBUG__ = {
          Terminal,
          Theme,
          GitHubAPI,
          CONFIG,
          version: CONFIG.VERSION
        };
        console.log('🔧 Debug API available at window.__DEBUG__');
      }
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      handleError(error, 'App._bootstrap');
    }
  };
  
  /**
   * Initialize the application
   * @public
   */
  const init = () => {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _bootstrap);
    } else {
      _bootstrap();
    }
  };
  
  return { init };
})();

// Start the application
App.init();
