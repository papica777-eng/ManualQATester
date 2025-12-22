'use strict';

/**
 * Application Configuration
 * @module config
 */

export const CONFIG = Object.freeze({
  VERSION: '2.0.0',
  
  GITHUB: {
    USERNAME: 'papica777-eng',
    API_BASE: 'https://api.github.com',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_REPOS: 6,
    MAX_EVENTS: 5,
  },
  
  TERMINAL: {
    TYPING_SPEED: 30,
    MAX_HISTORY: 50,
    PROMPT: 'dimitar@qa-portfolio:~$',
  },
  
  ANIMATION: {
    COUNTER_DURATION: 2000,
    FADE_DURATION: 300,
    TEST_ROTATION_INTERVAL: 5000,
    TEST_RESTART_DELAY: 10000,
  },
  
  THEME: {
    STORAGE_KEY: 'theme-preference',
    DEFAULT: 'dark',
  },
  
  SCROLL: {
    OBSERVER_THRESHOLD: 0.1,
    OBSERVER_ROOT_MARGIN: '0px 0px -50px 0px',
    BACK_TO_TOP_THRESHOLD: 300,
    KEYBOARD_HINT_DURATION: 3000,
    FIRST_VISIT_DELAY: 1500,
  },
  
  STORAGE_KEYS: {
    THEME: 'theme',
    HAS_VISITED: 'hasVisitedPortfolio',
  }
});
