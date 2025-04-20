import React, { useState, useEffect } from 'react';
import PomodoroTimer from '../components/PomodoroTimer'; // Import the timer component
// Import other components like TaskList later
// import './Popup.css'; // Add component-specific styles

function Popup() {
    const [activeTab, setActiveTab] = useState('timer'); // Example state for tabs

    // Basic styling (replace with CSS file later)
    const styles = {
        container: {
            width: '350px', // Adjust as needed
            padding: '15px',
            fontFamily: 'Arial, sans-serif',
        },
        nav: {
            display: 'flex',
            marginBottom: '15px',
            borderBottom: '1px solid #ccc',
        },
        navButton: {
            padding: '8px 12px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '1em',
        },
        navButtonActive: {
            borderBottom: '2px solid blue',
            fontWeight: 'bold',
        }
    };

    return (
        <div style={styles.container}>
            <h1>Ascend</h1>
            <nav style={styles.nav}>
                <button
                    style={{...styles.navButton, ...(activeTab === 'timer' ? styles.navButtonActive : {})}}
                    onClick={() => setActiveTab('timer')}
                >
                    Timer
                </button>
                <button
                    style={{...styles.navButton, ...(activeTab === 'tasks' ? styles.navButtonActive : {})}}
                    onClick={() => setActiveTab('tasks')}
                >
                    Tasks
                </button>
                {/* Add buttons for Media, Settings later */}
            </nav>

            {activeTab === 'timer' && <PomodoroTimer />}
            {/* {activeTab === 'tasks' && <TaskList />} */}
            {activeTab === 'tasks' && <div>Task List Placeholder</div>}

            {/* Add other sections based on activeTab */}

            {/* Link to Options Page */}
            <button onClick={() => chrome.runtime.openOptionsPage()} style={{ marginTop: '20px' }}>
                Settings
            </button>
        </div>
    );
}

export default Popup;