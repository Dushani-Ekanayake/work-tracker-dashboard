// State
let tasks = [];
let completedToday = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateTime();
    updateAnalytics();
    renderTasks();
    
    // Update time every second
    setInterval(updateTime, 1000);
    
    // Event listeners
    const input = document.getElementById('task-input');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
});

// Time and Date
function updateTime() {
    const now = new Date();
    
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    
    document.getElementById('time').textContent = timeStr;
    document.getElementById('date').textContent = dateStr;
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('dashboard-tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
    
    const today = new Date().toDateString();
    const todayCount = localStorage.getItem(`completed-${today}`);
    if (todayCount) {
        completedToday = parseInt(todayCount);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('dashboard-tasks', JSON.stringify(tasks));
}

// Add task
function addTask() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    
    if (text) {
        tasks.push({
            id: Date.now(),
            text: text,
            completed: false
        });
        
        input.value = '';
        saveData();
        renderTasks();
        updateAnalytics();
    }
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        
        if (task.completed) {
            const today = new Date().toDateString();
            const current = parseInt(localStorage.getItem(`completed-${today}`) || '0');
            localStorage.setItem(`completed-${today}`, (current + 1).toString());
            completedToday = current + 1;
        }
        
        saveData();
        renderTasks();
        updateAnalytics();
    }
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
    updateAnalytics();
}

// Render tasks
function renderTasks() {
    const list = document.getElementById('tasks-list');
    
    if (tasks.length === 0) {
        list.innerHTML = '<div class="empty-state">No tasks yet. Add one to get started.</div>';
        return;
    }
    
    list.innerHTML = tasks.map(task => `
        <div class="task-item">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
            <div class="task-delete" onclick="deleteTask(${task.id})">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        </div>
    `).join('');
}

// Update analytics
function updateAnalytics() {
    // Today's completed
    document.getElementById('today-count').textContent = completedToday;
    
    // Total tasks
    document.getElementById('total-tasks').textContent = tasks.length;
    
    // Completion rate
    const completed = tasks.filter(t => t.completed).length;
    const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    document.getElementById('completion-rate').textContent = rate + '%';
    
    // Streak
    let streak = 0;
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const count = parseInt(localStorage.getItem(`completed-${date.toDateString()}`) || '0');
        if (count > 0) {
            streak++;
        } else {
            break;
        }
    }
    document.getElementById('streak').textContent = streak;
    
    // Weekly chart
    renderChart();
}

// Render weekly chart
function renderChart() {
    const chartContainer = document.getElementById('chart');
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const count = parseInt(localStorage.getItem(`completed-${dateStr}`) || '0');
        const day = date.toLocaleDateString('en', { weekday: 'short' });
        last7Days.push({ day, count });
    }
    
    const maxCount = Math.max(...last7Days.map(d => d.count), 1);
    
    chartContainer.innerHTML = last7Days.map(data => {
        const height = (data.count / maxCount) * 100;
        return `
            <div class="chart-bar">
                <div class="bar-wrapper">
                    <div class="bar-fill" style="height: ${height}%"></div>
                </div>
                <div class="bar-day">${data.day}</div>
                <div class="bar-count">${data.count}</div>
            </div>
        `;
    }).join('');
}