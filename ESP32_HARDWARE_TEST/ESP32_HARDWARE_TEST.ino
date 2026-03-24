// ========================================
// SMART SOLAR WATER PURIFICATION
// Hardware Diagnostic Test Sketch
// ========================================
// Use this script to verify all physical connections without connecting to the
// internet.

#define TURBIDITY_PIN 35
#define PH_PIN 34
#define WATER_SENSOR1_PIN 5
#define WATER_SENSOR2_PIN 18
#define VOLTAGE_PIN 32
#define RELAY1_PIN 14
#define RELAY2_PIN 27

bool relay1State = false;
bool relay2State = false;
unsigned long lastSensorRead = 0;

void setup() {
  Serial.begin(115200);

  // Initialize relays
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);

  Serial.println("\n==================================");
  Serial.println("  SYSTEM HARDWARE DIAGNOSTIC TEST");
  Serial.println("==================================");

  // 1. AUTO-TEST RELAY 1 (Dirty Pump)
  Serial.println(
      "\n>>> TESTING RELAY 1 (Dirty Pump)... TURNING ON for 5 seconds!");
  digitalWrite(RELAY1_PIN, HIGH);
  delay(5000); // 5 seconds
  digitalWrite(RELAY1_PIN, LOW);
  Serial.println(">>> RELAY 1 (Dirty Pump) is now OFF.\n");

  delay(2000); // Rest for 2 seconds

  // 2. AUTO-TEST RELAY 2 (Filter Pump)
  Serial.println(
      ">>> TESTING RELAY 2 (Filter Pump)... TURNING ON for 5 seconds!");
  digitalWrite(RELAY2_PIN, HIGH);
  delay(5000); // 5 seconds
  digitalWrite(RELAY2_PIN, LOW);
  Serial.println(">>> RELAY 2 (Filter Pump) is now OFF.\n");

  Serial.println("==================================");
  Serial.println("  HARDWARE AUTO-TEST COMPLETE!");
  Serial.println("==================================\n");
  Serial.println("Now printing live sensor values every 2 seconds...");
}

void loop() {
  // Print sensor data every 2 seconds
  if (millis() - lastSensorRead >= 2000) {
    lastSensorRead = millis();

    // Read all analog sensors
    int turb = analogRead(TURBIDITY_PIN);
    int ph = analogRead(PH_PIN);
    int ws1 = analogRead(WATER_SENSOR1_PIN);
    int ws2 = analogRead(WATER_SENSOR2_PIN);
    int volt = analogRead(VOLTAGE_PIN);

    // Print to Serial Monitor
    Serial.print("Sensors -> ");
    Serial.print("Turbidity: ");
    Serial.print(turb);
    Serial.print(" | pH: ");
    Serial.print(ph);
    Serial.print(" | Water1(Dirty): ");
    Serial.print(ws1);
    Serial.print(" | Water2(Clean): ");
    Serial.print(ws2);
    Serial.print(" | Voltage: ");
    Serial.println(volt);
  }

  // Check for serial commands to test relays
  if (Serial.available() > 0) {
    char cmd = Serial.read();

    if (cmd == '1') {
      relay1State = !relay1State;
      digitalWrite(RELAY1_PIN, relay1State ? HIGH : LOW);
      Serial.print("\n>>> RELAY 1 (Dirty Pump) is now: ");
      Serial.println(relay1State ? "ON" : "OFF");
      Serial.println();
    } else if (cmd == '2') {
      relay2State = !relay2State;
      digitalWrite(RELAY2_PIN, relay2State ? HIGH : LOW);
      Serial.print("\n>>> RELAY 2 (Filter Pump) is now: ");
      Serial.println(relay2State ? "ON" : "OFF");
      Serial.println();
    }
  }
}
