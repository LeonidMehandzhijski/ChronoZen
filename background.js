// Handle tab time tracking and website blocking
let tabTimers = {};
let settings = {
  blockingEnabled: true,
  notifications: {
    sound: true,
    desktop: true
  }
};

// Load settings from storage
chrome.storage.local.get(['settings'], (result) => {
  if (result.settings) {
    settings = result.settings;
  }
});

// Track active tab time
let activeTabId = null;
let activeTabUrl = null;
let lastUpdateTime = Date.now();

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    updateTimeSpent();
    activeTabId = tab.id;
    activeTabUrl = new URL(tab.url).hostname;
    lastUpdateTime = Date.now();
  }
});

function updateTimeSpent() {
  if (activeTabUrl && tabTimers[activeTabUrl]) {
    const currentTime = Date.now();
    const timeSpent = Math.floor((currentTime - lastUpdateTime) / 1000);
    
    tabTimers[activeTabUrl].timeSpent += timeSpent;
    lastUpdateTime = currentTime;

    chrome.storage.local.set({ tabTimers });

    if (tabTimers[activeTabUrl].timeSpent >= tabTimers[activeTabUrl].timeLimit) {
      blockTab(activeTabId);
    }
  }
}

function blockTab(tabId) {
  if (settings.blockingEnabled) {
    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL('blocked.html')
    });

    if (settings.notifications.desktop) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Time Limit Reached',
        message: 'You have reached the time limit for this website.'
      });
    }
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_TAB_TIMERS':
      sendResponse({ tabTimers });
      break;
      
    case 'UPDATE_TAB_TIMER':
      tabTimers[request.url] = request.timer;
      chrome.storage.local.set({ tabTimers });
      sendResponse({ success: true });
      break;
      
    case 'UPDATE_SETTINGS':
      settings = { ...settings, ...request.settings };
      chrome.storage.local.set({ settings });
      sendResponse({ success: true });
      break;
      
    case 'RESET_TIMER':
      if (tabTimers[request.url]) {
        tabTimers[request.url].timeSpent = 0;
        chrome.storage.local.set({ tabTimers });
        sendResponse({ success: true });
      }
      break;
  }
  return true;
});

// Update time spent every second
setInterval(updateTimeSpent, 1000);

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      settings: {
        blockingEnabled: true,
        notifications: {
          sound: true,
          desktop: true
        },
        pomodoroSettings: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsBeforeLongBreak: 4
        }
      }
    });
  }
}); 