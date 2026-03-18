// ========================================
// ALERTS PAGE LOGIC
// ========================================

class Alerts {
    constructor() {
        this.pollingInterval = null;
        this.alerts = [];
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    init() {
        this.setupEventListeners();
        this.loadAlerts();

        // Start auto-refresh
        if (CONFIG.FEATURES.AUTO_REFRESH) {
            this.startPolling();
        }
    }

    setupEventListeners() {
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadAlerts());
    }

    // ========================================
    // DATA LOADING
    // ========================================

    async loadAlerts() {
        try {
            const alerts = await api.getAlerts();
            this.alerts = alerts;
            this.updateUI();
            this.updateLastUpdated();
        } catch (error) {
            console.error('Failed to load alerts:', error);
            this.showError();
        }
    }

    // ========================================
    // UI UPDATES
    // ========================================

    updateUI() {
        this.updateSummary();
        this.renderAlerts();
    }

    updateSummary() {
        const total = this.alerts.length;
        const errors = this.alerts.filter(a => a.type === 'error').length;
        const warnings = this.alerts.filter(a => a.type === 'warning').length;
        const success = this.alerts.filter(a => a.type === 'success').length;

        document.getElementById('totalAlerts').textContent = total;
        document.getElementById('errorCount').textContent = errors;
        document.getElementById('warningCount').textContent = warnings;
        document.getElementById('successCount').textContent = success;
    }

    renderAlerts() {
        const alertsList = document.getElementById('alertsList');

        if (this.alerts.length === 0) {
            alertsList.innerHTML = `
        <div class="text-center p-xl">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin: 0 auto; color: var(--color-text-tertiary);">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="mt-md" style="color: var(--color-text-secondary);">No alerts to display</p>
        </div>
      `;
            return;
        }

        // Sort alerts by timestamp (newest first)
        const sortedAlerts = [...this.alerts].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        alertsList.innerHTML = sortedAlerts.map(alert => this.renderAlert(alert)).join('');
    }

    renderAlert(alert) {
        const icon = this.getAlertIcon(alert.type);
        const relativeTime = this.getRelativeTime(alert.timestamp);

        return `
      <div class="alert alert-${alert.type}">
        <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${icon}
        </svg>
        <div class="alert-content">
          <div class="alert-title">${alert.title}</div>
          <p class="alert-message">${alert.message}</p>
          <div class="alert-timestamp">${relativeTime}</div>
        </div>
      </div>
    `;
    }

    getAlertIcon(type) {
        const icons = {
            info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
            success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
            warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
            error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        };
        return icons[type] || icons.info;
    }

    getRelativeTime(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return then.toLocaleDateString();
    }

    updateLastUpdated() {
        const lastUpdated = document.getElementById('lastUpdated');
        const now = new Date();
        lastUpdated.textContent = `Updated: ${now.toLocaleTimeString()}`;
    }

    showError() {
        const alertsList = document.getElementById('alertsList');
        alertsList.innerHTML = `
      <div class="alert alert-error">
        <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="alert-content">
          <div class="alert-title">Failed to Load Alerts</div>
          <p class="alert-message">Unable to retrieve alert data. Please try again.</p>
        </div>
      </div>
    `;
    }

    // ========================================
    // POLLING
    // ========================================

    startPolling() {
        this.pollingInterval = setInterval(() => {
            this.loadAlerts();
        }, CONFIG.POLLING_INTERVAL.ALERTS);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
}

// Initialize alerts when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.alerts = new Alerts();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.alerts) {
        window.alerts.stopPolling();
    }
});
