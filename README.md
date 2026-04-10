# TimeScape - Usage Tracker

Seamlessly track, manage, and visualize your website usage time.

TimeScape is a modern, privacy-focused Chrome Extension that automatically tracks your browsing habits. It provides an elegant dashboard to view the time you spend on different websites, helping you stay mindful of your digital time.

## ✨ Features

- **Automatic Usage Tracking**: Silently monitors the active tab and logs the time spent on each website.
- **Idle Detection**: Automatically pauses tracking when you are inactive (idle) for more than 1 minute or when the browser window loses focus.
- **Daily Summaries**: Stores data locally for the day, allowing you to see your total browsing time and top sites visited.
- **Beautiful UI**: Features a clean, glassmorphism-inspired interface with animated progress bars and clear typography.
- **Privacy First**: All data is stored locally in your browser using Chrome Local Storage. No data is sent to external servers.

## 🚀 Installation

Currently, TimeScape is meant to be installed as an unpacked extension from this directory.

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** by toggling the switch in the top right corner.
4. Click the **Load unpacked** button that appears in the top left.
5. Select the `chrome-usage-tracker` directory.
6. The TimeScape extension should now appear in your list of extensions. Pin it to your toolbar for easy access!

## 🛠️ Technology Stack

- **Manifest V3**: Uses the latest Chrome Extension API standard.
- **Background Service Worker**: Handles all time tracking logic (`background.js`) persistently.
- **Vanilla JavaScript, HTML & CSS**: No heavy frameworks used, ensuring optimal performance.

## 📁 File Structure

- `manifest.json`: The extension's configuration file.
- `background.js`: Background script responsible for tracking active tabs, URLs, and idle states.
- `popup.html` / `popup.js` / `popup.css`: The UI and logic for the extension's popup that displays the stats.
- `icons/`: Directory containing the extension icons (`16x16`, `48x48`, `128x128`).

## 📝 Youtube Video Link

https://youtu.be/E-DB0cj21Ak
