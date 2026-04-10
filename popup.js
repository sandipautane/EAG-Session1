document.addEventListener('DOMContentLoaded', () => {
  loadData();
  
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear todays usage history?')) {
      const today = getTodayKey();
      chrome.storage.local.remove([today], () => {
        loadData();
      });
    }
  });

  // Update time dynamically every second if the popup is open
  setInterval(() => {
    loadData();
  }, 1000);
});

function getTodayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${totalSeconds % 60}s`;
}

function loadData() {
  const today = getTodayKey();
  
  chrome.storage.local.get([today], (result) => {
    // Current domain might be tracking right now, but background script updates store every 30s or on pause
    // To be perfectly accurate we could ask the background script for 'live' seconds, but this is fine for MVP.
    const data = result[today] || {};
    renderStats(data);
  });
}

function renderStats(domainData) {
  const siteList = document.getElementById('site-list');
  const totalTimeEl = document.getElementById('total-time');
  const totalProgress = document.getElementById('total-progress');
  
  const entries = Object.entries(domainData);
  
  if (entries.length === 0) {
    siteList.innerHTML = '<div class="empty-state">No usage data for today yet.<br/>Start browsing to track time!</div>';
    totalTimeEl.textContent = '0m 0s';
    totalProgress.style.width = '0%';
    return;
  }
  
  // Sort by highest time first
  entries.sort((a, b) => b[1] - a[1]);
  
  let totalTime = 0;
  entries.forEach(([_, time]) => totalTime += time);
  
  totalTimeEl.textContent = formatTime(totalTime);
  totalProgress.style.width = '100%'; 
  
  // Highest time for scaling individual progress bars
  const maxTime = entries[0][1];

  let htmlContent = '';

  entries.forEach(([domain, time], index) => {
    const percentage = Math.max(2, (time / maxTime) * 100); // at least 2% to show some bar
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const fallbackIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0xMiAyYTE1LjMgMTUuMyAwIDAgMSw0IDEwIDE1LjMgMTUuMyAwIDAgMS00IDEwIDE1LjMgMTUuMyAwIDAgMS00LTEwIDE1LjMgMTUuMyAwIDAgMSw0LTEweiIvPjxwYXRoIGQ9Ik0yIDEyaDIwIi8+PC9zdmc+';

    htmlContent += `
      <li class="site-item" style="animation-delay: ${index * 0.05}s">
        <img src="${faviconUrl}" class="site-favicon" alt="Icon" onerror="this.src='${fallbackIcon}'">
        <div class="site-info">
          <div class="site-domain">${domain}</div>
          <div class="site-progress-bg">
            <div class="site-progress-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
        <div class="site-time">${formatTime(time)}</div>
      </li>
    `;
  });
  
  // Update innerHTML
  if (siteList.innerHTML !== htmlContent) {
      siteList.innerHTML = htmlContent;
  }
}
