# System Diagrams - Smart Solar Water Purification System

## 1. Block Diagram

```mermaid
graph TB
    subgraph "User Interface Layer"
        A[Web Browser]
        A1[Dashboard Page]
        A2[Monitoring Page]
        A3[Alerts Page]
        A --> A1
        A --> A2
        A --> A3
    end
    
    subgraph "Cloud Infrastructure - Vercel"
        B[Frontend Static Files]
        C[Backend API<br/>Serverless Functions]
        C1[/api/status]
        C2[/api/command]
        C3[/api/logs]
        C4[/api/upload]
        C5[/api/fetch]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
        C --> C5
        D[In-Memory Data Store]
        C1 -.-> D
        C2 -.-> D
        C3 -.-> D
        C4 -.-> D
        C5 -.-> D
    end
    
    subgraph "IoT Hardware Layer"
        E[ESP32 Microcontroller]
        E1[Wi-Fi Module]
        E --> E1
    end
    
    subgraph "Sensor Layer"
        F1[Turbidity Sensor]
        F2[TDS Sensor]
        F3[pH Sensor]
        F4[Water Level Sensor]
        F5[Voltage Sensor]
    end
    
    subgraph "Actuator Layer"
        G1[Water Pump]
        G2[Solar Battery]
    end
    
    A1 -->|HTTP Requests| B
    A2 -->|HTTP Requests| B
    A3 -->|HTTP Requests| B
    B -->|API Calls| C
    E1 <-->|HTTP/REST| C
    E --> F1
    E --> F2
    E --> F3
    E --> F4
    E --> F5
    E --> G1
    E --> G2
    
    style A fill:#e0f2fe
    style B fill:#dbeafe
    style C fill:#bfdbfe
    style D fill:#93c5fd
    style E fill:#fef3c7
    style A1 fill:#f0f9ff
    style A2 fill:#f0f9ff
    style A3 fill:#f0f9ff
```

---

## 2. Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Frontend
    participant API as Backend API
    participant DB as Data Store
    participant ESP as ESP32
    participant S as Sensors
    
    Note over U,S: User Command Flow
    U->>F: Click "Start Purification"
    F->>API: POST /api/command {command: "start"}
    API->>DB: Store command in queue
    API-->>F: {success: true}
    F-->>U: Show "Command sent" message
    
    Note over U,S: ESP32 Command Polling
    ESP->>API: GET /api/fetch
    API->>DB: Check command queue
    DB-->>API: Return pending command
    API-->>ESP: {command: "start", mode: "auto"}
    ESP->>ESP: Execute start command
    ESP->>ESP: Activate water pump
    
    Note over U,S: Sensor Data Upload
    S->>ESP: Read sensor values
    ESP->>API: POST /api/upload {turbidity, tds, ph, ...}
    API->>DB: Update sensor data
    API->>API: Check thresholds & generate alerts
    API->>DB: Store alerts if needed
    API-->>ESP: {success: true}
    
    Note over U,S: Frontend Data Refresh
    F->>API: GET /api/status
    API->>DB: Fetch latest data
    DB-->>API: Return system state
    API-->>F: {systemStatus, sensorData, ...}
    F->>F: Update UI components
    F-->>U: Display updated status
    
    Note over U,S: Alert Retrieval
    F->>API: GET /api/logs
    API->>DB: Fetch alert history
    DB-->>API: Return alerts array
    API-->>F: [{type, title, message}, ...]
    F-->>U: Display alerts list
```

---

## 3. User Interface Flow

```mermaid
graph LR
    subgraph "Entry Point"
        START[User Opens Website]
    end
    
    subgraph "Dashboard Page"
        D1[View System Status]
        D2[Check Battery Level]
        D3[View Water Quality]
        D4{User Action?}
        D5[Click Start Button]
        D6[Click Stop Button]
        D7[Toggle Mode]
        D8[See Feedback Message]
    end
    
    subgraph "Monitoring Page"
        M1[View Real-time Sensors]
        M2[Turbidity Display]
        M3[TDS Display]
        M4[pH Display]
        M5[Battery Voltage]
        M6[Pump Status]
        M7[Auto-refresh every 3s]
    end
    
    subgraph "Alerts Page"
        A1[View Alert Summary]
        A2[Total/Error/Warning/Success]
        A3[View Alert List]
        A4[Read Alert Details]
        A5[See Timestamps]
        A6[Auto-refresh every 10s]
    end
    
    START --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D4
    D4 -->|Start| D5
    D4 -->|Stop| D6
    D4 -->|Change Mode| D7
    D4 -->|Navigate| M1
    D4 -->|Navigate| A1
    D5 --> D8
    D6 --> D8
    D7 --> D8
    D8 --> D1
    
    M1 --> M2
    M2 --> M3
    M3 --> M4
    M4 --> M5
    M5 --> M6
    M6 --> M7
    M7 --> M1
    M1 -->|Navigate| D1
    M1 -->|Navigate| A1
    
    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 --> A6
    A6 --> A1
    A1 -->|Navigate| D1
    A1 -->|Navigate| M1
    
    style START fill:#10b981
    style D1 fill:#dbeafe
    style M1 fill:#fef3c7
    style A1 fill:#fee2e2
```

---

## 4. System Architecture Overview

```mermaid
graph TB
    subgraph Internet["☁️ Internet"]
        direction TB
        USER[👤 User]
    end
    
    subgraph Vercel["🌐 Vercel Cloud Platform"]
        direction TB
        FRONTEND[📱 Frontend<br/>HTML/CSS/JS]
        BACKEND[⚙️ Backend API<br/>Node.js Serverless]
        STORE[(💾 In-Memory Store)]
        
        FRONTEND <--> BACKEND
        BACKEND <--> STORE
    end
    
    subgraph Field["🏭 Field Location"]
        direction TB
        ESP[🤖 ESP32<br/>Microcontroller]
        SENSORS[📊 Sensors<br/>Turbidity/TDS/pH]
        PUMP[💧 Water Pump]
        SOLAR[☀️ Solar Battery]
        
        ESP --> SENSORS
        ESP --> PUMP
        ESP --> SOLAR
    end
    
    USER <-->|HTTPS| FRONTEND
    BACKEND <-->|HTTP/REST| ESP
    
    style USER fill:#e0f2fe
    style FRONTEND fill:#dbeafe
    style BACKEND fill:#bfdbfe
    style STORE fill:#93c5fd
    style ESP fill:#fef3c7
    style SENSORS fill:#d1fae5
    style PUMP fill:#a7f3d0
    style SOLAR fill:#fef08a
```

---

## 5. API Communication Pattern

```mermaid
graph LR
    subgraph "Frontend Operations"
        F1[Dashboard]
        F2[Monitoring]
        F3[Alerts]
    end
    
    subgraph "API Endpoints"
        API1[GET /api/status]
        API2[POST /api/command]
        API3[GET /api/logs]
        API4[POST /api/upload]
        API5[GET /api/fetch]
    end
    
    subgraph "ESP32 Operations"
        E1[Upload Sensors]
        E2[Fetch Commands]
        E3[Execute Actions]
    end
    
    F1 -->|Poll every 5s| API1
    F1 -->|User clicks| API2
    F2 -->|Poll every 3s| API1
    F3 -->|Poll every 10s| API3
    
    E1 -->|Every 5s| API4
    E2 -->|Every 5s| API5
    API5 --> E3
    
    style F1 fill:#dbeafe
    style F2 fill:#dbeafe
    style F3 fill:#dbeafe
    style API1 fill:#bfdbfe
    style API2 fill:#bfdbfe
    style API3 fill:#bfdbfe
    style API4 fill:#bfdbfe
    style API5 fill:#bfdbfe
    style E1 fill:#fef3c7
    style E2 fill:#fef3c7
    style E3 fill:#fef3c7
```

---

## Diagram Explanations

### Block Diagram
Shows the **physical and logical components** of the system:
- **User Interface Layer**: Web pages users interact with
- **Cloud Infrastructure**: Vercel hosting (frontend + backend)
- **IoT Hardware**: ESP32 microcontroller
- **Sensors**: Data collection devices
- **Actuators**: Control devices (pump, battery)

### Data Flow Diagram
Shows **how data moves** through the system:
1. User sends commands → Backend stores → ESP32 fetches
2. Sensors read data → ESP32 uploads → Backend stores
3. Frontend polls → Backend returns → UI updates
4. Alerts generated automatically based on thresholds

### User Interface Flow
Shows **user navigation** through the application:
- Dashboard: Control and status overview
- Monitoring: Real-time sensor data
- Alerts: Notification history
- Each page auto-refreshes at different intervals

### System Architecture Overview
Shows **high-level system design**:
- User connects via internet
- Vercel hosts both frontend and backend
- ESP32 in field location communicates with cloud
- Sensors and actuators controlled by ESP32

### API Communication Pattern
Shows **API usage patterns**:
- Frontend polls different endpoints at different rates
- ESP32 uploads data and fetches commands periodically
- Clear separation between user-facing and device-facing APIs
