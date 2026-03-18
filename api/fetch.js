// ========================================
// GET /api/fetch
// ========================================
// ESP32 checks for pending commands
// Used by: ESP32 microcontroller (polling)

const { getNextCommand } = require('./_store');

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
        // Get next command from queue
        const command = getNextCommand();

        if (command) {
            // Return command to ESP32
            res.status(200).json({
                hasCommand: true,
                ...command
            });
        } else {
            // No pending commands
            res.status(200).json({
                hasCommand: false,
                message: 'No pending commands'
            });
        }
    } catch (error) {
        console.error('Error in /api/fetch:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
