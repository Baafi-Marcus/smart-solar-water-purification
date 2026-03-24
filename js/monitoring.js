// ========================================
// MONITORING PAGE LOGIC
// ========================================

class Monitoring {
    constructor() {
        this.pollingInterval = null;
        this.previousData = null;
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    init() {
        this.loadMonitoringData();

        // Start auto-refresh
        if (CONFIG.FEATURES.AUTO_REFRESH) {
            this.startPolling();
        }

        this.setupChlorineCalculator();
    }

    setupChlorineCalculator() {
        const volumeInput = document.getElementById('tankVolume');
        const calcBtn = document.getElementById('calculateBtn');

        if (volumeInput && calcBtn) {
            calcBtn.addEventListener('click', () => this.updateChlorineDosage());
            volumeInput.addEventListener('input', () => this.updateChlorineDosage());
            
            // Initial calculation
            this.updateChlorineDosage();
        }
    }

    updateChlorineDosage() {
        const volumeInput = document.getElementById('tankVolume');
        const potableEl = document.getElementById('potableDose');

        if (!volumeInput || !potableEl) return;

        const volume = parseFloat(volumeInput.value) || 0;
        
        // 1 tablet = 1000mg
        // Dose (tablets) = (Target 2.0 ppm * Volume L) / 1000 mg
        const potableTablets = (2.0 * volume) / 1000;

        potableEl.textContent = `${potableTablets.toFixed(2)} ${potableTablets === 1 ? 'Tablet' : 'Tablets'}`;
    }

    // ========================================
    // DATA LOADING
    // ========================================

    async loadMonitoringData() {
        try {
            const data = await api.getMonitoring();
            this.updateUI(data);
            this.updateConnectionStatus(true);
            this.updateLastUpdated();
            this.previousData = data;
        } catch (error) {
            console.error('Failed to load monitoring data:', error);
            this.updateConnectionStatus(false);
        }
    }

    // ========================================
    // UI UPDATES
    // ========================================

    updateUI(data) {
        this.updateTurbidity(data.turbidity);
        this.updatePH(data.ph);
        this.updateBatteryVoltage(data.batteryVoltage);
        this.updatePumpStatus('pump1', data.relay1Status);
        this.updatePumpStatus('pump2', data.relay2Status);
    }

    updateTurbidity(value) {
        const valueEl = document.getElementById('turbidityValue');
        const statusEl = document.getElementById('turbidityStatus');

        valueEl.textContent = value;

        // Update status based on thresholds
        statusEl.classList.remove('status-badge-success', 'status-badge-warning', 'status-badge-error');

        if (value < CONFIG.THRESHOLDS.TURBIDITY.GOOD) {
            statusEl.classList.add('status-badge-success');
            statusEl.textContent = 'Good';
        } else if (value < CONFIG.THRESHOLDS.TURBIDITY.WARNING) {
            statusEl.classList.add('status-badge-warning');
            statusEl.textContent = 'Fair';
        } else {
            statusEl.classList.add('status-badge-error');
            statusEl.textContent = 'Poor';
        }
    }

    updatePH(value) {
        const valueEl = document.getElementById('phValue');
        const statusEl = document.getElementById('phStatus');

        valueEl.textContent = value;

        // Update status based on thresholds
        statusEl.classList.remove('status-badge-success', 'status-badge-warning', 'status-badge-error');

        const { MIN_GOOD, MAX_GOOD, MIN_WARNING, MAX_WARNING } = CONFIG.THRESHOLDS.PH;

        if (value >= MIN_GOOD && value <= MAX_GOOD) {
            statusEl.classList.add('status-badge-success');
            statusEl.textContent = 'Good';
        } else if (value >= MIN_WARNING && value <= MAX_WARNING) {
            statusEl.classList.add('status-badge-warning');
            statusEl.textContent = 'Fair';
        } else {
            statusEl.classList.add('status-badge-error');
            statusEl.textContent = 'Poor';
        }
    }

    updateBatteryVoltage(voltage) {
        const valueEl = document.getElementById('batteryVoltage');
        const barEl = document.getElementById('voltageBar');

        valueEl.textContent = voltage;

        // Assuming 12V system: 10V (empty) to 14V (full)
        const minVoltage = 10;
        const maxVoltage = 14;
        const percentage = Math.min(100, Math.max(0, ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100));

        barEl.style.width = `${percentage}%`;

        // Color based on voltage
        if (percentage > 70) {
            barEl.style.background = 'linear-gradient(90deg, var(--color-success), var(--color-success))';
        } else if (percentage > 40) {
            barEl.style.background = 'linear-gradient(90deg, var(--color-warning), var(--color-warning))';
        } else {
            barEl.style.background = 'linear-gradient(90deg, var(--color-error), var(--color-error))';
        }
    }

    updatePumpStatus(pumpId, status) {
        const displayEl = document.getElementById(`${pumpId}StatusDisplay`);
        const labelEl = document.getElementById(`${pumpId}StatusLabel`);

        if (!displayEl || !labelEl) return;

        displayEl.classList.remove('status-display-idle', 'status-display-active');

        if (status === 'on') {
            displayEl.classList.add('status-display-active');
            labelEl.textContent = 'ON';
        } else {
            displayEl.classList.add('status-display-idle');
            labelEl.textContent = 'OFF';
        }
    }

    updateConnectionStatus(connected) {
        const statusEl = document.getElementById('connectionStatus');
        statusEl.classList.remove('status-badge-success', 'status-badge-error');

        if (connected) {
            statusEl.classList.add('status-badge-success');
            statusEl.innerHTML = '<span class="status-dot status-dot-success"></span> Connected';
        } else {
            statusEl.classList.add('status-badge-error');
            statusEl.innerHTML = '<span class="status-dot status-dot-error"></span> Disconnected';
        }
    }

    updateLastUpdated() {
        const lastUpdated = document.getElementById('lastUpdated');
        const now = new Date();
        lastUpdated.textContent = `Updated: ${now.toLocaleTimeString()}`;
    }

    // ========================================
    // POLLING
    // ========================================

    startPolling() {
        this.pollingInterval = setInterval(() => {
            this.loadMonitoringData();
        }, CONFIG.POLLING_INTERVAL.MONITORING);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
}

// Initialize monitoring when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.monitoring = new Monitoring();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.monitoring) {
        window.monitoring.stopPolling();
    }
});
