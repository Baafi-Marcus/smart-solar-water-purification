// ========================================
// API INTEGRATION LAYER
// ========================================

class API {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.useMock = CONFIG.FEATURES.MOCK_API;
    }

    // ========================================
    // MOCK DATA FOR TESTING
    // ========================================

    getMockStatus() {
        return {
            systemStatus: 'idle', // 'idle', 'purifying', 'alert'
            batteryLevel: 75,
            waterQuality: 'good', // 'good', 'not_safe'
            waterLevel: 'normal', // 'normal', 'low'
            mode: 'auto', // 'auto', 'manual'
            lastUpdated: new Date().toISOString()
        };
    }

    getMockMonitoring() {
        return {
            turbidity: 3.2,
            tds: 245,
            ph: 7.2,
            batteryVoltage: 12.4,
            pumpStatus: 'off', // 'on', 'off'
            lastUpdated: new Date().toISOString()
        };
    }

    getMockAlerts() {
        return [
            {
                id: 1,
                type: 'success',
                title: 'Purification Complete',
                message: 'Water purification cycle completed successfully',
                timestamp: new Date(Date.now() - 300000).toISOString() // 5 min ago
            },
            {
                id: 2,
                type: 'warning',
                title: 'Battery Low',
                message: 'Battery level is at 25%. Consider charging.',
                timestamp: new Date(Date.now() - 1800000).toISOString() // 30 min ago
            },
            {
                id: 3,
                type: 'info',
                title: 'System Started',
                message: 'Purification system initialized',
                timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            }
        ];
    }

    // ========================================
    // API METHODS
    // ========================================

    /**
     * Get current system status
     * @returns {Promise<Object>} System status data
     */
    async getStatus() {
        if (this.useMock) {
            return this.simulateDelay(this.getMockStatus());
        }

        try {
            const response = await fetch(`${this.baseURL}/api/status`);
            if (!response.ok) throw new Error('Failed to fetch status');
            return await response.json();
        } catch (error) {
            console.error('API Error (getStatus):', error);
            throw error;
        }
    }

    /**
     * Get live monitoring data
     * @returns {Promise<Object>} Sensor readings
     */
    async getMonitoring() {
        if (this.useMock) {
            // Add some randomness to mock data for realistic feel
            const data = this.getMockMonitoring();
            data.turbidity = (Math.random() * 5 + 2).toFixed(1);
            data.tds = Math.floor(Math.random() * 100 + 200);
            data.ph = (Math.random() * 1.5 + 6.5).toFixed(1);
            data.batteryVoltage = (Math.random() * 0.5 + 12).toFixed(1);
            return this.simulateDelay(data);
        }

        try {
            const response = await fetch(`${this.baseURL}/api/status`);
            if (!response.ok) throw new Error('Failed to fetch monitoring data');
            return await response.json();
        } catch (error) {
            console.error('API Error (getMonitoring):', error);
            throw error;
        }
    }

    /**
     * Send command to system
     * @param {string} command - Command type ('start', 'stop', 'mode')
     * @param {Object} params - Additional parameters
     * @returns {Promise<Object>} Command response
     */
    async sendCommand(command, params = {}) {
        if (this.useMock) {
            console.log('Mock command sent:', command, params);
            return this.simulateDelay({
                success: true,
                message: `Command '${command}' executed successfully`,
                timestamp: new Date().toISOString()
            });
        }

        try {
            const response = await fetch(`${this.baseURL}/api/command`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command, ...params })
            });

            if (!response.ok) throw new Error('Failed to send command');
            return await response.json();
        } catch (error) {
            console.error('API Error (sendCommand):', error);
            throw error;
        }
    }

    /**
     * Get alert/notification history
     * @returns {Promise<Array>} List of alerts
     */
    async getAlerts() {
        if (this.useMock) {
            return this.simulateDelay(this.getMockAlerts());
        }

        try {
            const response = await fetch(`${this.baseURL}/api/logs`);
            if (!response.ok) throw new Error('Failed to fetch alerts');
            return await response.json();
        } catch (error) {
            console.error('API Error (getAlerts):', error);
            throw error;
        }
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    /**
     * Simulate network delay for mock API
     * @param {*} data - Data to return
     * @param {number} delay - Delay in ms
     * @returns {Promise} Delayed promise
     */
    simulateDelay(data, delay = 300) {
        return new Promise(resolve => {
            setTimeout(() => resolve(data), delay);
        });
    }

    /**
     * Check if API is available
     * @returns {Promise<boolean>} API availability
     */
    async checkHealth() {
        if (this.useMock) return true;

        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }
}

// Create global API instance
window.api = new API();
