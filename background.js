let activeBrowserTabId = null;
let currentDomain = null;
let startTime = null;

// Ensure we only track time when the user is active
let isIdle = false;
const IDLE_THRESHOLD_SECONDS = 60; // 1 minute of inactivity

chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SECONDS);

chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === 'active') {
    isIdle = false;
    resumeTracking();
  } else {
    isIdle = true;
    pauseTracking();
  }
});

// Tab gets activated (switched to)
chrome.tabs.onActivated.addListener((activeInfo) => {
  handleTabChange(activeInfo.tabId);
});

// A window gets focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    pauseTracking();
  } else {
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs.length > 0) {
        handleTabChange(tabs[0].id);
      }
    });
  }
});

// TabURL gets updated (e.g., user navs to a new site within same tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    handleTabChange(tabId);
  }
});

function handleTabChange(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      pauseTracking();
      return;
    }
    
    if (tab.url) {
      try {
        const urlObj = new URL(tab.url);
        // Ignore extension pages or empty pages
        if (urlObj.protocol.startsWith('http')) {
          const domain = urlObj.hostname.replace(/^www\./, '');
          switchDomain(domain);
        } else {
          pauseTracking();
        }
      } catch (e) {
        pauseTracking();
      }
    }
  });
}

function switchDomain(newDomain) {
  // If we were tracking something before, save it
  if (currentDomain) {
    pauseTracking();
  }
  
  if (!isIdle) {
    currentDomain = newDomain;
    startTime = Date.now();
  }
}

function pauseTracking() {
  if (currentDomain && startTime) {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    if (timeSpent > 0) {
      saveTime(currentDomain, timeSpent);
    }
  }
  currentDomain = null;
  startTime = null;
}

function resumeTracking() {
  if (!currentDomain) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        handleTabChange(tabs[0].id);
      }
    });
  } else {
    startTime = Date.now();
  }
}

function getTodayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function saveTime(domain, seconds) {
  const today = getTodayKey();
  
  chrome.storage.local.get([today], (result) => {
    const todayData = result[today] || {};
    todayData[domain] = (todayData[domain] || 0) + seconds;
    
    chrome.storage.local.set({ [today]: todayData });
  });
}

// Whenever extension gets unloaded/suspended
chrome.runtime.onSuspend.addListener(() => {
  pauseTracking();
});

// Set up periodic sync just in case of crash
setInterval(() => {
    if (currentDomain && startTime) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        if (timeSpent > 0) {
            saveTime(currentDomain, timeSpent);
            startTime = Date.now(); // reset start time since we just saved
        }
    }
}, 30000); // sync every 30 seconds

// Initialize on start
resumeTracking();
