// ========================================
// SHARED IN-MEMORY DATA STORE
// ========================================
// This module provides a simple in-memory store shared across serverless functions
// Note: Data persists during active usage but resets on cold starts

const store = {
    // Latest sensor data from ESP32
    sensorData: {
        turbidity: 0,
        ph: 7.0,
        batteryVoltage: 12.0,
        batteryLevel: 0,
        waterSensor1: 0,
        waterSensor2: 0,
        relay1Status: 'off',
        relay2Status: 'off',
        lastUpdated: new Date().toISOString()
    },

    // Current system status
    systemStatus: {
        status: 'idle', // 'idle', 'purifying', 'alert'
        mode: 'auto', // 'auto', 'manual'
        waterQuality: 'good', // 'good', 'not_safe'
    },

    // Command queue for ESP32
    commandQueue: [],

    // Alert history (max 50 alerts)
    alerts: [],

    // Thresholds for alert generation
    thresholds: {
        turbidity: { good: 5, warning: 10 },
        ph: { min_good: 6.5, max_good: 8.5, min_warning: 6.0, max_warning: 9.0 },
        battery: { low: 20, warning: 40 },
        waterSensor: { low: 1000, empty: 500 } // Analog thresholds
    }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Add command to queue
 */
function addCommand(command, params = {}) {
    store.commandQueue.push({
        command,
        ...params,
        timestamp: new Date().toISOString()
    });
}

/**
 * Get and clear next command from queue
 */
function getNextCommand() {
    if (store.commandQueue.length === 0) {
        return null;
    }
    return store.commandQueue.shift();
}

/**
 * Update sensor data
 */
function updateSensorData(data) {
    store.sensorData = {
        ...store.sensorData,
        ...data,
        lastUpdated: new Date().toISOString()
    };

    // Check thresholds and generate alerts
    checkThresholdsAndGenerateAlerts(data);
}

/**
 * Update system status
 */
function updateSystemStatus(status) {
    store.systemStatus = {
        ...store.systemStatus,
        ...status
    };
}

/**
 * Add alert to history
 */
function addAlert(type, title, message) {
    const alert = {
        id: Date.now(),
        type, // 'info', 'success', 'warning', 'error'
        title,
        message,
        timestamp: new Date().toISOString()
    };

    store.alerts.unshift(alert); // Add to beginning

    // Keep only last 50 alerts
    if (store.alerts.length > 50) {
        store.alerts = store.alerts.slice(0, 50);
    }
}

/**
 * Check sensor thresholds and generate alerts
 */
function checkThresholdsAndGenerateAlerts(data) {
    const { thresholds } = store;

    // Check battery level
    if (data.batteryLevel !== undefined) {
        if (data.batteryLevel < thresholds.battery.low) {
            addAlert('error', 'Critical Battery Level', `Battery at ${data.batteryLevel}%. Immediate charging required.`);
            updateSystemStatus({ status: 'alert' });
        } else if (data.batteryLevel < thresholds.battery.warning) {
            addAlert('warning', 'Low Battery', `Battery level is at ${data.batteryLevel}%. Consider charging.`);
        }
    }

    // Check turbidity
    if (data.turbidity !== undefined) {
        if (data.turbidity > thresholds.turbidity.warning) {
            addAlert('error', 'Water Quality Issue', `Turbidity is ${data.turbidity} NTU (high). Water not safe.`);
            updateSystemStatus({ waterQuality: 'not_safe' });
        } else if (data.turbidity > thresholds.turbidity.good) {
            addAlert('warning', 'Turbidity Warning', `Turbidity is ${data.turbidity} NTU (elevated).`);
        }
    }

    // Check pH
    if (data.ph !== undefined) {
        const { min_good, max_good, min_warning, max_warning } = thresholds.ph;
        if (data.ph < min_warning || data.ph > max_warning) {
            addAlert('error', 'pH Out of Range', `pH level is ${data.ph} (critical range).`);
            updateSystemStatus({ waterQuality: 'not_safe' });
        } else if (data.ph < min_good || data.ph > max_good) {
            addAlert('warning', 'pH Warning', `pH level is ${data.ph} (outside optimal range).`);
        }
    }

    // Check water level (Dirty Container)
    if (data.waterSensor1 !== undefined && data.waterSensor1 < thresholds.waterSensor.low) {
        addAlert('warning', 'Low Water Level', 'The dirty water container is running low.');
    }
}

/**
 * Get complete system state
 */
function getSystemState() {
    return {
        ...store.systemStatus,
        ...store.sensorData,
        systemStatus: store.systemStatus.status,
        mode: store.systemStatus.mode,
        waterQuality: store.systemStatus.waterQuality
    };
}

/**
 * Get alerts
 */
function getAlerts() {
    return store.alerts;
}

// ========================================
// EXPORTS
// ========================================
module.exports = {
    store,
    addCommand,
    getNextCommand,
    updateSensorData,
    updateSystemStatus,
    addAlert,
    getSystemState,
    getAlerts
};
