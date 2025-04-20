# ChronoZen

> Stay focused, be productive, and enjoy your music - all in one Chrome extension!

![Chrome Web Store](https://img.shields.io/badge/Platform-Chrome-brightgreen.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

<p align="center">
  <img src="icons/icon128.png" alt="Productivity Suite Pro Logo" width="128" height="128">
</p>

## What's This?

ChronoZen is your all-in-one productivity companion that lives right in your browser! It combines everything you need to stay focused and productive:

- **Pomodoro Timer** - Work smarter with customizable work/break sessions
- **Task Manager** - Keep track of your to-dos
- **Music Controls** - Control Spotify and YouTube Music without switching tabs
- **Website Timer** - Track and limit time on distracting sites
- **Dark/Light Mode** - Easy on your eyes, day or night

## Why You'll Love It

- **Stay Focused**: Block distracting sites when you need to concentrate
- **Music Integration**: Control your tunes without leaving your work
- **Track Progress**: See how you spend your time online
- **Sync & Save**: Your tasks and settings are always there
- **Clean Design**: Modern UI that's easy to use

## Features

- **Pomodoro Timer**
  - Customizable work and break durations
  - Desktop notifications
  - Sound alerts
  - Session tracking

- **Task Management**
  - Add and manage tasks
  - Mark tasks as complete
  - Persistent storage

- **Media Integration**
  - Spotify integration
  - YouTube Music integration
  - Control playback from the extension
  - View and select playlists

- **Website Time Tracking**
  - Track time spent on websites
  - Set daily time limits
  - Block websites when limits are reached
  - View usage statistics

- **Customization**
  - Dark/Light theme
  - Notification settings
  - Website blocking settings
  - Pomodoro timer settings

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LeonidMehandzhijski/ChronoZen.git
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the project directory

## Configuration

### Spotify Integration
1. Create a Spotify Developer account at https://developer.spotify.com/dashboard
2. Create a new application
3. Add `chrome-extension://YOUR_EXTENSION_ID/` to the Redirect URIs
4. Copy your Client ID and update it in `src/popup/index.js`

### YouTube Integration
1. Go to Google Cloud Console
2. Create a new project
3. Enable YouTube Data API
4. Create OAuth 2.0 credentials
5. Add `chrome-extension://YOUR_EXTENSION_ID/` to authorized redirect URIs
6. Copy your Client ID and update it in `src/popup/index.js`

## Development

The extension is built using vanilla JavaScript and Chrome Extension APIs. The project structure is:

```
/
├── src/
│   ├── popup/
│   │   ├── index.html
│   │   └── index.js
│   ├── background/
│   │   └── index.js
│   ├── content/
│   │   └── index.js
│   └── assets/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── manifest.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material Icons for the UI icons
- Material UI for styling inspiration
- Spotify Web Playback SDK
- YouTube IFrame Player API 
