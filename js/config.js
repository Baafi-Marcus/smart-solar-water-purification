// ========================================
// API CONFIGURATION
// ========================================

const CONFIG = {
  // API Base URL - Can be overridden by environment variable
  // For local development with Vercel: http://localhost:3000
  // For production: https://your-project.vercel.app
  API_BASE_URL: window.ENV?.API_BASE_URL || 'http://localhost:3000',

  // Polling intervals (in milliseconds)
  POLLING_INTERVAL: {
    DASHBOARD: 5000,    // 5 seconds for dashboard
    MONITORING: 3000,   // 3 seconds for live monitoring
    ALERTS: 10000       // 10 seconds for alerts
  },

  // Sensor thresholds for status indicators
  THRESHOLDS: {
    TURBIDITY: {
      GOOD: 5.0,     // NTU - DGS-175 Standard limit
      WARNING: 8.0   // NTU - Above this is poor
    },
    PH: {
      MIN_GOOD: 6.5,
      MAX_GOOD: 8.5,
      MIN_WARNING: 6.0,
      MAX_WARNING: 9.0
    },
    BATTERY: {
      LOW: 20,      // % - Below this is low
      WARNING: 40   // % - Below this is warning
    }
  },

  // Feature flags
  FEATURES: {
    MOCK_API: false,  // Set to true for testing without backend
    AUTO_REFRESH: true,
    NOTIFICATIONS: true
  }
};

// Export for use in other modules
window.CONFIG = CONFIG;
