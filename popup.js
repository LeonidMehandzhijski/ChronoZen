// Pomodoro Timer functionality
class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.isRunning = false;
        this.timer = null;
        this.display = document.querySelector('.timer-display');
        this.startButton = document.getElementById('startTimer');
        this.resetButton = document.getElementById('resetTimer');
        
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
            this.startButton.innerHTML = '<span class="material-icons">play_arrow</span>Start';
        } else {
            this.startTimer();
            this.startButton.innerHTML = '<span class="material-icons">pause</span>Pause';
        }
    }

    startTimer() {
        this.isRunning = true;
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.completeTimer();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timer);
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = 25 * 60;
        this.updateDisplay();
        this.startButton.innerHTML = '<span class="material-icons">play_arrow</span>Start';
    }

    completeTimer() {
        this.pauseTimer();
        this.resetTimer();
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Pomodoro Complete!',
            message: 'Time for a break!'
        });
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Task Management functionality
class TaskManager {
    constructor() {
        this.tasks = [];
        this.taskInput = document.getElementById('newTask');
        this.taskList = document.getElementById('taskList');
        
        this.loadTasks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.taskInput.value.trim()) {
                this.addTask(this.taskInput.value.trim());
                this.taskInput.value = '';
            }
        });
    }

    addTask(title) {
        const task = {
            id: Date.now(),
            title,
            completed: false
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTask(task);
    }

    renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-title">${task.title}</span>
            <div class="task-actions">
                <button class="btn" onclick="taskManager.deleteTask(${task.id})">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;

        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            this.saveTasks();
        });

        this.taskList.appendChild(taskElement);
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        this.tasks.forEach(task => this.renderTask(task));
    }

    saveTasks() {
        chrome.storage.local.set({ tasks: this.tasks });
    }

    loadTasks() {
        chrome.storage.local.get(['tasks'], (result) => {
            if (result.tasks) {
                this.tasks = result.tasks;
                this.renderTasks();
            }
        });
    }
}

// Navigation functionality
class Navigation {
    constructor() {
        this.views = document.querySelectorAll('.view');
        this.navItems = document.querySelectorAll('.nav-item');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = item.dataset.view;
                this.showView(viewName);
            });
        });
    }

    showView(viewName) {
        // Hide all views
        this.views.forEach(view => view.style.display = 'none');
        
        // Show selected view
        document.getElementById(viewName).style.display = 'block';
        
        // Update navigation active state
        this.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });
    }
}

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
    window.taskManager = new TaskManager();
    window.navigation = new Navigation();
}); 