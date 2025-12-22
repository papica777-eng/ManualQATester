'use strict';

/**
 * Animations Module
 * Handles typing effects, counter animations, and scroll animations
 * @module animations
 */

import { CONFIG } from '../config.js';
import { handleError, safeQuerySelector, safeQuerySelectorAll } from './utils.js';

const Animations = (() => {
  // Private state
  let typedTextElement = null;
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let currentTestIndex = 0;
  let autoRotateInterval = null;
  
  const phrases = [
    'Manual QA Engineer',
    'Aspiring Automation Dev'
  ];
  
  const testExamples = [
    {
      name: 'login.spec.ts',
      code: `<span class="comment">// Test: User Login Functionality</span>
<span class="keyword">import</span> { test, expect } <span class="keyword">from</span> <span class="string">'@playwright/test'</span>;

<span class="function">test</span>(<span class="string">'successful login with valid credentials'</span>, <span class="keyword">async</span> ({ page }) => {
  <span class="comment">// Navigate to login page</span>
  <span class="keyword">await</span> page.<span class="function">goto</span>(<span class="string">'https://example.com/login'</span>);
  
  <span class="comment">// Fill in credentials</span>
  <span class="keyword">await</span> page.<span class="function">fill</span>(<span class="string">'#email'</span>, <span class="string">'user@test.com'</span>);
  <span class="keyword">await</span> page.<span class="function">fill</span>(<span class="string">'#password'</span>, <span class="string">'SecurePass123'</span>);
  
  <span class="comment">// Click login button</span>
  <span class="keyword">await</span> page.<span class="function">click</span>(<span class="string">'button[type="submit"]'</span>);
  
  <span class="comment">// Assert successful login</span>
  <span class="keyword">await</span> <span class="function">expect</span>(page).<span class="function">toHaveURL</span>(<span class="string">'/dashboard'</span>);
  <span class="keyword">await</span> <span class="function">expect</span>(page.<span class="function">locator</span>(<span class="string">'.welcome-message'</span>))
    .<span class="function">toContainText</span>(<span class="string">'Welcome back'</span>);
});`
    },
    {
      name: 'api-test.spec.ts',
      code: `<span class="comment">// Test: API Endpoint Validation</span>
<span class="keyword">import</span> { test, expect } <span class="keyword">from</span> <span class="string">'@playwright/test'</span>;

<span class="function">test</span>(<span class="string">'GET /api/users returns correct data'</span>, <span class="keyword">async</span> ({ request }) => {
  <span class="comment">// Make API request</span>
  <span class="keyword">const</span> response = <span class="keyword">await</span> request.<span class="function">get</span>(<span class="string">'https://api.example.com/users'</span>, {
    headers: {
      <span class="string">'Authorization'</span>: <span class="string">'Bearer TOKEN'</span>,
      <span class="string">'Content-Type'</span>: <span class="string">'application/json'</span>
    }
  });
  
  <span class="comment">// Validate response status</span>
  <span class="function">expect</span>(response.<span class="function">status</span>()).<span class="function">toBe</span>(<span class="constant">200</span>);
  
  <span class="comment">// Parse and validate JSON response</span>
  <span class="keyword">const</span> data = <span class="keyword">await</span> response.<span class="function">json</span>();
  <span class="function">expect</span>(data).<span class="function">toHaveProperty</span>(<span class="string">'users'</span>);
  <span class="function">expect</span>(data.users).<span class="function">toBeInstanceOf</span>(Array);
  <span class="function">expect</span>(data.users.<span class="constant">length</span>).<span class="function">toBeGreaterThan</span>(<span class="constant">0</span>);
});`
    },
    {
      name: 'e2e-checkout.spec.ts',
      code: `<span class="comment">// Test: E-Commerce Checkout Flow</span>
<span class="keyword">import</span> { test, expect } <span class="keyword">from</span> <span class="string">'@playwright/test'</span>;

<span class="function">test</span>(<span class="string">'complete purchase workflow'</span>, <span class="keyword">async</span> ({ page }) => {
  <span class="comment">// Add item to cart</span>
  <span class="keyword">await</span> page.<span class="function">goto</span>(<span class="string">'https://shop.example.com/products'</span>);
  <span class="keyword">await</span> page.<span class="function">click</span>(<span class="string">'.product-card:first-child .add-to-cart'</span>);
  
  <span class="comment">// Verify cart badge updated</span>
  <span class="keyword">await</span> <span class="function">expect</span>(page.<span class="function">locator</span>(<span class="string">'.cart-count'</span>)).<span class="function">toHaveText</span>(<span class="string">'1'</span>);
  
  <span class="comment">// Navigate to checkout</span>
  <span class="keyword">await</span> page.<span class="function">click</span>(<span class="string">'.cart-icon'</span>);
  <span class="keyword">await</span> page.<span class="function">click</span>(<span class="string">'text=Proceed to Checkout'</span>);
  
  <span class="comment">// Fill shipping details</span>
  <span class="keyword">await</span> page.<span class="function">fill</span>(<span class="string">'#fullName'</span>, <span class="string">'John Doe'</span>);
  <span class="keyword">await</span> page.<span class="function">fill</span>(<span class="string">'#address'</span>, <span class="string">'123 Test St'</span>);
  
  <span class="comment">// Complete order</span>
  <span class="keyword">await</span> page.<span class="function">click</span>(<span class="string">'button:text("Place Order")'</span>);
  <span class="keyword">await</span> <span class="function">expect</span>(page).<span class="function">toHaveURL</span>(<span class="string">/order-confirmation/</span>);
});`
    },
    {
      name: 'mobile-responsive.spec.ts',
      code: `<span class="comment">// Test: Mobile Responsive Design</span>
<span class="keyword">import</span> { test, expect, devices } <span class="keyword">from</span> <span class="string">'@playwright/test'</span>;

<span class="function">test</span>.<span class="function">use</span>(devices[<span class="string">'iPhone 13'</span>]);

<span class="function">test</span>(<span class="string">'mobile navigation menu works correctly'</span>, <span class="keyword">async</span> ({ page }) => {
  <span class="comment">// Load page in mobile viewport</span>
  <span class="keyword">await</span> page.<span class="function">goto</span>(<span class="string">'https://example.com'</span>);
  
  <span class="comment">// Verify hamburger menu is visible</span>
  <span class="keyword">const</span> hamburger = page.<span class="function">locator</span>(<span class="string">'.mobile-menu-toggle'</span>);
  <span class="keyword">await</span> <span class="function">expect</span>(hamburger).<span class="function">toBeVisible</span>();
  
  <span class="comment">// Click to open menu</span>
  <span class="keyword">await</span> hamburger.<span class="function">click</span>();
  <span class="keyword">await</span> <span class="function">expect</span>(page.<span class="function">locator</span>(<span class="string">'.mobile-menu'</span>)).<span class="function">toBeVisible</span>();
  
  <span class="comment">// Test navigation item</span>
  <span class="keyword">await</span> page.<span class="function">click</span>(<span class="string">'text=About'</span>);
  <span class="keyword">await</span> <span class="function">expect</span>(page).<span class="function">toHaveURL</span>(<span class="string">/about/</span>);
});`
    }
  ];
  
  /**
   * Typing animation for hero subtitle
   * @private
   */
  const _typeText = () => {
    if (!typedTextElement) return;
    
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      typedTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typedTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentPhrase.length) {
      typingSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 500; // Pause before next phrase
    }
    
    setTimeout(_typeText, typingSpeed);
  };
  
  /**
   * Animate counter from 0 to target value
   * @private
   * @param {Element} element - Counter element
   */
  const _animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = CONFIG.ANIMATION.COUNTER_DURATION;
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = `${Math.floor(current)}+`;
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = `${target}+`;
      }
    };
    
    updateCounter();
  };
  
  /**
   * Display test example at given index
   * @private
   * @param {number} index - Test example index
   */
  const _displayTest = (index) => {
    const testCodeDisplay = safeQuerySelector('#test-code-display');
    const testFileName = safeQuerySelector('#test-file-name');
    const testButtons = safeQuerySelectorAll('.test-control-btn');
    const indicators = safeQuerySelectorAll('.indicator-dot');
    
    if (!testCodeDisplay || !testFileName || testButtons.length === 0 || indicators.length === 0) {
      return;
    }
    
    // Remove animation class
    testCodeDisplay.style.animation = 'none';
    
    // Update content
    setTimeout(() => {
      testCodeDisplay.innerHTML = testExamples[index].code;
      testFileName.textContent = testExamples[index].name;
      
      // Reset animation
      testCodeDisplay.style.animation = 'fadeInCode 0.5s ease-out forwards';
      
      // Update button states
      testButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
      
      // Update indicators
      indicators.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }, 50);
  };
  
  /**
   * Start auto-rotation of test examples
   * @private
   */
  const _startAutoRotate = () => {
    _stopAutoRotate();
    const testCodeDisplay = safeQuerySelector('#test-code-display');
    if (!testCodeDisplay) return;
    
    autoRotateInterval = setInterval(() => {
      currentTestIndex = (currentTestIndex + 1) % testExamples.length;
      _displayTest(currentTestIndex);
    }, CONFIG.ANIMATION.TEST_ROTATION_INTERVAL);
  };
  
  /**
   * Stop auto-rotation of test examples
   * @private
   */
  const _stopAutoRotate = () => {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval);
    }
  };
  
  /**
   * Initialize scroll animations with Intersection Observer
   * @private
   */
  const _initScrollAnimations = () => {
    const sections = safeQuerySelectorAll('section[id]');
    const aboutSection = safeQuerySelector('#about');
    
    const observerOptions = {
      threshold: CONFIG.SCROLL.OBSERVER_THRESHOLD,
      rootMargin: CONFIG.SCROLL.OBSERVER_ROOT_MARGIN
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          
          // Animate counters when about section is visible
          if (entry.target.id === 'about') {
            const counters = entry.target.querySelectorAll('.stat-number[data-target]');
            counters.forEach(counter => {
              if (!counter.classList.contains('animated')) {
                _animateCounter(counter);
                counter.classList.add('animated');
              }
            });
          }
        }
      });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
      section.classList.add('slide-up');
      observer.observe(section);
    });
  };
  
  /**
   * Initialize bug stats counter animation
   * @private
   */
  const _initBugStatsAnimation = () => {
    const statNumbers = safeQuerySelectorAll('.stat-number');
    
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          _animateCounter(entry.target);
        }
      });
    }, observerOptions);
    
    statNumbers.forEach(stat => observer.observe(stat));
  };
  
  /**
   * Initialize workflow step animations
   * @private
   */
  const _initWorkflowAnimations = () => {
    const workflowSteps = safeQuerySelectorAll('.workflow-step');
    
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, {
      threshold: 0.2
    });
    
    workflowSteps.forEach(step => {
      stepObserver.observe(step);
    });
  };
  
  /**
   * Initialize animations module
   * @public
   */
  const init = () => {
    // Typing animation
    typedTextElement = safeQuerySelector('#typedText');
    if (typedTextElement) {
      _typeText();
    }
    
    // Test examples rotation
    _displayTest(0);
    _startAutoRotate();
    
    // Handle manual test selection
    const testButtons = safeQuerySelectorAll('.test-control-btn');
    testButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        currentTestIndex = index;
        _displayTest(index);
        _stopAutoRotate();
        // Restart auto-rotate after delay
        setTimeout(_startAutoRotate, CONFIG.ANIMATION.TEST_RESTART_DELAY);
      });
    });
    
    // Initialize scroll animations
    _initScrollAnimations();
    
    // Initialize bug stats animation
    _initBugStatsAnimation();
    
    // Initialize workflow animations
    _initWorkflowAnimations();
    
    console.log('✅ Animations module initialized');
  };
  
  // Public API
  return {
    init
  };
})();

export default Animations;
