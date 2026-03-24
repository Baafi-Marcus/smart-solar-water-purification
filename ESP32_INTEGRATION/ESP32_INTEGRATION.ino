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
#include <WiFiClientSecure.h>

WiFiClientSecure secureClient;

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
#define TURBIDITY_PIN 35     // D35
#define PH_PIN 34            // D34
#define WATER_SENSOR1_PIN 5  // D5 (Dirty container level)
#define WATER_SENSOR2_PIN 18 // D18 (Clean container level)
#define VOLTAGE_PIN 32       // D32
#define RELAY1_PIN 14        // D14 (Dirty to Filter Pump)
#define RELAY2_PIN 27        // D27 (Filter to Clean Pump)

#define RELAY_ON HIGH        // Standard Active HIGH
#define RELAY_OFF LOW        // Standard Active HIGH means LOW is OFF

// Pumping Logic State
unsigned long relay2Timer = 0;
bool relay2State = false;

// Dosing Configuration (Manual, See Monitoring Dashboard for Calculator)
// Target Residual standard: 0.5 mg/L per DGS-175

// Timing
unsigned long lastUpload = 0;
unsigned long uploadInterval = 5000; // Upload every 5 seconds

// ========================================
// SETUP
// ========================================

void setup() {
  Serial.begin(115200);

  // Initialize pins
  pinMode(RELAY1_PIN, OUTPUT);
  digitalWrite(RELAY1_PIN, RELAY_OFF);
  pinMode(RELAY2_PIN, OUTPUT);
  digitalWrite(RELAY2_PIN, RELAY_OFF);

  // Configure Secure Client
  secureClient.setInsecure();

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

  // ===== WATER TRANSFER LOGIC =====
  int ws1Value = analogRead(WATER_SENSOR1_PIN); // Dirty Tank
  int ws2Value = analogRead(WATER_SENSOR2_PIN); // Clean Tank

  if (ws2Value > 2000) {
    // SYSTEM FULL: The Clean Tank has reached the maximum water level!
    // Shut off all pumps immediately to prevent overflow.
    digitalWrite(RELAY1_PIN, RELAY_OFF);
    digitalWrite(RELAY2_PIN, RELAY_OFF);
    relay2State = false;
    
  } else {
    // SYSTEM NOT FULL: Proceed with normal purification flow

    if (ws1Value > 2000) { 
      // Water in dirty container -> Pump 1 fills the filtration tank
      digitalWrite(RELAY1_PIN, RELAY_ON);
      
      // Stop Relay 2 while Relay 1 is furiously pumping
      digitalWrite(RELAY2_PIN, RELAY_OFF);
      relay2State = false;
    } else {
      // Dirty container empty -> Relay 1 OFF
      digitalWrite(RELAY1_PIN, RELAY_OFF);

      // Relay 2 pumps every 10 seconds (10s ON, 10s OFF cycle) to gently move filtered water
      unsigned long currentMillis = millis();
      if (currentMillis - relay2Timer >= 10000) {
        relay2Timer = currentMillis;
        relay2State = !relay2State; // Toggle state
        digitalWrite(RELAY2_PIN, relay2State ? RELAY_ON : RELAY_OFF);
      }
    }
  }

  // Upload sensor data every 5 seconds
  if (millis() - lastUpload >= uploadInterval) {
    lastUpload = millis();

    // Read sensors
    float turbidity = readTurbidity();
    float ph = readPH();
    float batteryVoltage = readBatteryVoltage();
    int batteryLevel = calculateBatteryLevel(batteryVoltage);
    
    String relay1Status = (digitalRead(RELAY1_PIN) == RELAY_ON) ? "on" : "off";
    String relay2Status = (digitalRead(RELAY2_PIN) == RELAY_ON) ? "on" : "off";

    // Upload to backend
    uploadSensorData(turbidity, ph, batteryVoltage, batteryLevel, ws1Value,
                     ws2Value, relay1Status, relay2Status);

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

float readPH() {
  // Read pH sensor
  int sensorValue = analogRead(PH_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);
  float ph = 7.0 + (voltage - 1.65) * 2; // Example conversion
  return ph;
}

// We replaced string based water level with direct analog reads previously.

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

void uploadSensorData(float turbidity, float ph, float batteryVoltage,
                      int batteryLevel, int ws1, int ws2, String relay1Status, String relay2Status) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot upload: No Wi-Fi connection");
    return;
  }

  HTTPClient http;
  String url = String(apiBaseUrl) + "/api/upload";

  http.begin(secureClient, url);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["turbidity"] = turbidity;
  doc["ph"] = ph;
  doc["batteryVoltage"] = batteryVoltage;
  doc["batteryLevel"] = batteryLevel;
  doc["waterSensor1"] = ws1;
  doc["waterSensor2"] = ws2;
  doc["relay1Status"] = relay1Status;
  doc["relay2Status"] = relay2Status;

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

  http.begin(secureClient, url);
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
    Serial.println("Manual override: Starting Relay 1...");
    digitalWrite(RELAY1_PIN, RELAY_ON);

  } else if (command == "stop") {
    Serial.println("Manual override: Stopping Relay 1...");
    digitalWrite(RELAY1_PIN, RELAY_OFF);
    digitalWrite(RELAY2_PIN, RELAY_OFF);

  } else if (command == "mode") {
    String mode = params["mode"];
    Serial.print("Changing mode to: ");
    Serial.println(mode);
    // Implement mode change logic

  } else {
    Serial.print("Unknown command: ");
    Serial.println(command);
  }
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
 * - Turbidity Sensor → GPIO 35
 * - pH Sensor → GPIO 34
 * - Water Sensor 1 → GPIO 5
 * - Water Sensor 2 → GPIO 18
 * - Voltage Sensor → GPIO 32
 * - Relay 1 (Pump 1) → GPIO 14
 * - Relay 2 (Pump 2) → GPIO 27
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
