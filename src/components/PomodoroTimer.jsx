// src/components/PomodoroTimer.jsx (Modified Concepts - Incomplete)

import React, { useState, useEffect, useCallback } from 'react';

// ... (Keep constants and formatTime)

function PomodoroTimer() {
    const [status, setStatus] = useState(STATUS.STOPPED);
    const [displayTime, setDisplayTime] = useState(WORK_MINUTES * 60); // Visual time
    const [sessionCount, setSessionCount] = useState(0);
    const [targetEndTime, setTargetEndTime] = useState(null); // Store target end timestamp
    const [intervalId, setIntervalId] = useState(null);

    // --- Load state from storage ---
    const loadState = useCallback(async () => {
        try {
            const data = await chrome.storage.local.get([
                'pomodoroStatus',
                'pomodoroSessionCount',
                'pomodoroTargetEndTime', // Store the target end time for accuracy
                'workDuration',
                // ... other settings
            ]);

            const storedStatus = data.pomodoroStatus || STATUS.STOPPED;
            const storedTargetEndTime = data.pomodoroTargetEndTime;
            const storedSessionCount = data.pomodoroSessionCount || 0;
            const workDuration = (data.workDuration || WORK_MINUTES) * 60; // In seconds

            setStatus(storedStatus);
            setSessionCount(storedSessionCount);
            setTargetEndTime(storedTargetEndTime);

            if (storedStatus !== STATUS.STOPPED && storedTargetEndTime) {
                const now = Date.now();
                const remaining = Math.max(0, Math.round((storedTargetEndTime - now) / 1000));
                setDisplayTime(remaining);
            } else {
                setDisplayTime(workDuration); // Show default work duration when stopped
            }
        } catch (error) {
            console.error("Error loading timer state:", error);
            setDisplayTime(WORK_MINUTES * 60); // Fallback
        }
    }, []);

    useEffect(() => {
        loadState();

        // Listener for storage changes (alternative to messages)
        const storageListener = (changes, area) => {
            if (area === 'local' && (changes.pomodoroStatus || changes.pomodoroTargetEndTime || changes.pomodoroSessionCount)) {
                console.log("Storage changed, reloading state...");
                loadState(); // Reload state when background updates storage
            }
        };
        chrome.storage.onChanged.addListener(storageListener);

        return () => {
            chrome.storage.onChanged.removeListener(storageListener);
            if (intervalId) clearInterval(intervalId); // Cleanup interval
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadState]); // Load state once on mount


    // --- Visual Countdown Interval ---
    useEffect(() => {
        if (intervalId) clearInterval(intervalId); // Clear previous interval

        if (status !== STATUS.STOPPED && targetEndTime) {
            const newIntervalId = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, Math.round((targetEndTime - now) / 1000));
                setDisplayTime(remaining);
                if (remaining <= 0) {
                    // Interval stops itself visually, actual transition handled by background
                    clearInterval(newIntervalId);
                }
            }, 1000);
            setIntervalId(newIntervalId);
        } else {
            // Ensure display time is correct when stopped (e.g., show default work duration)
            chrome.storage.local.get(['workDuration'], (result) => {
                setDisplayTime((result.workDuration || WORK_MINUTES) * 60);
            });
        }

        return () => {
            if (newIntervalId) clearInterval(newIntervalId);
        };
    }, [status, targetEndTime]); // Rerun when status or target time changes


    // --- Actions ---
    const startWork = () => {
        console.log("Popup: Sending start command");
        chrome.runtime.sendMessage({ command: 'startPomodoro' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error starting timer:", chrome.runtime.lastError);
            } else if (response?.success) {
                console.log("Popup: Start command acknowledged");
                // Optionally force a state reload or wait for storage change listener
                loadState();
            } else {
                console.error("Popup: Background did not acknowledge start.");
            }
        });
    };

    const stopTimer = () => {
        console.log("Popup: Sending stop command");
        chrome.runtime.sendMessage({ command: 'stopPomodoro' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error stopping timer:", chrome.runtime.lastError);
            } else if (response?.success) {
                console.log("Popup: Stop command acknowledged");
                // Optionally force a state reload or wait for storage change listener
                loadState();
            } else {
                console.error("Popup: Background did not acknowledge stop.");
            }
        });
    };


    // --- Styles (keep previous styles) ---
    const styles = { /* ... */ };

    return (
        <div>
            {/* ... status text, timer display, controls using displayTime and startWork/stopTimer ... */}
            <div style={styles.statusText}> {/* Update status text */}
                {status !== STATUS.STOPPED ? `Status: ${status} (${sessionCount} sessions)` : 'Ready'}
            </div>
            <div style={styles.timerDisplay}>{formatTime(displayTime)}</div>
            <div style={styles.controls}>
                {status === STATUS.STOPPED ? (
                    <button style={styles.button} onClick={startWork}>Start Work</button>
                ) : (
                    <button style={styles.button} onClick={stopTimer}>Stop</button>
                )}
            </div>
        </div>
    );
}

export default PomodoroTimer;