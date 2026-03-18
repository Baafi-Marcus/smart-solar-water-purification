# Smart Solar-Powered Water Purification System
## IoT Web Dashboard

> A cloud-hosted IoT dashboard for remotely monitoring and controlling a solar-powered water purification system using an ESP32 microcontroller.

![System Architecture](https://img.shields.io/badge/Status-Competition%20Ready-success)
![Tech Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JavaScript-blue)
![Deployment](https://img.shields.io/badge/Deploy-Vercel-black)

---

## 🎯 Project Overview

This web application provides a **professional IoT dashboard** for monitoring and controlling a Smart Solar-Powered Water Purification System. Built for an engineering competition, it emphasizes **reliability**, **clarity**, and **ease of demonstration**.

### Key Features

✅ **Real-time Monitoring** - Live sensor data (Turbidity, TDS, pH, Battery, Pump Status)  
✅ **Remote Control** - Start/Stop purification and toggle Auto/Manual modes  
✅ **System Alerts** - Notifications for low battery, water quality issues, and system events  
✅ **Mobile-First Design** - Responsive interface optimized for all devices  
✅ **Mock API Mode** - Test and demo without backend connectivity  

---

## 🏗️ System Architecture

```
┌─────────────────┐
│  User (Browser) │
└────────┬────────┘
         │ Internet
         ▼
┌─────────────────────────┐
│  Hosted Website         │
│  (Vercel - Frontend)    │
└────────┬────────────────┘
         │ API Requests
         ▼
┌─────────────────────────┐
│  Cloud Backend          │
│  (Server / API)         │
└────────┬────────────────┘
         │ Internet
         ▼
┌─────────────────────────┐
│  ESP32 (Wi-Fi)          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Sensors & Actuators    │
│  • Turbidity Sensor     │
│  • TDS Sensor           │
│  • pH Sensor            │
│  • Water Pump           │
│  • Solar Battery        │
└─────────────────────────┘
```

**Important**: The website does **not** communicate directly with the ESP32. All communication flows through the backend API.

---

## 📄 Pages

### 1. Dashboard (Main Page)
- **System Status** - Visual indicator (Idle / Purifying / Alert)
- **Battery Level** - Circular progress with percentage
- **Water Quality** - Status badge (Good / Not Safe)
- **Water Level** - Indicator (Normal / Low)
- **Control Panel** - Start/Stop buttons and Auto/Manual toggle

### 2. Live Monitoring
- **Real-time Sensor Data**:
  - Turbidity (NTU)
  - TDS (ppm)
  - pH Level
  - Battery Voltage (V)
  - Pump Status (On/Off)
- **Auto-refresh** every 3 seconds
- **Color-coded status** based on safe thresholds

### 3. Alerts & Notifications
- **Alert History** with timestamps
- **Alert Types**:
  - Low battery warnings
  - Low water level alerts
  - Water quality issues
  - Purification completion notifications
- **Summary Statistics** (Total, Errors, Warnings, Success)

---

## 🔌 Backend API Integration

The frontend expects a REST API with the following endpoints:

### `GET /api/status`
Returns current system status and sensor readings.

**Response Example**:
```json
{
  "systemStatus": "idle",
  "batteryLevel": 75,
  "waterQuality": "good",
  "waterLevel": "normal",
  "mode": "auto",
  "lastUpdated": "2024-02-15T00:00:00Z"
}
```

### `POST /api/command`
Sends control commands to the ESP32.

**Request Example**:
```json
{
  "command": "start",
  "mode": "auto"
}
```

**Response Example**:
```json
{
  "success": true,
  "message": "Command executed successfully",
  "timestamp": "2024-02-15T00:00:00Z"
}
```

### `GET /api/logs`
Returns alert/notification history.

**Response Example**:
```json
[
  {
    "id": 1,
    "type": "success",
    "title": "Purification Complete",
    "message": "Water purification cycle completed successfully",
    "timestamp": "2024-02-15T00:00:00Z"
  }
]
```

---

## 🚀 Local Development

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Local web server (optional, for testing)

### Running Locally

**Option 1: Using Python**
```bash
# Python 3
python -m http.server 8000

# Open browser to http://localhost:8000
```

**Option 2: Using Node.js**
```bash
npx serve .

# Open browser to http://localhost:3000
```

**Option 3: Using VS Code**
Install the "Live Server" extension and click "Go Live"

### Configuration

Edit `js/config.js` to configure:
- **API Base URL** - Set your backend API endpoint
- **Mock Mode** - Enable/disable mock data (`FEATURES.MOCK_API`)
- **Polling Intervals** - Adjust refresh rates
- **Sensor Thresholds** - Customize warning/error levels

---

## 📦 Deployment to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd "Smart Solar APP"
vercel
```

### Step 3: Configure Environment Variables
In the Vercel dashboard, add:
- `API_BASE_URL` - Your backend API URL

### Step 4: Access Your Site
Vercel will provide a live URL (e.g., `https://your-project.vercel.app`)

---

## 🎨 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Styling** | Custom CSS with CSS Variables |
| **Fonts** | Google Fonts (Inter) |
| **Deployment** | Vercel |
| **API** | REST (JSON) |

### Why Vanilla JavaScript?
- ✅ **No build step** - Easy to understand and debug
- ✅ **Fast loading** - Minimal dependencies
- ✅ **Competition-friendly** - Simple to explain to judges
- ✅ **Reliable** - Proven, stable technology

---

## 🎯 Competition Focus

### Design Principles
1. **Reliability** - Simple, proven technologies with fallback mock mode
2. **Clarity** - Clear labels and intuitive UI for non-technical judges
3. **Simplicity** - Easy to demo and explain
4. **Professional** - Modern IoT aesthetic with glassmorphism and smooth animations

### Demo Checklist
- [ ] Dashboard loads and displays system status
- [ ] Control buttons work (verify in browser console)
- [ ] Monitoring page shows real-time data updates
- [ ] Alerts page displays notifications
- [ ] Mobile responsive design works on phone
- [ ] Professional appearance suitable for judges

---

## 🔧 Customization

### Changing Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
  --color-primary: #0891b2;  /* Main brand color */
  --color-success: #10b981;  /* Success states */
  --color-warning: #f59e0b;  /* Warning states */
  --color-error: #ef4444;    /* Error states */
}
```

### Adjusting Sensor Thresholds
Edit `js/config.js`:
```javascript
THRESHOLDS: {
  TURBIDITY: { GOOD: 5, WARNING: 10 },
  TDS: { GOOD: 300, WARNING: 500 },
  PH: { MIN_GOOD: 6.5, MAX_GOOD: 8.5 }
}
```

---

## 🔮 Future Enhancements

- [ ] GSM connectivity for offline operation
- [ ] Historical data charts and analytics
- [ ] User authentication and multi-user support
- [ ] Push notifications via web push API
- [ ] Export data to CSV/PDF reports
- [ ] Dark mode toggle (currently light theme)

---

## 📝 File Structure

```
Smart Solar APP/
├── index.html              # Dashboard page
├── monitoring.html         # Live monitoring page
├── alerts.html            # Alerts page
├── css/
│   └── styles.css         # Main stylesheet
├── js/
│   ├── config.js          # Configuration
│   ├── api.js             # API integration
│   ├── dashboard.js       # Dashboard logic
│   ├── monitoring.js      # Monitoring logic
│   └── alerts.js          # Alerts logic
├── vercel.json            # Vercel config
└── README.md              # This file
```

---

## 🏆 Competition Presentation Tips

1. **Start with the Dashboard** - Show the clean, professional interface
2. **Demonstrate Controls** - Click Start/Stop to show command feedback
3. **Show Live Monitoring** - Point out auto-refreshing sensor data
4. **Explain Architecture** - Use the diagram to show cloud connectivity
5. **Highlight Mobile Design** - Resize browser or show on phone
6. **Discuss Reliability** - Mention mock mode for testing without hardware

---

## 📞 Support

For questions or issues:
1. Check browser console for error messages
2. Verify API endpoint configuration in `js/config.js`
3. Test with mock mode enabled (`FEATURES.MOCK_API: true`)
4. Ensure all files are in the correct directory structure

---

## 📄 License

This project is created for educational and competition purposes.

---

**Built with ❤️ for the Engineering Competition**

*Demonstrating the power of IoT, renewable energy, and clean water access*
