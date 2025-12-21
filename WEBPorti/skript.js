// Data Store
const skillsData = [
    { name: "Functional Testing", type: "testing", level: 90 },
    { name: "Regression", type: "testing", level: 85 },
    { name: "Exploratory", type: "testing", level: 90 },
    { name: "Localization", type: "testing", level: 85 },
    { name: "Jira", type: "tools", level: 85 },
    { name: "TestRail", type: "tools", level: 80 },
    { name: "uTest Platform", type: "tools", level: 95 },
    { name: "Postman (REST)", type: "tech", level: 70 },
    { name: "SQL (Join/Select)", type: "tech", level: 65 },
    { name: "Git/GitHub", type: "tech", level: 60 },
    { name: "Python (Basic)", type: "tech", level: 40 }
];

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize Radar Chart
    const ctx = document.getElementById('skillsChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Manual Testing', 'QA Tools', 'Automation/Code', 'Domain Knowledge', 'Reporting Quality'],
            datasets: [{
                label: 'Proficiency Level',
                data: [90, 85, 60, 75, 80],
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgb(37, 99, 235)',
                pointBackgroundColor: 'rgb(37, 99, 235)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                r: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // 2. Initial render of skills
    renderSkills('all');
});

// Skill Filtering Logic
function filterSkills(category, btnElement) {
    document.querySelectorAll('.skill-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    renderSkills(category);
}

function renderSkills(category) {
    const container = document.getElementById('skills-container');
    container.innerHTML = ''; 

    const filtered = category === 'all' 
        ? skillsData 
        : skillsData.filter(skill => skill.type === category);

    filtered.forEach(skill => {
        const tag = document.createElement('span');
        let bgClass = 'bg-stone-100 text-stone-700';
        if (skill.type === 'tech') bgClass = 'bg-blue-50 text-blue-700 border-blue-100';
        if (skill.type === 'tools') bgClass = 'bg-amber-50 text-amber-700 border-amber-100';
        
        tag.className = `px-3 py-1.5 rounded text-sm border border-stone-200 ${bgClass} skill-tag-transition cursor-default`;
        tag.innerHTML = `${skill.name} <span class="opacity-50 text-xs ml-1">• ${skill.level}%</span>`;
        container.appendChild(tag);
    });
}

// UI Helpers
function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}

function setActiveNav(element) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('nav-active', 'text-blue-600'));
    element.classList.add('nav-active');
}

function copyEmail() {
    const email = "papica777@gmail.com";
    navigator.clipboard.writeText(email).then(() => {
        alert("Email copied to clipboard!");
    });
}