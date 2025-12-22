'use strict';

/**
 * Interactive Terminal Module
 * Handles terminal input, command execution, and history
 * @module terminal
 */

import { CONFIG } from '../config.js';
import { handleError, safeQuerySelector, safeQuerySelectorAll } from './utils.js';

const Terminal = (() => {
  // Private state
  let terminalOutput = null;
  let terminalInput = null;
  let commandHistory = [];
  let historyIndex = -1;
  
  /**
   * Append text to terminal output
   * @private
   * @param {string} text - Text to append
   * @param {boolean} animate - Whether to animate the text
   */
  const _appendOutput = (text, animate = true) => {
    if (!terminalOutput) return;
    
    if (animate) {
      const lines = text.split('\n').filter(line => line.trim() !== '');
      lines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'terminal-line';
        lineDiv.innerHTML = line;
        terminalOutput.appendChild(lineDiv);
      });
    } else {
      const div = document.createElement('div');
      div.innerHTML = text;
      terminalOutput.appendChild(div);
    }
    _scrollToBottom();
  };
  
  /**
   * Scroll terminal to bottom
   * @private
   */
  const _scrollToBottom = () => {
    if (terminalOutput) {
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  };
  
  /**
   * Execute terminal command
   * @private
   * @param {string} commandText - Command to execute
   */
  const _executeCommand = async (commandText) => {
    const cmd = commandText.trim().toLowerCase();
    
    // Add command to history
    if (cmd && commandHistory[commandHistory.length - 1] !== cmd) {
      commandHistory.push(cmd);
      if (commandHistory.length > CONFIG.TERMINAL.MAX_HISTORY) {
        commandHistory.shift();
      }
    }
    historyIndex = commandHistory.length;
    
    // Display the command
    const commandLine = `<span class="terminal-prompt">${CONFIG.TERMINAL.PROMPT}</span> <span class="terminal-command">${commandText}</span>`;
    _appendOutput(commandLine, false);
    
    // Execute command
    if (_commands.has(cmd)) {
      const result = await _commands.get(cmd).execute();
      if (result !== null && result !== '') {
        _appendOutput(result, true);
      }
    } else if (cmd === '') {
      // Empty command, just show prompt
    } else {
      const errorMsg = `<span class="terminal-error">Command not found: ${commandText}</span>\n<span style="color: var(--subtle-text-color);">Type 'help' to see available commands.</span>`;
      _appendOutput(errorMsg, true);
    }
    
    // Add new prompt
    if (cmd !== 'clear') {
      _appendOutput(`<span class="terminal-prompt">${CONFIG.TERMINAL.PROMPT}</span>`, false);
    }
  };
  
  /**
   * Command definitions
   * @private
   */
  const _commands = new Map([
    ['help', {
      description: 'Show available commands',
      execute: () => {
        return `
<span style="color: var(--primary-color); font-size: 1.1em;">📚 Available Commands - Click to Run:</span>

<span class="cmd-clickable" data-cmd="bio">  bio</span>          - Quick bio information
<span class="cmd-clickable" data-cmd="npm test">  npm test</span>     - 🧪 Run Playwright tests (Must see!)
<span class="cmd-clickable" data-cmd="system">  system</span>       - 💻 Real-time system health
<span class="cmd-clickable" data-cmd="projects">  projects</span>     - 📁 View live deployments
<span class="cmd-clickable" data-cmd="time">  time</span>         - ⏰ Current timestamp
<span class="cmd-clickable" data-cmd="skills">  skills</span>       - 🛠️ Technical skills
<span class="cmd-clickable" data-cmd="about">  about</span>        - 👤 Detailed information
<span class="cmd-clickable" data-cmd="contact">  contact</span>      - 📧 Contact info
<span class="cmd-clickable" data-cmd="clear">  clear</span>        - 🧹 Clear terminal

<span style="color: var(--subtle-text-color); font-size: 0.9em;">💡 Tip: Click any command above or type it manually!</span>
`;
      }
    }],
    ['bio', {
      description: 'Quick bio',
      execute: () => {
        return `
<span style="color: var(--success-color); font-size: 1.2em; font-weight: bold;">👨‍💻 Dimitar Prodromov</span>
<span style="color: var(--info-color);">Senior QA Automation Engineer</span>
<span style="color: var(--subtle-text-color);">Playwright | TypeScript | Docker | CI/CD</span>

<span style="color: var(--subtle-text-color); font-size: 0.9em;">Try: <span class="cmd-clickable" data-cmd="skills">skills</span> | <span class="cmd-clickable" data-cmd="npm test">npm test</span> | <span class="cmd-clickable" data-cmd="projects">projects</span></span>
`;
      }
    }],
    ['about', {
      description: 'Show information about Dimitar',
      execute: () => {
        return `
<span style="color: var(--primary-color);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
<span style="color: var(--primary-color); font-weight: bold;">Dimitar Prodromov - QA Automation Architect</span>
<span style="color: var(--primary-color);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>

<span style="color: var(--success-color);">▸ Role:</span> QA Engineer & Automation Specialist
<span style="color: var(--success-color);">▸ Experience:</span> 2+ years in software testing
<span style="color: var(--success-color);">▸ Location:</span> Sofia, Bulgaria
<span style="color: var(--success-color);">▸ Status:</span> Rated Tester on uTest (Applause)

<span style="color: var(--subtle-text-color);">Specialized in functional, usability, and localization testing.
Currently transitioning to full-stack QA with Python & SQL.
Passionate about test automation and delivering quality software.</span>

<span style="color: var(--subtle-text-color); font-size: 0.9em;">Next: <span class="cmd-clickable" data-cmd="skills">skills</span> | <span class="cmd-clickable" data-cmd="npm test">npm test</span></span>
`;
      }
    }],
    ['skills', {
      description: 'List technical skills',
      execute: () => {
        return `
<span style="color: var(--primary-color);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
<span style="color: var(--primary-color); font-weight: bold;">Technical Skills</span>
<span style="color: var(--primary-color);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>

<span style="color: var(--info-color);">▸ Testing Types:</span>
  • Functional Testing     • Regression Testing
  • Exploratory Testing    • Usability Testing
  • Payment Testing        • Localization

<span style="color: var(--info-color);">▸ Tools & Platforms:</span>
  • uTest Platform         • Jira
  • TestRail               • Charles Proxy
  • Postman                • Android Studio

<span style="color: var(--info-color);">▸ Automation (Learning):</span>
  • Python                 • Selenium WebDriver
  • Playwright             • Test Automation

<span style="color: var(--info-color);">▸ Other:</span>
  • Git/GitHub             • SQL
  • REST API               • Chrome DevTools

<span style="color: var(--subtle-text-color); font-size: 0.9em;">See them in action: <span class="cmd-clickable" data-cmd="npm test">npm test</span> | <span class="cmd-clickable" data-cmd="projects">projects</span></span>
`;
      }
    }],
    ['npm test', {
      description: 'Run Playwright test suite (realistic output)',
      execute: async () => {
        const timestamp = new Date().toLocaleTimeString();
        const progressBar = `<div class="test-progress-bar"><div class="test-progress-fill" id="testProgressFill"></div></div>`;
        const initialOutput = `
<span style="color: var(--primary-color);">${timestamp} > playwright test</span>
${progressBar}
<div id="testResults"></div>
`;
        
        // Display initial state
        _appendOutput(initialOutput, false);
        
        const tests = [
          { name: 'login.spec.ts', status: 'OK', duration: '1.2s' },
          { name: 'api-validation.spec.ts', status: 'OK', duration: '0.8s' },
          { name: 'checkout.spec.ts', status: 'OK', duration: '2.1s' },
          { name: 'auth-flow.spec.ts', status: 'OK', duration: '1.5s' }
        ];
        
        const progressFill = document.getElementById('testProgressFill');
        const testResults = document.getElementById('testResults');
        
        if (testResults) {
          testResults.innerHTML = '<span style="color: var(--subtle-text-color);">Running 12 tests using 4 workers</span><br><br>';
          _scrollToBottom();
          
          let completedTests = 0;
          for (const test of tests) {
            await new Promise(resolve => setTimeout(resolve, 400));
            completedTests++;
            const progress = (completedTests / tests.length) * 100;
            if (progressFill) {
              progressFill.style.width = `${progress}%`;
            }
            
            testResults.innerHTML += `<span style="color: var(--success-color);">[${test.status}]</span> ${test.name} <span style="color: var(--subtle-text-color);">(${test.duration})</span><br>`;
            _scrollToBottom();
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
          testResults.innerHTML += `<br><span style="color: var(--success-color); font-weight: bold;">  ✅ 12 passed (2.0s)</span>
<br><span style="color: var(--subtle-text-color); font-size: 0.9em;">More: <span class="cmd-clickable" data-cmd="system">system</span> | <span class="cmd-clickable" data-cmd="projects">projects</span></span>`;
          _scrollToBottom();
        }
        
        return '';
      }
    }],
    ['clear', {
      description: 'Clear terminal output',
      execute: () => {
        if (terminalOutput) {
          terminalOutput.innerHTML = `
            <div class="terminal-line">
              <span style="color: var(--primary-color);">Terminal cleared.</span>
            </div>
            <div class="terminal-line" style="margin-top: 10px;">
              <span class="terminal-prompt">${CONFIG.TERMINAL.PROMPT}</span>
            </div>
          `;
        }
        return null; // Don't append anything else
      }
    }],
    ['contact', {
      description: 'Show contact information',
      execute: () => {
        return `
<span style="color: var(--primary-color);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
<span style="color: var(--primary-color); font-weight: bold;">Contact Information</span>
<span style="color: var(--primary-color);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>

<span style="color: var(--success-color);">▸ Email:</span> papica777@gmail.com
<span style="color: var(--success-color);">▸ Location:</span> Sofia, Bulgaria
<span style="color: var(--success-color);">▸ GitHub:</span> github.com/papica777-eng
<span style="color: var(--success-color);">▸ Language:</span> English (C1)

<span style="color: var(--subtle-text-color);">Feel free to reach out for collaboration opportunities!</span>
<span style="color: var(--subtle-text-color); font-size: 0.9em;">Learn more: <span class="cmd-clickable" data-cmd="about">about</span> | <span class="cmd-clickable" data-cmd="projects">projects</span></span>
`;
      }
    }],
    ['projects', {
      description: 'Show projects and deployments',
      execute: () => {
        return `
<span style="color: var(--primary-color); font-weight: bold;">Live Projects & Deployments:</span>

<span style="color: var(--success-color);">▸ QA Portfolio:</span> <span style="color: var(--info-color);">https://dpengeneering.site</span>
  <span style="color: var(--subtle-text-color);">Interactive terminal, bug reports, test automation examples</span>

<span style="color: var(--success-color);">▸ Playwright Demo:</span> <span style="color: var(--info-color);">github.com/papica777-eng/ManualQATester</span>
  <span style="color: var(--subtle-text-color);">TypeScript, Page Object Model, API testing</span>

<span style="color: var(--success-color);">▸ Test Cases Repository:</span>
  <span style="color: var(--subtle-text-color);">Professional test documentation and bug reports</span>

<span style="color: var(--subtle-text-color); font-size: 0.9em;">Related: <span class="cmd-clickable" data-cmd="npm test">npm test</span> | <span class="cmd-clickable" data-cmd="skills">skills</span></span>
`;
      }
    }],
    ['system', {
      description: 'Show system health',
      execute: () => {
        const uptime = Math.floor((Date.now() - performance.timing.navigationStart) / 1000);
        const memory = performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) : 'N/A';
        const timestamp = new Date().toLocaleString();
        const health = Math.random() > 0.1 ? '<span style="color: var(--success-color);">●</span> HEALTHY' : '<span style="color: var(--warning-color);">●</span> WARNING';
        
        return `
<span style="color: var(--primary-color); font-weight: bold;">System Health Monitor</span>
<span style="color: var(--primary-color);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>

<span style="color: var(--info-color);">Status:</span>          ${health}
<span style="color: var(--info-color);">Uptime:</span>          ${uptime}s
<span style="color: var(--info-color);">Memory:</span>          ${memory} MB
<span style="color: var(--info-color);">Timestamp:</span>       ${timestamp}
<span style="color: var(--info-color);">Browser:</span>         ${navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/)?.[0] || 'Unknown'}
<span style="color: var(--info-color);">Tests Ready:</span>     <span style="color: var(--success-color);">✓</span> All systems operational

<span style="color: var(--subtle-text-color); font-size: 0.9em;">Run: <span class="cmd-clickable" data-cmd="npm test">npm test</span> | <span class="cmd-clickable" data-cmd="time">time</span></span>
`;
      }
    }],
    ['time', {
      description: 'Display current timestamp',
      execute: () => {
        const now = new Date();
        const timestamp = now.toLocaleString();
        const iso = now.toISOString();
        const unix = Math.floor(now.getTime() / 1000);
        
        return `
<span style="color: var(--primary-color);">Current Time:</span>
<span style="color: var(--success-color);">Local:</span>     ${timestamp}
<span style="color: var(--success-color);">ISO:</span>       ${iso}
<span style="color: var(--success-color);">Unix:</span>      ${unix}
`;
      }
    }]
  ]);
  
  /**
   * Handle keydown events on terminal input
   * @private
   * @param {KeyboardEvent} e - Keydown event
   */
  const _handleKeydown = async (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput?.value || '';
      if (terminalInput) {
        terminalInput.value = '';
      }
      await _executeCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        if (terminalInput) {
          terminalInput.value = commandHistory[historyIndex];
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        if (terminalInput) {
          terminalInput.value = commandHistory[historyIndex];
        }
      } else {
        historyIndex = commandHistory.length;
        if (terminalInput) {
          terminalInput.value = '';
        }
      }
    }
  };
  
  /**
   * Initialize terminal module
   * @public
   */
  const init = () => {
    terminalOutput = safeQuerySelector('#terminalOutput');
    terminalInput = safeQuerySelector('#terminalInput');
    
    if (!terminalInput || !terminalOutput) {
      console.warn('Terminal elements not found');
      return;
    }
    
    // Add event listener for input
    terminalInput.addEventListener('keydown', _handleKeydown);
    
    // Quick action buttons
    const quickActionButtons = safeQuerySelectorAll('.terminal-action-btn');
    quickActionButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          terminalInput.value = '';
          await _executeCommand(cmd);
          terminalInput.focus();
        }
      });
    });
    
    // Make commands clickable in output
    terminalOutput.addEventListener('click', async (e) => {
      if (e.target.classList.contains('cmd-clickable')) {
        const cmd = e.target.getAttribute('data-cmd');
        if (cmd) {
          // Show the command in input first for visual feedback
          terminalInput.value = cmd;
          terminalInput.focus();
          
          // Add a small delay for visual effect
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Execute the command
          terminalInput.value = '';
          await _executeCommand(cmd);
        }
      } else {
        // Click anywhere in terminal to focus input
        terminalInput.focus();
      }
    });
    
    // Make terminal container clickable to focus input
    const terminalContainer = safeQuerySelector('.terminal-container');
    if (terminalContainer) {
      terminalContainer.addEventListener('click', () => {
        terminalInput?.focus();
      });
    }
    
    // Auto-focus terminal on load
    terminalInput.focus();
    
    // Set initialization timestamp
    const initTimeEl = safeQuerySelector('#initTime');
    if (initTimeEl) {
      initTimeEl.textContent = new Date().toLocaleTimeString();
    }
    
    console.log('✅ Terminal module initialized');
  };
  
  /**
   * Clear command history
   * @public
   */
  const clearHistory = () => {
    commandHistory = [];
    historyIndex = -1;
  };
  
  // Public API
  return {
    init,
    executeCommand: _executeCommand,
    clearHistory
  };
})();

export default Terminal;
