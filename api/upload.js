// ========================================
// POST /api/upload
// ========================================
// Receives sensor data from ESP32
// Used by: ESP32 microcontroller

const { updateSensorData, updateSystemStatus, addAlert } = require('./_store');

module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const sensorData = req.body;

        // Validate that we have some data
        if (!sensorData || Object.keys(sensorData).length === 0) {
            res.status(400).json({
                error: 'Bad request',
                message: 'Sensor data is required'
            });
            return;
        }

        // Update sensor data in store
        // This will also trigger threshold checks and alert generation
        updateSensorData(sensorData);

        // Determine water quality based on sensor readings
        let waterQuality = 'good';
        if (sensorData.turbidity > 10 ||
            sensorData.ph < 6.0 ||
            sensorData.ph > 9.0) {
            waterQuality = 'not_safe';
        }
        updateSystemStatus({ waterQuality });

        // Check if purification completed (pump turned off after being on)
        // This would need more sophisticated state tracking in production
        if (sensorData.pumpStatus === 'off' && sensorData.turbidity < 5) {
            // Potentially purification completed
            // In production, you'd track previous state
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Sensor data received and processed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in /api/upload:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
