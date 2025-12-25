// Data Store
const skillsData = [
  { name: 'Functional Testing', type: 'testing', level: 90 },
  { name: 'Regression', type: 'testing', level: 85 },
  { name: 'Exploratory', type: 'testing', level: 90 },
  { name: 'Localization', type: 'testing', level: 85 },
  { name: 'Jira', type: 'tools', level: 85 },
  { name: 'TestRail', type: 'tools', level: 80 },
  { name: 'uTest Platform', type: 'tools', level: 95 },
  { name: 'Postman (REST)', type: 'tech', level: 70 },
  { name: 'SQL (Join/Select)', type: 'tech', level: 65 },
  { name: 'Git/GitHub', type: 'tech', level: 60 },
  { name: 'Python (Basic)', type: 'tech', level: 40 },
];

document.addEventListener('DOMContentLoaded', function () {
  // 1. Initialize Radar Chart
  const ctx = document.getElementById('skillsChart').getContext('2d');

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        'Manual Testing',
        'QA Tools',
        'Automation/Code',
        'Domain Knowledge',
        'Reporting Quality',
      ],
      datasets: [
        {
          label: 'Proficiency Level',
          data: [90, 85, 60, 75, 80],
          fill: true,
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: 'rgb(37, 99, 235)',
          pointBackgroundColor: 'rgb(37, 99, 235)',
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });

  // 2. Initial render of skills
  renderSkills('all');
});

// Skill Filtering Logic
// eslint-disable-next-line no-unused-vars
function filterSkills(category, btnElement) {
  document.querySelectorAll('.skill-btn').forEach((btn) => btn.classList.remove('active'));
  if (btnElement) {
    btnElement.classList.add('active');
  }
  renderSkills(category);
}

function renderSkills(category) {
  const container = document.getElementById('skills-container');
  container.innerHTML = '';

  const filtered =
    category === 'all' ? skillsData : skillsData.filter((skill) => skill.type === category);

  filtered.forEach((skill) => {
    const tag = document.createElement('span');
    let bgClass = 'bg-stone-100 text-stone-700';
    if (skill.type === 'tech') {
      bgClass = 'bg-blue-50 text-blue-700 border-blue-100';
    }
    if (skill.type === 'tools') {
      bgClass = 'bg-amber-50 text-amber-700 border-amber-100';
    }

    tag.className = `px-3 py-1.5 rounded text-sm border border-stone-200 ${bgClass} skill-tag-transition cursor-default`;
    tag.innerHTML = `${skill.name} <span class="opacity-50 text-xs ml-1">• ${skill.level}%</span>`;
    container.appendChild(tag);
  });
}

// UI Helpers
// eslint-disable-next-line no-unused-vars
function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('hidden');
}

// eslint-disable-next-line no-unused-vars
function setActiveNav(element) {
  document
    .querySelectorAll('.nav-link')
    .forEach((link) => link.classList.remove('nav-active', 'text-blue-600'));
  element.classList.add('nav-active');
}

// eslint-disable-next-line no-unused-vars
function copyEmail() {
  const email = 'papica777@gmail.com';
  navigator.clipboard
    .writeText(email)
    .then(() => {
      alert('Email copied to clipboard!');
      if (window.devConsole) {
        window.devConsole.log('Email copied to clipboard!');
      } else {
        // eslint-disable-next-line no-console
        console.log('Email copied to clipboard!');
      }
    })
    .catch((err) => {
      alert('Failed to copy email. Please copy manually: ' + email);
      if (window.devConsole) {
        window.devConsole.error('Failed to copy email: ' + err);
      }
    });
}
// Developer Console Widget
class DevConsole {
  constructor() {
    this.logs = [];
    this.createConsole();
  }
  createConsole() {
    this.consoleDiv = document.createElement('div');
    this.consoleDiv.style.position = 'fixed';
    this.consoleDiv.style.bottom = '10px';
    this.consoleDiv.style.right = '10px';
    this.consoleDiv.style.width = '350px';
    this.consoleDiv.style.height = '180px';
    this.consoleDiv.style.background = 'rgba(30,41,59,0.95)';
    this.consoleDiv.style.color = '#fff';
    this.consoleDiv.style.fontSize = '13px';
    this.consoleDiv.style.zIndex = '9999';
    this.consoleDiv.style.borderRadius = '8px';
    this.consoleDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    this.consoleDiv.style.overflowY = 'auto';
    this.consoleDiv.style.padding = '10px';
    this.consoleDiv.innerHTML =
      '<div style="font-weight:bold;margin-bottom:6px;">Dev Console <button id="devConsoleClear" style="float:right;background:#2563eb;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;">Clear</button></div><div id="devConsoleLogs"></div>';
    document.body.appendChild(this.consoleDiv);
    document.getElementById('devConsoleClear').onclick = () => this.clear();
    this.logsDiv = document.getElementById('devConsoleLogs');
  }
  log(msg) {
    this.logs.push(msg);
    this.render();
  }
  error(msg) {
    this.logs.push('[ERROR] ' + msg);
    this.render();
  }
  clear() {
    this.logs = [];
    this.render();
  }
  render() {
    this.logsDiv.innerHTML = this.logs.map((l) => `<div>${l}</div>`).join('');
  }
}

window.devConsole = new DevConsole();
// eslint-disable-next-line no-console
console.log = function (msg) {
  window.devConsole.log(msg);
};
// eslint-disable-next-line no-console
console.error = function (msg) {
  window.devConsole.error(msg);
};
