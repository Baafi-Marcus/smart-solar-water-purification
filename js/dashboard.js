// ========================================
// DASHBOARD PAGE LOGIC
// ========================================

class Dashboard {
    constructor() {
        this.pollingInterval = null;
        this.currentStatus = null;
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    init() {
        this.setupEventListeners();
        this.loadStatus();

        // Start auto-refresh if enabled
        if (CONFIG.FEATURES.AUTO_REFRESH) {
            this.startPolling();
        }
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.handleStart());
        document.getElementById('stopBtn').addEventListener('click', () => this.handleStop());
        document.getElementById('chlorineBtn').addEventListener('click', () => this.handleChlorineDose());
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadStatus());

        // Mode toggle
        document.getElementById('modeToggle').addEventListener('change', (e) => this.handleModeToggle(e));
    }

    // ========================================
    // DATA LOADING
    // ========================================

    async loadStatus() {
        try {
            const status = await api.getStatus();
            this.currentStatus = status;
            this.updateUI(status);
            this.updateLastUpdated();
        } catch (error) {
            console.error('Failed to load status:', error);
            this.showFeedback('Failed to load system status', 'error');
        }
    }

    // ========================================
    // UI UPDATES
    // ========================================

    updateUI(status) {
        this.updateSystemStatus(status.systemStatus);
        this.updateBatteryLevel(status.batteryLevel);
        this.updateWaterQuality(status.waterQuality);
        this.updateWaterLevel(status.waterLevel);
        this.updateMode(status.mode);
        this.updateControlButtons(status.systemStatus);
    }

    updateSystemStatus(systemStatus) {
        const statusDisplay = document.getElementById('statusDisplay');
        const statusLabel = document.getElementById('statusLabel');
        const statusMessage = document.getElementById('statusMessage');

        // Remove all status classes
        statusDisplay.classList.remove('status-display-idle', 'status-display-active', 'status-display-alert');

        switch (systemStatus) {
            case 'idle':
                statusDisplay.classList.add('status-display-idle');
                statusLabel.textContent = 'IDLE';
                statusMessage.textContent = 'System ready';
                break;
            case 'purifying':
                statusDisplay.classList.add('status-display-active');
                statusLabel.textContent = 'PURIFYING';
                statusMessage.textContent = 'Purification in progress';
                break;
            case 'alert':
                statusDisplay.classList.add('status-display-alert');
                statusLabel.textContent = 'ALERT';
                statusMessage.textContent = 'Attention required';
                break;
        }
    }

    updateBatteryLevel(level) {
        const batteryText = document.getElementById('batteryText');
        const batteryCircle = document.getElementById('batteryCircle');
        const batteryStatus = document.getElementById('batteryStatus');

        // Update text
        batteryText.textContent = `${level}%`;

        // Update circular progress
        const circumference = 326.73;
        const offset = circumference - (level / 100) * circumference;
        batteryCircle.style.strokeDashoffset = offset;

        // Update status badge
        batteryStatus.classList.remove('status-badge-success', 'status-badge-warning', 'status-badge-error');

        if (level > CONFIG.THRESHOLDS.BATTERY.WARNING) {
            batteryStatus.classList.add('status-badge-success');
            batteryStatus.innerHTML = '<span class="status-dot status-dot-success"></span> Good';
            batteryCircle.style.stroke = 'var(--color-success)';
        } else if (level > CONFIG.THRESHOLDS.BATTERY.LOW) {
            batteryStatus.classList.add('status-badge-warning');
            batteryStatus.innerHTML = '<span class="status-dot status-dot-warning"></span> Low';
            batteryCircle.style.stroke = 'var(--color-warning)';
        } else {
            batteryStatus.classList.add('status-badge-error');
            batteryStatus.innerHTML = '<span class="status-dot status-dot-error"></span> Critical';
            batteryCircle.style.stroke = 'var(--color-error)';
        }
    }

    updateWaterQuality(quality) {
        const badge = document.getElementById('waterQualityBadge');
        badge.classList.remove('status-badge-success', 'status-badge-error');

        if (quality === 'good') {
            badge.classList.add('status-badge-success');
            badge.textContent = 'Good';
        } else {
            badge.classList.add('status-badge-error');
            badge.textContent = 'Not Safe';
        }
    }

    updateWaterLevel(level) {
        const badge = document.getElementById('waterLevelBadge');
        badge.classList.remove('status-badge-success', 'status-badge-warning');

        if (level === 'normal') {
            badge.classList.add('status-badge-success');
            badge.textContent = 'Normal';
        } else {
            badge.classList.add('status-badge-warning');
            badge.textContent = 'Low';
        }
    }

    updateMode(mode) {
        const toggle = document.getElementById('modeToggle');
        const label = document.getElementById('modeLabel');

        toggle.checked = mode === 'auto';
        label.textContent = mode === 'auto' ? 'Auto Mode' : 'Manual Mode';
    }

    updateControlButtons(systemStatus) {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');

        if (systemStatus === 'purifying') {
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }

    updateLastUpdated() {
        const lastUpdated = document.getElementById('lastUpdated');
        const now = new Date();
        lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }

    // ========================================
    // COMMAND HANDLERS
    // ========================================

    async handleStart() {
        try {
            this.showFeedback('Starting purification...', 'info');
            const response = await api.sendCommand('start');

            if (response.success) {
                this.showFeedback('Purification started successfully', 'success');
                setTimeout(() => this.loadStatus(), 1000);
            } else {
                this.showFeedback('Failed to start purification', 'error');
            }
        } catch (error) {
            console.error('Start command failed:', error);
            this.showFeedback('Failed to send start command', 'error');
        }
    }

    async handleStop() {
        try {
            this.showFeedback('Stopping purification...', 'info');
            const response = await api.sendCommand('stop');

            if (response.success) {
                this.showFeedback('Purification stopped successfully', 'success');
                setTimeout(() => this.loadStatus(), 1000);
            } else {
                this.showFeedback('Failed to stop purification', 'error');
            }
        } catch (error) {
            console.error('Stop command failed:', error);
            this.showFeedback('Failed to send stop command', 'error');
        }
    }

    async handleChlorineDose() {
        try {
            this.showFeedback('Initiating chlorine dosing...', 'info');
            const response = await api.sendCommand('chlorine', { dosage: 0.5 }); // Default 0.5 mg/L

            if (response.success) {
                this.showFeedback('Chlorine dosing command sent', 'success');
            } else {
                this.showFeedback('Failed to initiate dosing', 'error');
            }
        } catch (error) {
            console.error('Chlorine dose command failed:', error);
            this.showFeedback('Failed to send dosing command', 'error');
        }
    }

    async handleModeToggle(event) {
        const mode = event.target.checked ? 'auto' : 'manual';

        try {
            this.showFeedback(`Switching to ${mode} mode...`, 'info');
            const response = await api.sendCommand('mode', { mode });

            if (response.success) {
                this.showFeedback(`Switched to ${mode} mode`, 'success');
                this.updateMode(mode);
            } else {
                // Revert toggle on failure
                event.target.checked = !event.target.checked;
                this.showFeedback('Failed to change mode', 'error');
            }
        } catch (error) {
            console.error('Mode toggle failed:', error);
            event.target.checked = !event.target.checked;
            this.showFeedback('Failed to change mode', 'error');
        }
    }

    // ========================================
    // FEEDBACK MESSAGES
    // ========================================

    showFeedback(message, type = 'info') {
        const feedbackEl = document.getElementById('feedbackMessage');

        // Clear existing classes
        feedbackEl.className = 'alert mt-lg';

        // Add type-specific class
        feedbackEl.classList.add(`alert-${type}`);

        // Set content
        feedbackEl.innerHTML = `
      <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${this.getIconPath(type)}
      </svg>
      <div class="alert-content">
        <p class="alert-message">${message}</p>
      </div>
    `;

        // Show message
        feedbackEl.style.display = 'flex';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            feedbackEl.style.display = 'none';
        }, 5000);
    }

    getIconPath(type) {
        const icons = {
            info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
            success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
            warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
            error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        };
        return icons[type] || icons.info;
    }

    // ========================================
    // POLLING
    // ========================================

    startPolling() {
        this.pollingInterval = setInterval(() => {
            this.loadStatus();
        }, CONFIG.POLLING_INTERVAL.DASHBOARD);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
