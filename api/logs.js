// ========================================
// GET /api/logs
// ========================================
// Returns alert/notification history
// Used by: Frontend (Alerts page)

const { getAlerts } = require('./_store');

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
        // Get alerts from store
        const alerts = getAlerts();

        // Return alerts array
        res.status(200).json(alerts);
    } catch (error) {
        console.error('Error in /api/logs:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
