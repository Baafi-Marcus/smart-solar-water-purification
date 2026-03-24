# 🤖 ESP32 Connection Guide

## 🎯 Your Deployed System

**Production URL**: `https://smart-solar-water-purification.vercel.app`

Your backend API is live at:
- `https://smart-solar-water-purification.vercel.app/api/status`
- `https://smart-solar-water-purification.vercel.app/api/command`
- `https://smart-solar-water-purification.vercel.app/api/upload`
- `https://smart-solar-water-purification.vercel.app/api/fetch`
- `https://smart-solar-water-purification.vercel.app/api/logs`

---

## 4. Physical Architecture (3-Container Setup)

The system utilizes a 3-stage physical bucket layout designed to safely pump, filter, and monitor water:

### Container 1: The Raw Dirty Tank
*   **Turbidity Sensor:** Mounted near the bottom to measure raw water muddiness.
*   **Water Sensor 1:** Inside tank to detect presence of raw water (`D5`).
*   **Pump 1:** Submerged/connected here. Moves raw water up into Container 2.

### Container 2: The Filtration Tower
*   **Contents:** Sand, Activated Charcoal, Gravel, and Cotton.
*   *Note: No electronic sensors are placed inside the wet filter media.*
*   **Pump 2:** Positioned at the very bottom catch-basin of the filter to gently pull filtered water and move it to Container 3.

### Container 3: The Clean / Treatment Tank
*   **pH Sensor:** Mounted here to verify final filtered water is chemically balanced.
*   **Water Sensor 2:** Mounted near the rim of the tank (`D18`). This acts as an **Overflow Prevention** sensor. When water touches it, the entire system stops.
*   **Chlorine Dosing:** This is where manual chlorine dosing tablets are dropped based on the website calculator.

## 📋 What You Need

### Hardware
- ✅ ESP32 Development Board
- ✅ Turbidity Sensor
- ✅ pH Sensor
- ✅ Water Level Sensor
- ✅ Voltage Sensor (for battery monitoring)
- ✅ Water Pump with Relay Module
- ✅ Solar Battery (12V recommended)
- ✅ Jumper Wires
- ✅ Breadboard (optional)

### Software
- ✅ Arduino IDE (download from https://www.arduino.cc/en/software)
- ✅ ESP32 Board Support
- ✅ ArduinoJson Library

---

## 🔧 Step 1: Install Arduino IDE & ESP32 Support

### Install Arduino IDE
1. Download from: https://www.arduino.cc/en/software
2. Install on your computer
3. Open Arduino IDE

### Add ESP32 Board Support
1. Go to **File** → **Preferences**
2. In "Additional Board Manager URLs", add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Click **OK**
4. Go to **Tools** → **Board** → **Boards Manager**
5. Search for "ESP32"
6. Install "**esp32 by Espressif Systems**"

### Install ArduinoJson Library
1. Go to **Tools** → **Manage Libraries**
2. Search for "**ArduinoJson**"
3. Install "**ArduinoJson by Benoit Blanchon**" (version 6.x)

---

## 📝 Step 2: Configure ESP32 Code

### Open the ESP32 Integration File

Open `ESP32_INTEGRATION.ino` in Arduino IDE.

### Update Configuration (Lines 20-26)

```cpp
// Wi-Fi credentials
const char* ssid = "YOUR_WIFI_NAME";           // ← Change this
const char* password = "YOUR_WIFI_PASSWORD";   // ← Change this

// Backend API URL
const char* apiBaseUrl = "https://smart-solar-water-purification.vercel.app";  // ✅ Already set!
```

**Replace:**
- `YOUR_WIFI_NAME` with your Wi-Fi network name
- `YOUR_WIFI_PASSWORD` with your Wi-Fi password

---

## 🔌 Step 3: Hardware Connections

### Pin Connections

| Component | ESP32 Pin | Notes |
|-----------|-----------|-------|
| Turbidity Sensor | GPIO 36 (A0) | Analog input |
| pH Sensor | GPIO 34 (A2) | Analog input |
| Water Level Sensor | GPIO 35 (A3) | Analog input |
| Voltage Sensor | GPIO 32 (A4) | Analog input (battery) |
| Water Pump Relay | GPIO 5 | Digital output |
| GND | GND | Common ground |
| 3.3V | 3.3V | Power for sensors |

### Wiring Diagram (Simplified)

```
ESP32                    Sensors/Actuators
┌─────────────┐
│             │
│  GPIO 36 ───┼──→ Turbidity Sensor
│  GPIO 34 ───┼──→ pH Sensor
│  GPIO 35 ───┼──→ Water Level Sensor
│  GPIO 32 ───┼──→ Voltage Sensor (Battery)
│  GPIO 5  ───┼──→ Relay → Water Pump
│             │
│  GND ───────┼──→ Common Ground
│  3.3V ──────┼──→ Sensor Power
│             │
└─────────────┘
```

**Important Notes:**
- ⚠️ **Use voltage dividers** for sensors that output > 3.3V
- ⚠️ **Relay module** should be powered separately (5V or 12V)
- ⚠️ **Common ground** for all components
- ⚠️ **Isolate pump power** from ESP32 power

---

## 📤 Step 4: Upload Code to ESP32

### Select Board
1. Go to **Tools** → **Board** → **ESP32 Arduino**
2. Select your ESP32 model (e.g., "ESP32 Dev Module")

### Select Port
1. Connect ESP32 to computer via USB
2. Go to **Tools** → **Port**
3. Select the COM port (e.g., COM3, COM4)

### Upload Code
1. Click the **Upload** button (→ arrow icon)
2. Wait for compilation and upload
3. Watch for "**Done uploading**" message

### Monitor Serial Output
1. Go to **Tools** → **Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```
   Connecting to Wi-Fi: YOUR_WIFI_NAME
   .....
   Wi-Fi connected!
   IP address: 192.168.x.x
   ```

---

## 🧪 Step 5: Test the Connection

### What ESP32 Does Every 5 Seconds

1. **Reads all sensors**
2. **Uploads data** to `POST /api/upload`
3. **Checks for commands** via `GET /api/fetch`
4. **Executes commands** (start/stop pump, change mode)

### Test in Serial Monitor

You should see output like:
```
Upload successful. Response code: 200
{"success":true,"message":"Sensor data received and processed"}

Received command: start
Starting purification...
```

### Test on Dashboard

1. Open: https://smart-solar-water-purification.vercel.app
2. Go to **Monitoring** page
3. You should see **real sensor values** updating every 3 seconds!
4. Go to **Dashboard** page
5. Click **"Start Purification"**
6. Check Serial Monitor - ESP32 should receive and execute the command!

---

## 🔍 Troubleshooting

### ESP32 Won't Connect to Wi-Fi

**Check:**
- ✅ Wi-Fi credentials are correct (case-sensitive!)
- ✅ Wi-Fi is 2.4GHz (ESP32 doesn't support 5GHz)
- ✅ Wi-Fi has internet access
- ✅ No special characters in password

**Fix:**
```cpp
// Add this after WiFi.begin() for debugging
Serial.println(WiFi.status());
// 3 = WL_CONNECTED
// 6 = WL_DISCONNECTED
```

---

### API Calls Fail (Error Code -1 or 404)

**Check:**
- ✅ API URL is correct (no typos)
- ✅ ESP32 has internet access (ping google.com)
- ✅ Backend is deployed and running

**Test API manually:**
```powershell
curl https://smart-solar-water-purification.vercel.app/api/status
```

Should return JSON data.

---

### Sensors Read Incorrect Values

**Check:**
- ✅ Sensors are powered (3.3V or 5V as required)
- ✅ Common ground connected
- ✅ Correct pins used
- ✅ Calibration formulas are correct

**Calibrate sensors:**
```cpp
// Example: Adjust conversion formulas
float turbidity = voltage * CALIBRATION_FACTOR;
```

---

### Pump Doesn't Activate

**Check:**
- ✅ Relay module is powered separately
- ✅ Relay signal pin connected to GPIO 5
- ✅ Pump power supply is adequate
- ✅ Relay is working (test with LED)

**Test relay:**
```cpp
// In setup(), add:
digitalWrite(PUMP_PIN, HIGH);
delay(1000);
digitalWrite(PUMP_PIN, LOW);
```

---

## 📊 Expected Data Flow

### Normal Operation Cycle (Every 5 Seconds)

```
1. ESP32 reads sensors
   ↓
2. ESP32 → POST /api/upload
   {
     "turbidity": 3.2,
     "ph": 7.2,
     "batteryLevel": 75,
     ...
   }
   ↓
3. Backend stores data & checks thresholds
   ↓
4. ESP32 → GET /api/fetch
   ↓
5. Backend returns command (if any)
   {
     "hasCommand": true,
     "command": "start"
   }
   ↓
6. ESP32 executes command
   ↓
7. Frontend polls GET /api/status
   ↓
8. Dashboard updates with new data
```

---

## 🎯 Sensor Calibration Guide

### Turbidity Sensor
```cpp
// Typical range: 0-1000 NTU
// Clear water: < 5 NTU
// Cloudy water: > 10 NTU

float voltage = analogRead(TURBIDITY_PIN) * (3.3 / 4095.0);
float turbidity = -1120.4 * voltage * voltage + 5742.3 * voltage - 4352.9;
```

// Neutral: 7.0 pH
// Safe drinking: 6.5-8.5 pH
```cpp
// Range: 0-14 pH
// Neutral: 7.0 pH
// Safe drinking: 6.5-8.5 pH

float voltage = analogRead(PH_PIN) * (3.3 / 4095.0);
float ph = 7.0 + ((voltage - 1.65) / 0.18);
```

**Note:** These are example formulas. Calibrate with known standards!

---

## 🔋 Power Considerations

### ESP32 Power
- **Voltage**: 3.3V (regulated) or 5V (via USB/VIN)
- **Current**: ~240mA (Wi-Fi active)
- **Recommendation**: Use 5V 2A power supply

### Sensor Power
- **Most sensors**: 3.3V or 5V
- **Total current**: ~100-200mA
- **Recommendation**: Separate power supply if > 500mA total

### Pump Power
- **Voltage**: 12V (typical)
- **Current**: 1-3A (depends on pump)
- **Recommendation**: **Separate 12V power supply** (DO NOT power from ESP32!)

---

## 📱 Testing Checklist

### Hardware Tests
- [ ] ESP32 powers on
- [ ] Wi-Fi connects successfully
- [ ] All sensors read values
- [ ] Relay clicks when activated
- [ ] Pump runs when relay is on
- [ ] Battery voltage reads correctly

### Software Tests
- [ ] Serial monitor shows sensor readings
- [ ] API upload succeeds (HTTP 200)
- [ ] Commands received from backend
- [ ] Pump activates on "start" command
- [ ] Pump stops on "stop" command

### Integration Tests
- [ ] Dashboard shows real sensor data
- [ ] Monitoring page updates every 3 seconds
- [ ] Control buttons send commands to ESP32
- [ ] Alerts generate on threshold violations
- [ ] System works end-to-end

---

## 🎓 For Competition Demo

### Demo Flow with ESP32

1. **Show Dashboard** - Live sensor data from ESP32
2. **Click "Start"** - ESP32 activates pump
3. **Show Serial Monitor** - ESP32 receives command
4. **Show Pump Running** - Physical demonstration
5. **Show Monitoring** - Real-time data updates
6. **Explain Architecture** - User → Cloud → ESP32

### Backup Plan (No ESP32)

If ESP32 isn't available during demo:
1. Enable mock mode: `FEATURES.MOCK_API: true` in `js/config.js`
2. Redeploy: `vercel --prod`
3. Demo with simulated data
4. Show ESP32 code and explain integration

---

## 📞 Need Help?

### Resources
- **ESP32 Documentation**: https://docs.espressif.com/
- **Arduino Reference**: https://www.arduino.cc/reference/
- **ArduinoJson Guide**: https://arduinojson.org/

### Common Issues
- **Wi-Fi won't connect** → Check credentials and 2.4GHz network
- **API fails** → Verify URL and internet connection
- **Sensors wrong** → Calibrate with known standards
- **Pump won't run** → Check relay wiring and power supply

---

## ✅ You're All Set!

Your complete IoT system is now:
- 🌐 **Frontend**: Live at https://smart-solar-water-purification.vercel.app
- ⚙️ **Backend**: Serverless API running on Vercel
- 🤖 **ESP32**: Ready to connect and communicate
- 📊 **Monitoring**: Real-time data flow
- 🎯 **Competition**: Ready to demo!

**Good luck with your engineering competition! 🏆**
