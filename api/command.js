// ========================================
// POST /api/command
// ========================================
// Receives control commands from frontend
// Used by: Frontend (Dashboard control panel)

const { addCommand, updateSystemStatus, addAlert } = require('./_store');

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
        const { command, mode } = req.body;

        // Validate command
        if (!command) {
            res.status(400).json({
                error: 'Bad request',
                message: 'Command is required'
            });
            return;
        }

        // Process command
        switch (command) {
            case 'start':
                addCommand('start', { mode: mode || 'auto' });
                updateSystemStatus({ status: 'purifying' });
                addAlert('info', 'Purification Started', 'Water purification process initiated.');
                break;

            case 'stop':
                addCommand('stop');
                updateSystemStatus({ status: 'idle' });
                addAlert('info', 'Purification Stopped', 'Water purification process stopped.');
                break;

            case 'mode':
                if (!mode) {
                    res.status(400).json({
                        error: 'Bad request',
                        message: 'Mode parameter is required for mode command'
                    });
                    return;
                }
                addCommand('mode', { mode });
                updateSystemStatus({ mode });
                addAlert('info', 'Mode Changed', `Operating mode changed to ${mode}.`);
                break;

            case 'chlorine':
                const { dosage } = req.body;
                addCommand('chlorine', { dosage: dosage || 0.5 });
                addAlert('success', 'Chlorine Dosing Triggered', `Chlorine dosing (${dosage || 0.5} mg/L) initiated.`);
                break;

            default:
                res.status(400).json({
                    error: 'Bad request',
                    message: `Unknown command: ${command}`
                });
                return;
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: `Command '${command}' queued for ESP32`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in /api/command:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
