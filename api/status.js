// ========================================
// GET /api/status
// ========================================
// Returns current system status and sensor data
// Used by: Frontend (Dashboard and Monitoring pages)

const { getSystemState } = require('./_store');

module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Get complete system state
        const state = getSystemState();

        // Return system status
        res.status(200).json(state);
    } catch (error) {
        console.error('Error in /api/status:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
