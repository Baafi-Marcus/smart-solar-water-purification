# Backend API Documentation

## Overview

The backend API is built using **Node.js Serverless Functions** deployed on Vercel. It acts as a bridge between the web frontend and the ESP32 microcontroller.

---

## Base URL

- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-project.vercel.app`

---

## Endpoints

### 1. GET /api/status

**Purpose**: Frontend fetches current system status and sensor data

**Used by**: Dashboard and Monitoring pages

**Response**:
```json
{
  "systemStatus": "idle",
  "batteryLevel": 75,
  "waterQuality": "good",
  "waterLevel": "normal",
  "mode": "auto",
  "turbidity": 3.2,
  "tds": 245,
  "ph": 7.2,
  "batteryVoltage": 12.4,
  "pumpStatus": "off",
  "lastUpdated": "2024-02-15T00:00:00Z"
}
```

---

### 2. POST /api/command

**Purpose**: Frontend sends control commands

**Used by**: Dashboard control panel

**Request**:
```json
{
  "command": "start",
  "mode": "auto"
}
```

**Commands**:
- `start` - Start purification
- `stop` - Stop purification
- `mode` - Change operating mode (requires `mode` parameter: "auto" or "manual")

**Response**:
```json
{
  "success": true,
  "message": "Command 'start' queued for ESP32",
  "timestamp": "2024-02-15T00:00:00Z"
}
```

---

### 3. GET /api/logs

**Purpose**: Frontend fetches alert/notification history

**Used by**: Alerts page

**Response**:
```json
[
  {
    "id": 1675526400000,
    "type": "success",
    "title": "Purification Complete",
    "message": "Water purification cycle completed successfully",
    "timestamp": "2024-02-15T00:00:00Z"
  },
  {
    "id": 1675526300000,
    "type": "warning",
    "title": "Low Battery",
    "message": "Battery level is at 25%. Consider charging.",
    "timestamp": "2024-02-15T00:00:00Z"
  }
]
```

**Alert Types**: `info`, `success`, `warning`, `error`

---

### 4. POST /api/upload

**Purpose**: ESP32 uploads sensor data

**Used by**: ESP32 microcontroller

**Request**:
```json
{
  "turbidity": 3.2,
  "tds": 245,
  "ph": 7.2,
  "batteryVoltage": 12.4,
  "batteryLevel": 75,
  "pumpStatus": "off",
  "waterLevel": "normal"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Sensor data received and processed",
  "timestamp": "2024-02-15T00:00:00Z"
}
```

**Automatic Actions**:
- Updates system state
- Checks sensor thresholds
- Generates alerts if thresholds exceeded
- Updates water quality status

---

### 5. GET /api/fetch

**Purpose**: ESP32 checks for pending commands

**Used by**: ESP32 microcontroller (polling)

**Response (with command)**:
```json
{
  "hasCommand": true,
  "command": "start",
  "mode": "auto",
  "timestamp": "2024-02-15T00:00:00Z"
}
```

**Response (no command)**:
```json
{
  "hasCommand": false,
  "message": "No pending commands"
}
```

---

## Data Flow

### User Command Flow
1. User clicks "Start" → Frontend sends `POST /api/command`
2. Backend queues command
3. ESP32 polls `GET /api/fetch`
4. Backend returns command and clears queue
5. ESP32 executes command
6. ESP32 uploads status via `POST /api/upload`

### Sensor Data Flow
1. ESP32 reads sensors every 5 seconds
2. ESP32 sends `POST /api/upload` with data
3. Backend updates state and checks thresholds
4. Backend generates alerts if needed
5. Frontend polls `GET /api/status` every 3-5 seconds
6. Frontend displays updated data

---

## Alert Generation

Alerts are automatically generated when:

| Condition | Alert Type | Title |
|-----------|-----------|-------|
| Battery < 20% | `error` | Critical Battery Level |
| Battery < 40% | `warning` | Low Battery |
| Turbidity > 10 NTU | `error` | Water Quality Issue |
| TDS > 500 ppm | `warning` | High TDS |
| pH < 6.0 or > 9.0 | `error` | pH Out of Range |
| pH < 6.5 or > 8.5 | `warning` | pH Warning |
| Water Level = "low" | `warning` | Low Water Level |
| Command executed | `info` | Command status |

---

## CORS Configuration

All endpoints include CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Local Development

### Start Development Server
```bash
# Install Vercel CLI
npm install -g vercel

# Run locally
vercel dev
```

Server will start at `http://localhost:3000`

### Test Endpoints
```bash
# Get status
curl http://localhost:3000/api/status

# Send command
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"command":"start"}'

# Get logs
curl http://localhost:3000/api/logs

# Upload sensor data (simulate ESP32)
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"turbidity":3.2,"tds":245,"ph":7.2,"batteryLevel":75}'

# Fetch commands (simulate ESP32)
curl http://localhost:3000/api/fetch
```

---

## Deployment

### Deploy to Vercel
```bash
# Production deployment
vercel --prod
```

### Environment Variables
No environment variables required for basic operation. Optionally set:
- `NODE_ENV=production` (automatically set by Vercel)

---

## ESP32 Integration

See [ESP32_INTEGRATION.ino](file:///c:/Users/marcu/Desktop/Smart%20Solar%20APP/ESP32_INTEGRATION.ino) for complete Arduino code example.

**Key Points**:
- ESP32 should poll `/api/fetch` every 5 seconds
- ESP32 should upload data via `/api/upload` every 5 seconds
- Use ArduinoJson library for JSON parsing
- Ensure Wi-Fi connection before API calls

---

## Data Persistence

**Current**: In-memory storage (resets on cold starts)

**Upgrade Path**: Can be upgraded to use:
- Vercel KV (Redis)
- MongoDB Atlas
- PostgreSQL (Vercel Postgres)
- Firebase Realtime Database

For competition purposes, in-memory storage is sufficient.

---

## Security Considerations

**Current Implementation**:
- CORS enabled for all origins
- No authentication required
- Suitable for competition/demo

**Production Recommendations**:
- Add API key authentication
- Restrict CORS to specific origins
- Implement rate limiting
- Add HTTPS enforcement
- Validate all input data

---

## Monitoring & Debugging

### View Logs
```bash
# View real-time logs
vercel logs --follow
```

### Debug Mode
Add console.log statements in API files - they will appear in Vercel logs.

---

## Performance

- **Cold Start**: ~500ms (first request after idle)
- **Warm Response**: ~50-100ms
- **Concurrent Requests**: Unlimited (serverless auto-scaling)
- **Data Size Limit**: 4.5MB per request

---

## Support

For issues:
1. Check Vercel deployment logs
2. Verify API URL in frontend config
3. Test endpoints with curl
4. Check ESP32 serial output
5. Verify Wi-Fi connectivity
