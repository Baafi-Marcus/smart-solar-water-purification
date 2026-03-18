// ESP32 INTEGRATION GUIDE
// ========================================
// This file provides example code for integrating ESP32 with the backend API
// Language: Arduino C++ (for ESP32)

/*
 * SMART SOLAR WATER PURIFICATION SYSTEM
 * ESP32 Integration Code
 *
 * This code demonstrates how to:
 * 1. Connect ESP32 to Wi-Fi
 * 2. Read sensor data
 * 3. Upload data to backend API
 * 4. Fetch and execute commands from backend
 */

#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>


// ========================================
// CONFIGURATION
// ========================================

// Wi-Fi credentials
const char *ssid = "SmartFilterSystem";
const char *password = "12345678";

// Backend API URL (replace with your Vercel deployment URL)
const char *apiBaseUrl = "https://smart-solar-water-purification.vercel.app";

// Sensor pins (adjust based on your hardware)
// Sensor pins (Actual GPIO mapping for ESP32)
#define TURBIDITY_PIN 36   // VP
#define TDS_PIN 39         // VN
#define PH_PIN 34          // D34
#define WATER_LEVEL_PIN 35 // D35
#define VOLTAGE_PIN 32     // D32
#define PUMP_PIN 5          // D5
#define CHLORINE_PUMP_PIN 17 // D17 (New for chlorine dosing)

// Dosing Configuration (Based on DGS-175 and 100mL/min pump)
const float TANK_VOLUME_L = 20.0;       // Volume of water to treat
const float TARGET_RESIDUAL_MGL = 0.5;  // Required mg/L per DGS-175
const float SOURCE_CONC_MGL = 50000.0;  // 5% Chlorine solution
const float PUMP_FLOW_ML_MIN = 100.0;   // Pump flow rate

// Timing
unsigned long lastUpload = 0;
unsigned long uploadInterval = 5000; // Upload every 5 seconds

// ========================================
// SETUP
// ========================================

void setup() {
  Serial.begin(115200);

  // Initialize pins
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);
  pinMode(CHLORINE_PUMP_PIN, OUTPUT);
  digitalWrite(CHLORINE_PUMP_PIN, LOW);

  // Connect to Wi-Fi
  connectWiFi();
}

// ========================================
// MAIN LOOP
// ========================================

void loop() {
  // Check Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi disconnected. Reconnecting...");
    connectWiFi();
  }

  // Upload sensor data every 5 seconds
  if (millis() - lastUpload >= uploadInterval) {
    lastUpload = millis();

    // Read sensors
    float turbidity = readTurbidity();
    int tds = readTDS();
    float ph = readPH();
    float batteryVoltage = readBatteryVoltage();
    int batteryLevel = calculateBatteryLevel(batteryVoltage);
    String waterLevel = readWaterLevel();
    String pumpStatus = digitalRead(PUMP_PIN) ? "on" : "off";

    // Upload to backend
    uploadSensorData(turbidity, tds, ph, batteryVoltage, batteryLevel,
                     waterLevel, pumpStatus);

    // Check for commands
    checkForCommands();
  }

  delay(100);
}

// ========================================
// WI-FI CONNECTION
// ========================================

void connectWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWi-Fi connection failed!");
  }
}

// ========================================
// SENSOR READING FUNCTIONS
// ========================================

float readTurbidity() {
  // Read turbidity sensor (NTU)
  // This is a simplified example - adjust based on your sensor
  int sensorValue = analogRead(TURBIDITY_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);
  float turbidity = voltage * 10; // Example conversion
  return turbidity;
}

int readTDS() {
  // Read TDS sensor (ppm)
  int sensorValue = analogRead(TDS_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);
  int tds = voltage * 100; // Example conversion
  return tds;
}

float readPH() {
  // Read pH sensor
  int sensorValue = analogRead(PH_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);
  float ph = 7.0 + (voltage - 1.65) * 2; // Example conversion
  return ph;
}

String readWaterLevel() {
  // Read water level sensor
  int sensorValue = analogRead(WATER_LEVEL_PIN);
  return (sensorValue > 2000) ? "normal" : "low";
}

float readBatteryVoltage() {
  // Read battery voltage
  int sensorValue = analogRead(VOLTAGE_PIN);
  float voltage = sensorValue * (3.3 / 4095.0) * 4; // Voltage divider
  return voltage;
}

int calculateBatteryLevel(float voltage) {
  // Convert voltage to percentage (12V system: 10V = 0%, 14V = 100%)
  float percentage = ((voltage - 10.0) / 4.0) * 100.0;
  return constrain(percentage, 0, 100);
}

// ========================================
// API COMMUNICATION
// ========================================

void uploadSensorData(float turbidity, int tds, float ph, float batteryVoltage,
                      int batteryLevel, String waterLevel, String pumpStatus) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot upload: No Wi-Fi connection");
    return;
  }

  HTTPClient http;
  String url = String(apiBaseUrl) + "/api/upload";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["turbidity"] = turbidity;
  doc["tds"] = tds;
  doc["ph"] = ph;
  doc["batteryVoltage"] = batteryVoltage;
  doc["batteryLevel"] = batteryLevel;
  doc["waterLevel"] = waterLevel;
  doc["pumpStatus"] = pumpStatus;

  String jsonString;
  serializeJson(doc, jsonString);

  // Send POST request
  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    Serial.print("Upload successful. Response code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.print("Upload failed. Error code: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

void checkForCommands() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot check commands: No Wi-Fi connection");
    return;
  }

  HTTPClient http;
  String url = String(apiBaseUrl) + "/api/fetch";

  http.begin(url);
  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    String response = http.getString();

    // Parse JSON response
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      bool hasCommand = doc["hasCommand"];

      if (hasCommand) {
        String command = doc["command"];
        Serial.print("Received command: ");
        Serial.println(command);

        // Execute command
        executeCommand(command, doc.as<JsonObject>());
      }
    }
  } else {
    Serial.print("Command check failed. Error code: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

void executeCommand(String command, JsonObject params) {
  if (command == "start") {
    Serial.println("Starting purification...");
    digitalWrite(PUMP_PIN, HIGH);
    doseChlorine(TARGET_RESIDUAL_MGL); // Automatically dose chlorine on start

  } else if (command == "stop") {
    Serial.println("Stopping purification...");
    digitalWrite(PUMP_PIN, LOW);

  } else if (command == "mode") {
    String mode = params["mode"];
    Serial.print("Changing mode to: ");
    Serial.println(mode);
    // Implement mode change logic

  } else if (command == "chlorine") {
    float dosage = params.containsKey("dosage") ? params["dosage"].as<float>() : TARGET_RESIDUAL_MGL;
    doseChlorine(dosage);

  } else {
    Serial.print("Unknown command: ");
    Serial.println(command);
  }
}

void doseChlorine(float targetMgL) {
  Serial.print("Dosing chlorine for ");
  Serial.print(targetMgL);
  Serial.println(" mg/L residual...");

  // Calculation:
  // mass_needed (mg) = target_mgL * tank_volume_L
  // vol_needed (mL) = mass_needed / source_conc_mgL * 1000
  // time_ms = (vol_needed / flow_rate_mL_min) * 60 * 1000

  float massNeeded = targetMgL * TANK_VOLUME_L;
  float volNeeded = (massNeeded / SOURCE_CONC_MGL) * 1000.0;
  unsigned long durationMs = (volNeeded / PUMP_FLOW_ML_MIN) * 60.0 * 1000.0;

  Serial.print("Pumping ");
  Serial.print(volNeeded, 4);
  Serial.print(" mL for ");
  Serial.print(durationMs);
  Serial.println(" ms.");

  digitalWrite(CHLORINE_PUMP_PIN, HIGH);
  delay(durationMs);
  digitalWrite(CHLORINE_PUMP_PIN, LOW);

  Serial.println("Dosing complete.");
}

// ========================================
// NOTES FOR IMPLEMENTATION
// ========================================

/*
 * REQUIRED LIBRARIES:
 * - WiFi (built-in for ESP32)
 * - HTTPClient (built-in for ESP32)
 * - ArduinoJson (install via Library Manager)
 *
 * HARDWARE CONNECTIONS:
 * - Turbidity Sensor → A0
 * - TDS Sensor → A1
 * - pH Sensor → A2
 * - Water Level Sensor → A3
 * - Voltage Sensor → A4
 * - Water Pump Relay → GPIO 5
 *
 * DEPLOYMENT STEPS:
 * 1. Update Wi-Fi credentials (ssid, password)
 * 2. Update API URL (apiBaseUrl) with your Vercel deployment URL
 * 3. Adjust sensor pins based on your hardware
 * 4. Calibrate sensor conversion formulas
 * 5. Upload code to ESP32
 * 6. Monitor Serial output for debugging
 *
 * TROUBLESHOOTING:
 * - If Wi-Fi won't connect: Check credentials and signal strength
 * - If API calls fail: Verify URL and check CORS settings
 * - If sensors read incorrectly: Calibrate conversion formulas
 * - If pump doesn't activate: Check relay wiring and power supply
 */
