'use strict';

/**
 * GitHub API Module
 * Handles GitHub API integration with caching
 * @module github-api
 */

import { CONFIG } from '../config.js';
import { handleError, getTimeAgo, safeQuerySelector } from './utils.js';

const GitHubAPI = (() => {
  // Private state
  let cache = {
    repos: { data: null, timestamp: 0 },
    events: { data: null, timestamp: 0 }
  };
  
  /**
   * Check if cached data is still valid
   * @private
   * @param {string} key - Cache key ('repos' or 'events')
   * @returns {boolean} True if cache is valid
   */
  const _isCacheValid = (key) => {
    return cache[key].data && (Date.now() - cache[key].timestamp) < CONFIG.GITHUB.CACHE_DURATION;
  };
  
  /**
   * Fetch repositories from GitHub API
   * @public
   * @returns {Promise<Array>} Array of repository objects
   */
  const fetchRepos = async () => {
    if (_isCacheValid('repos')) {
      console.log('✅ Using cached repos data');
      return cache.repos.data;
    }
    
    try {
      const response = await fetch(
        `${CONFIG.GITHUB.API_BASE}/users/${CONFIG.GITHUB.USERNAME}/repos?sort=updated&per_page=${CONFIG.GITHUB.MAX_REPOS}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      cache.repos = {
        data,
        timestamp: Date.now()
      };
      
      console.log('✅ Fetched fresh repos data from GitHub');
      return data;
    } catch (error) {
      handleError(error, 'GitHubAPI.fetchRepos');
      return cache.repos.data || [];
    }
  };
  
  /**
   * Fetch user events/activity from GitHub API
   * @public
   * @returns {Promise<Array>} Array of event objects
   */
  const fetchActivity = async () => {
    if (_isCacheValid('events')) {
      console.log('✅ Using cached events data');
      return cache.events.data;
    }
    
    try {
      const response = await fetch(
        `${CONFIG.GITHUB.API_BASE}/users/${CONFIG.GITHUB.USERNAME}/events/public?per_page=${CONFIG.GITHUB.MAX_EVENTS}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      cache.events = {
        data,
        timestamp: Date.now()
      };
      
      console.log('✅ Fetched fresh events data from GitHub');
      return data;
    } catch (error) {
      handleError(error, 'GitHubAPI.fetchActivity');
      return cache.events.data || [];
    }
  };
  
  /**
   * Display GitHub activity in the UI
   * @public
   */
  const displayActivity = async () => {
    const githubEventsContainer = safeQuerySelector('#githubEvents');
    if (!githubEventsContainer) {
      console.warn('GitHub events container not found');
      return;
    }
    
    try {
      const events = await fetchActivity();
      
      // Filter for relevant events
      const relevantEvents = events
        .filter(event => ['PushEvent', 'CreateEvent', 'PullRequestEvent'].includes(event.type))
        .slice(0, CONFIG.GITHUB.MAX_EVENTS);
      
      if (relevantEvents.length === 0) {
        githubEventsContainer.innerHTML = `
          <div class="github-event">
            <div class="github-event-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="github-event-content">
              <h4>No recent activity</h4>
              <p>Check back later for updates!</p>
            </div>
          </div>
        `;
        return;
      }
      
      githubEventsContainer.innerHTML = '';
      
      relevantEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'github-event';
        
        let icon = 'fa-code-branch';
        let title = '';
        let description = '';
        
        if (event.type === 'PushEvent') {
          icon = 'fa-code-commit';
          const commitCount = event.payload.commits?.length || 0;
          title = `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''}`;
          const firstCommit = event.payload.commits?.[0];
          description = firstCommit ? firstCommit.message : 'No commit message';
        } else if (event.type === 'CreateEvent') {
          icon = 'fa-plus-circle';
          title = `Created ${event.payload.ref_type}`;
          description = event.payload.ref || event.repo.name;
        } else if (event.type === 'PullRequestEvent') {
          icon = 'fa-code-pull-request';
          title = `${event.payload.action} pull request`;
          description = event.payload.pull_request?.title || '';
        }
        
        const date = new Date(event.created_at);
        const timeAgo = getTimeAgo(date);
        
        eventDiv.innerHTML = `
          <div class="github-event-icon">
            <i class="fas ${icon}"></i>
          </div>
          <div class="github-event-content">
            <h4>${title}</h4>
            <p>${description}</p>
            <div class="github-event-meta">
              <i class="fas fa-repository"></i> ${event.repo.name.split('/')[1]} • ${timeAgo}
            </div>
          </div>
        `;
        
        githubEventsContainer.appendChild(eventDiv);
      });
      
    } catch (error) {
      handleError(error, 'GitHubAPI.displayActivity');
      _displayFallbackActivity(githubEventsContainer);
    }
  };
  
  /**
   * Display fallback activity when API fails
   * @private
   * @param {Element} container - Container element
   */
  const _displayFallbackActivity = (container) => {
    container.innerHTML = `
      <div class="github-event">
        <div class="github-event-icon">
          <i class="fas fa-code-commit"></i>
        </div>
        <div class="github-event-content">
          <h4>Recent Portfolio Update</h4>
          <p>Added interactive terminal and case studies sections</p>
          <div class="github-event-meta">
            <i class="fas fa-repository"></i> ManualQATester • Recently
          </div>
        </div>
      </div>
      <div class="github-event">
        <div class="github-event-icon">
          <i class="fas fa-plus-circle"></i>
        </div>
        <div class="github-event-content">
          <h4>Created Test Automation Framework</h4>
          <p>Playwright-based framework for E2E testing</p>
          <div class="github-event-meta">
            <i class="fas fa-repository"></i> TestAutomation • This month
          </div>
        </div>
      </div>
      <div class="github-event">
        <div class="github-event-icon">
          <i class="fas fa-code-commit"></i>
        </div>
        <div class="github-event-content">
          <h4>Updated API Test Suite</h4>
          <p>Enhanced Postman collections with automated tests</p>
          <div class="github-event-meta">
            <i class="fas fa-repository"></i> API-Testing • This month
          </div>
        </div>
      </div>
    `;
  };
  
  /**
   * Display GitHub projects in the UI
   * @public
   */
  const displayProjects = async () => {
    const container = safeQuerySelector('#github-projects');
    if (!container) {
      console.warn('GitHub projects container not found');
      return;
    }
    
    try {
      const repos = await fetchRepos();
      
      container.innerHTML = ''; // Clear loading state
      
      // Filter and display only public repos with descriptions
      const filteredRepos = repos.filter(repo => !repo.fork && repo.description);
      
      if (filteredRepos.length === 0) {
        container.innerHTML = '<div class="project-card" style="grid-column: 1/-1; text-align: center;"><p>No projects found.</p></div>';
        return;
      }
      
      filteredRepos.slice(0, CONFIG.GITHUB.MAX_REPOS).forEach(repo => {
        // Get language icon
        const languageIcons = {
          'JavaScript': 'fab fa-js',
          'TypeScript': 'fas fa-code',
          'Python': 'fab fa-python',
          'HTML': 'fab fa-html5',
          'CSS': 'fab fa-css3-alt',
          'Java': 'fab fa-java',
          'Go': 'fas fa-code',
          'Ruby': 'fas fa-gem',
          'PHP': 'fab fa-php',
          'Shell': 'fas fa-terminal'
        };
        
        const icon = languageIcons[repo.language] || 'fas fa-code-branch';
        
        // Get topics as tech badges
        const techBadges = repo.topics && repo.topics.length > 0 
          ? repo.topics.slice(0, 4).map(topic => `<span class="tech-badge">${topic}</span>`).join('')
          : `<span class="tech-badge">${repo.language || 'Code'}</span>`;
        
        const card = `
          <div class="project-card">
            <div class="project-icon">
              <i class="${icon}"></i>
            </div>
            <div class="project-content">
              <h3>${repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
              <p>${repo.description || 'No description provided.'}</p>
              <div class="project-tech">
                ${techBadges}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                <a href="${repo.html_url}" target="_blank" class="project-link">
                  View on GitHub <i class="fas fa-arrow-right"></i>
                </a>
                <span style="color: var(--subtle-text-color); font-size: 0.9em;">
                  <i class="fas fa-star" style="color: var(--warning-color);"></i> ${repo.stargazers_count}
                </span>
              </div>
            </div>
          </div>
        `;
        container.innerHTML += card;
      });
    } catch (error) {
      handleError(error, 'GitHubAPI.displayProjects');
      container.innerHTML = `
        <div class="project-card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3em; color: var(--accent-color); margin-bottom: 15px;"></i>
          <h3 style="color: var(--accent-color);">Error Loading Projects</h3>
          <p style="color: var(--subtle-text-color);">Failed to load projects from GitHub. Please check back later.</p>
          <p style="color: var(--subtle-text-color); font-size: 0.9em; margin-top: 10px;">
            Visit <a href="https://github.com/${CONFIG.GITHUB.USERNAME}" target="_blank" style="color: var(--primary-color);">GitHub Profile</a> directly
          </p>
        </div>
      `;
    }
  };
  
  /**
   * Clear all cached data
   * @public
   */
  const clearCache = () => {
    cache = {
      repos: { data: null, timestamp: 0 },
      events: { data: null, timestamp: 0 }
    };
    console.log('✅ GitHub cache cleared');
  };
  
  // Public API
  return {
    fetchRepos,
    fetchActivity,
    displayActivity,
    displayProjects,
    clearCache
  };
})();

export default GitHubAPI;
