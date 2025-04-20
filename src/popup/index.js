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

// Media Player functionality
class MediaPlayer {
    constructor() {
        this.playPauseBtn = document.getElementById('playPause');
        this.prevBtn = document.getElementById('prevTrack');
        this.nextBtn = document.getElementById('nextTrack');
        this.spotifyLoginBtn = document.getElementById('spotifyLogin');
        this.youtubeLoginBtn = document.getElementById('youtubeLogin');
        this.spotifyTab = document.getElementById('spotifyTab');
        this.youtubeTab = document.getElementById('youtubeTab');
        this.playlistSelect = document.getElementById('playlistSelect');
        this.loginSection = document.getElementById('loginSection');
        this.playerSection = document.getElementById('playerSection');
        this.spotifyPlayer = document.getElementById('spotifyPlayer');
        this.youtubePlayer = document.getElementById('youtubePlayer');
        
        this.currentService = null;
        this.isPlaying = false;
        this.accessToken = null;
        
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    setupEventListeners() {
        this.spotifyLoginBtn.addEventListener('click', () => this.loginSpotify());
        this.youtubeLoginBtn.addEventListener('click', () => this.loginYouTube());
        this.spotifyTab.addEventListener('click', () => this.switchService('spotify'));
        this.youtubeTab.addEventListener('click', () => this.switchService('youtube'));
        this.playlistSelect.addEventListener('change', () => this.loadSelectedPlaylist());
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
    }

    async checkLoginStatus() {
        const tokens = await chrome.storage.local.get(['spotifyToken', 'youtubeToken']);
        if (tokens.spotifyToken || tokens.youtubeToken) {
            this.loginSection.style.display = 'none';
            this.playerSection.style.display = 'block';
            if (tokens.spotifyToken) {
                this.accessToken = tokens.spotifyToken;
                this.switchService('spotify');
            } else {
                this.switchService('youtube');
            }
        }
    }

    async loginSpotify() {
        const clientId = 'YOUR_SPOTIFY_CLIENT_ID';
        const redirectUri = chrome.identity.getRedirectURL();
        const scope = 'user-library-read playlist-read-private streaming';
        
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
        
        try {
            const redirectUrl = await chrome.identity.launchWebAuthFlow({
                url: authUrl,
                interactive: true
            });
            
            const hash = new URLSearchParams(redirectUrl.split('#')[1]);
            this.accessToken = hash.get('access_token');
            
            await chrome.storage.local.set({ spotifyToken: this.accessToken });
            this.switchService('spotify');
            this.loginSection.style.display = 'none';
            this.playerSection.style.display = 'block';
        } catch (error) {
            console.error('Spotify login failed:', error);
        }
    }

    async loginYouTube() {
        const clientId = 'YOUR_YOUTUBE_CLIENT_ID';
        const redirectUri = chrome.identity.getRedirectURL();
        const scope = 'https://www.googleapis.com/auth/youtube.readonly';
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
        
        try {
            const redirectUrl = await chrome.identity.launchWebAuthFlow({
                url: authUrl,
                interactive: true
            });
            
            const hash = new URLSearchParams(redirectUrl.split('#')[1]);
            const accessToken = hash.get('access_token');
            
            await chrome.storage.local.set({ youtubeToken: accessToken });
            this.switchService('youtube');
            this.loginSection.style.display = 'none';
            this.playerSection.style.display = 'block';
        } catch (error) {
            console.error('YouTube login failed:', error);
        }
    }

    async switchService(service) {
        this.currentService = service;
        this.spotifyTab.classList.toggle('active', service === 'spotify');
        this.youtubeTab.classList.toggle('active', service === 'youtube');
        this.spotifyPlayer.style.display = service === 'spotify' ? 'block' : 'none';
        this.youtubePlayer.style.display = service === 'youtube' ? 'block' : 'none';
        
        await this.loadPlaylists();
    }

    async loadPlaylists() {
        this.playlistSelect.innerHTML = '<option value="">Select a playlist...</option>';
        
        if (this.currentService === 'spotify' && this.accessToken) {
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            const data = await response.json();
            
            data.items.forEach(playlist => {
                const option = document.createElement('option');
                option.value = playlist.id;
                option.textContent = playlist.name;
                this.playlistSelect.appendChild(option);
            });
        } else if (this.currentService === 'youtube') {
            // Load YouTube playlists similarly
        }
    }

    loadSelectedPlaylist() {
        const playlistId = this.playlistSelect.value;
        if (!playlistId) return;
        
        if (this.currentService === 'spotify') {
            this.spotifyPlayer.innerHTML = `
                <iframe src="https://open.spotify.com/embed/playlist/${playlistId}" 
                    width="100%" 
                    height="380" 
                    frameborder="0" 
                    allowtransparency="true" 
                    allow="encrypted-media">
                </iframe>
            `;
        } else {
            this.youtubePlayer.innerHTML = `
                <iframe width="100%" 
                    height="380" 
                    src="https://www.youtube.com/embed/videoseries?list=${playlistId}" 
                    frameborder="0" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
                </iframe>
            `;
        }
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        this.playPauseBtn.innerHTML = this.isPlaying ? 
            '<span class="material-icons">pause</span>' : 
            '<span class="material-icons">play_arrow</span>';
        
        const iframe = this.currentService === 'spotify' ? 
            this.spotifyPlayer.querySelector('iframe') : 
            this.youtubePlayer.querySelector('iframe');
            
        if (iframe) {
            iframe.contentWindow.postMessage({ 
                command: this.isPlaying ? 'play' : 'pause' 
            }, '*');
        }
    }

    previousTrack() {
        const iframe = this.currentService === 'spotify' ? 
            this.spotifyPlayer.querySelector('iframe') : 
            this.youtubePlayer.querySelector('iframe');
            
        if (iframe) {
            iframe.contentWindow.postMessage({ command: 'prev' }, '*');
        }
    }

    nextTrack() {
        const iframe = this.currentService === 'spotify' ? 
            this.spotifyPlayer.querySelector('iframe') : 
            this.youtubePlayer.querySelector('iframe');
            
        if (iframe) {
            iframe.contentWindow.postMessage({ command: 'next' }, '*');
        }
    }
}

// Tab Timer functionality
class TabTimer {
    constructor() {
        this.siteUrl = document.getElementById('siteUrl');
        this.timeLimit = document.getElementById('timeLimit');
        this.addLimitBtn = document.getElementById('addLimit');
        this.sitesList = document.getElementById('sitesList');
        this.currentTabInfo = document.getElementById('currentTabInfo');
        
        this.setupEventListeners();
        this.loadCurrentTab();
        this.loadSites();
    }

    setupEventListeners() {
        this.addLimitBtn.addEventListener('click', () => this.addTimeLimit());
    }

    async loadCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            const hostname = new URL(tab.url).hostname;
            this.currentTabInfo.querySelector('.site-url').textContent = hostname;
            
            const response = await chrome.runtime.sendMessage({ 
                type: 'GET_TAB_TIMERS'
            });
            
            if (response.tabTimers && response.tabTimers[hostname]) {
                const minutes = Math.floor(response.tabTimers[hostname].timeSpent / 60);
                const seconds = response.tabTimers[hostname].timeSpent % 60;
                this.currentTabInfo.querySelector('#currentTabTime').textContent = 
                    `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    async loadSites() {
        const response = await chrome.runtime.sendMessage({ type: 'GET_TAB_TIMERS' });
        this.sitesList.innerHTML = '';
        
        if (response.tabTimers) {
            Object.entries(response.tabTimers).forEach(([site, data]) => {
                const siteElement = document.createElement('div');
                siteElement.className = 'site-item';
                
                const minutes = Math.floor(data.timeSpent / 60);
                const limitMinutes = Math.floor(data.timeLimit / 60);
                
                siteElement.innerHTML = `
                    <div class="site-info">
                        <span class="site-name">${site}</span>
                        <span class="site-time">${minutes} min / ${limitMinutes} min</span>
                    </div>
                    <div class="site-actions">
                        <button class="btn" onclick="tabTimer.resetSite('${site}')">
                            <span class="material-icons">restore</span>
                        </button>
                        <button class="btn" onclick="tabTimer.removeSite('${site}')">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                `;
                
                this.sitesList.appendChild(siteElement);
            });
        }
    }

    async addTimeLimit() {
        const site = this.siteUrl.value.trim();
        const limit = parseInt(this.timeLimit.value) * 60; // Convert to seconds
        
        if (site && limit) {
            await chrome.runtime.sendMessage({
                type: 'UPDATE_TAB_TIMER',
                url: site,
                timer: {
                    timeSpent: 0,
                    timeLimit: limit
                }
            });
            
            this.siteUrl.value = '';
            this.timeLimit.value = '';
            this.loadSites();
        }
    }

    async resetSite(site) {
        await chrome.runtime.sendMessage({
            type: 'RESET_TIMER',
            url: site
        });
        this.loadSites();
    }

    async removeSite(site) {
        await chrome.runtime.sendMessage({
            type: 'REMOVE_SITE',
            url: site
        });
        this.loadSites();
    }
}

// Settings functionality
class Settings {
    constructor() {
        this.workDuration = document.getElementById('workDuration');
        this.shortBreakDuration = document.getElementById('shortBreakDuration');
        this.longBreakDuration = document.getElementById('longBreakDuration');
        this.sessionsBeforeLongBreak = document.getElementById('sessionsBeforeLongBreak');
        this.notifySound = document.getElementById('notifySound');
        this.notifyDesktop = document.getElementById('notifyDesktop');
        this.enableBlocking = document.getElementById('enableBlocking');
        this.colorTheme = document.getElementById('colorTheme');
        this.saveBtn = document.getElementById('saveSettings');
        this.resetBtn = document.getElementById('resetSettings');
        this.logoutSpotifyBtn = document.getElementById('logoutSpotify');
        this.logoutYoutubeBtn = document.getElementById('logoutYoutube');
        
        this.setupEventListeners();
        this.loadSettings();
    }

    setupEventListeners() {
        this.saveBtn.addEventListener('click', () => this.saveSettings());
        this.resetBtn.addEventListener('click', () => this.resetSettings());
        this.logoutSpotifyBtn.addEventListener('click', () => this.logout('spotify'));
        this.logoutYoutubeBtn.addEventListener('click', () => this.logout('youtube'));
        this.colorTheme.addEventListener('change', () => this.updateTheme());
    }

    async loadSettings() {
        const settings = await chrome.storage.local.get('settings');
        if (settings.settings) {
            this.workDuration.value = settings.settings.pomodoroSettings.workDuration;
            this.shortBreakDuration.value = settings.settings.pomodoroSettings.shortBreakDuration;
            this.longBreakDuration.value = settings.settings.pomodoroSettings.longBreakDuration;
            this.sessionsBeforeLongBreak.value = settings.settings.pomodoroSettings.sessionsBeforeLongBreak;
            this.notifySound.checked = settings.settings.notifications.sound;
            this.notifyDesktop.checked = settings.settings.notifications.desktop;
            this.enableBlocking.checked = settings.settings.blockingEnabled;
            this.colorTheme.value = settings.settings.theme || 'dark';
            this.updateTheme();
        }
    }

    async saveSettings() {
        const settings = {
            pomodoroSettings: {
                workDuration: parseInt(this.workDuration.value),
                shortBreakDuration: parseInt(this.shortBreakDuration.value),
                longBreakDuration: parseInt(this.longBreakDuration.value),
                sessionsBeforeLongBreak: parseInt(this.sessionsBeforeLongBreak.value)
            },
            notifications: {
                sound: this.notifySound.checked,
                desktop: this.notifyDesktop.checked
            },
            blockingEnabled: this.enableBlocking.checked,
            theme: this.colorTheme.value
        };
        
        await chrome.storage.local.set({ settings });
        await chrome.runtime.sendMessage({
            type: 'UPDATE_SETTINGS',
            settings
        });
    }

    resetSettings() {
        const defaultSettings = {
            pomodoroSettings: {
                workDuration: 25,
                shortBreakDuration: 5,
                longBreakDuration: 15,
                sessionsBeforeLongBreak: 4
            },
            notifications: {
                sound: true,
                desktop: true
            },
            blockingEnabled: true,
            theme: 'dark'
        };
        
        this.workDuration.value = defaultSettings.pomodoroSettings.workDuration;
        this.shortBreakDuration.value = defaultSettings.pomodoroSettings.shortBreakDuration;
        this.longBreakDuration.value = defaultSettings.pomodoroSettings.longBreakDuration;
        this.sessionsBeforeLongBreak.value = defaultSettings.pomodoroSettings.sessionsBeforeLongBreak;
        this.notifySound.checked = defaultSettings.notifications.sound;
        this.notifyDesktop.checked = defaultSettings.notifications.desktop;
        this.enableBlocking.checked = defaultSettings.blockingEnabled;
        this.colorTheme.value = defaultSettings.theme;
        
        this.saveSettings();
    }

    async logout(service) {
        if (service === 'spotify') {
            await chrome.storage.local.remove('spotifyToken');
            this.logoutSpotifyBtn.disabled = true;
        } else if (service === 'youtube') {
            await chrome.storage.local.remove('youtubeToken');
            this.logoutYoutubeBtn.disabled = true;
        }
        window.mediaPlayer.checkLoginStatus();
    }

    updateTheme() {
        document.body.className = this.colorTheme.value;
    }
}

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
    window.taskManager = new TaskManager();
    window.navigation = new Navigation();
    window.mediaPlayer = new MediaPlayer();
    window.tabTimer = new TabTimer();
    window.settings = new Settings();
}); 