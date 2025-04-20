// src/background/service-worker.js

const ALARM_NAME = 'pomodoroAlarm';
const WORK_MINUTES = 25; // Get these from chrome.storage later
const SHORT_BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;
const SESSIONS_BEFORE_LONG_BREAK = 4;

const STATUS = {
    STOPPED: 'STOPPED',
    WORK: 'WORK',
    SHORT_BREAK: 'SHORT_BREAK',
    LONG_BREAK: 'LONG_BREAK',
};


// --- Alarm Listener ---
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAME) {
        console.log("Background: Pomodoro Alarm triggered!");

        // 1. Get current state from storage
        const data = await chrome.storage.local.get([
            'pomodoroStatus',
            'pomodoroSessionCount'
            // Potentially store target end time to be more robust
        ]);

        let currentStatus = data.pomodoroStatus || STATUS.STOPPED;
        let sessionCount = data.pomodoroSessionCount || 0;
        let nextStatus = STATUS.STOPPED;
        let nextDuration = WORK_MINUTES;
        let notificationMessage = '';
        let notificationTitle = 'Pomodoro Timer';

        // 2. Determine next state
        if (currentStatus === STATUS.WORK) {
            sessionCount++;
            notificationTitle = 'Pomodoro: Work Complete!';
            notificationMessage = 'Time for a break!';
            if (sessionCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
                nextStatus = STATUS.LONG_BREAK;
                nextDuration = LONG_BREAK_MINUTES;
            } else {
                nextStatus = STATUS.SHORT_BREAK;
                nextDuration = SHORT_BREAK_MINUTES;
            }
        } else if (currentStatus === STATUS.SHORT_BREAK || currentStatus === STATUS.LONG_BREAK) {
            nextStatus = STATUS.WORK;
            nextDuration = WORK_MINUTES;
            notificationTitle = 'Pomodoro: Break Over!';
            notificationMessage = 'Time to focus!';
        } else {
            // Should not happen if alarm is only set when running, but handle defensively
            console.warn("Alarm triggered while status was STOPPED.");
            await chrome.storage.local.set({ pomodoroStatus: STATUS.STOPPED }); // Ensure state is stopped
            return; // Don't set a new alarm
        }

        // 3. Update storage
        await chrome.storage.local.set({
            pomodoroStatus: nextStatus,
            pomodoroSessionCount: sessionCount,
            // Consider storing targetEndTime: Date.now() + nextDuration * 60 * 1000
        });

        // 4. Show Notification
        chrome.notifications.create({ // Use optional chaining as API might not be available everywhere instantly
            type: 'basic',
            iconUrl: '/icons/icon48.png', // Make sure this path is correct relative to manifest root
            title: notificationTitle,
            message: notificationMessage,
            priority: 2
        });

        // 5. Set the next alarm
        chrome.alarms.create(ALARM_NAME, {
            delayInMinutes: nextDuration
        });

        console.log(`Background: Transitioned to ${nextStatus}. Next alarm in ${nextDuration} min. Sessions: ${sessionCount}`);

        // Optional: Send message to popup if open
        // chrome.runtime.sendMessage({ type: 'POMODORO_UPDATE', status: nextStatus, timeLeft: nextDuration * 60, sessionCount });

    }
});

// --- Functions to be called from Popup/Options (using message passing) ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received message:", message); // Debugging
    if (message.command === 'startPomodoro') {
        startPomodoroTimer(WORK_MINUTES); // Or get duration from message.duration
        sendResponse({ success: true });
    } else if (message.command === 'stopPomodoro') {
        stopPomodoroTimer();
        sendResponse({ success: true });
    }
    // Indicate async response potentially needed if operations are async
    return true;
});

async function startPomodoroTimer(durationMinutes) {
    console.log("Background: Starting timer...");
    await chrome.alarms.clear(ALARM_NAME); // Clear previous alarm if any
    await chrome.storage.local.set({
        pomodoroStatus: STATUS.WORK,
        pomodoroSessionCount: 0, // Reset count on new start, or load existing? Decide strategy.
        // targetEndTime: Date.now() + durationMinutes * 60 * 1000
    });
    chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: durationMinutes
    });
    console.log(`Background: Timer started. Alarm set for ${durationMinutes} minutes.`);
}

async function stopPomodoroTimer() {
    console.log("Background: Stopping timer...");
    await chrome.alarms.clear(ALARM_NAME);
    await chrome.storage.local.set({
        pomodoroStatus: STATUS.STOPPED
        // Optionally reset session count here too
        // pomodoroSessionCount: 0
    });
    console.log("Background: Timer stopped and alarm cleared.");
}


// --- Extension Lifecycle ---
chrome.runtime.onInstalled.addListener(() => {
    console.log("Ascend Productivity Suite installed.");
    // Set default settings on install
    chrome.storage.local.set({
        pomodoroStatus: STATUS.STOPPED,
        pomodoroSessionCount: 0,
        workDuration: WORK_MINUTES,
        shortBreakDuration: SHORT_BREAK_MINUTES,
        longBreakDuration: LONG_BREAK_MINUTES,
        sessionsBeforeLongBreak: SESSIONS_BEFORE_LONG_BREAK,
        tasks: [], // Initialize empty tasks array
        // Add other default settings
    });
});

console.log("Background service worker started."); // Log when the SW starts/restarts