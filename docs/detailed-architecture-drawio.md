# Address AI Chat - 詳細アーキテクチャ図 (Draw.io形式)

## 🏗️ システム全体アーキテクチャ（7層構成）

### レイヤー構成図
```mermaid
graph TB
    subgraph "Layer 1: Client Devices"
        CL1[🌐 Web Browser<br/>Chrome/Safari/Firefox<br/>WebRTC/WebSocket Support]
        CL2[📱 Mobile Browser<br/>iOS Safari/Android Chrome<br/>Touch Interface Optimized]
        CL3[🔧 PWA Support<br/>Service Worker Ready<br/>Offline Capability]
    end
    
    subgraph "Layer 2: CDN & Edge Network"
        CDN1[🌍 Vercel Edge Network<br/>Global Distribution<br/>Auto Scaling]
        CDN2[📦 Static Assets CDN<br/>Images/CSS/JS<br/>Cache Optimization]
        CDN3[⚖️ Load Balancer<br/>Geographic Routing<br/>Failover Support]
    end
    
    subgraph "Layer 3: Frontend Application"
        FE1[⚛️ Next.js 15 Application<br/>App Router + Turbopack<br/>SSR/SSG Hybrid]
        FE2[🎨 React 19 Components<br/>Concurrent Features<br/>Suspense Boundaries]
        FE3[📝 TypeScript Runtime<br/>Strict Mode<br/>Complete Type Safety]
        FE4[💅 Tailwind CSS<br/>Utility-First Styling<br/>Responsive Design]
        FE5[🗃️ Zustand State Management<br/>Lightweight Store<br/>Persistence Layer]
    end
    
    subgraph "Layer 4: Real-time Communication"
        RT1[🔌 Socket.io Client<br/>WebSocket + Fallbacks<br/>Auto Reconnection]
        RT2[🎤 Web Audio API<br/>MediaRecorder<br/>Audio Processing]
        RT3[🗣️ Web Speech API<br/>Japanese Recognition<br/>Real-time Transcription]
        RT4[📡 Voice Data Streaming<br/>Base64 Compression<br/>PTT Interface]
    end
    
    subgraph "Layer 5: Backend Services"
        BE1[🔧 Socket.io Server<br/>Vercel Functions<br/>Event Broadcasting]
        BE2[🤖 AI Processing Engine<br/>SimpleAI + ButlerAI<br/>Natural Language Processing]
        BE3[📢 Notification Service<br/>Web Push + Email<br/>Multi-channel Support]
        BE4[🚨 Emergency Call Service<br/>Priority Routing<br/>Escalation Rules]
        BE5[🎙️ Speech Processing<br/>Browser Native APIs<br/>Session Management]
    end
    
    subgraph "Layer 6: Data Storage"
        DS1[🐘 Supabase PostgreSQL<br/>Production Database<br/>Real-time Subscriptions]
        DS2[🔐 Supabase Auth<br/>User Identity<br/>JWT Token Management]
        DS3[💾 Browser Storage<br/>localStorage/sessionStorage<br/>Offline Data Cache]
        DS4[📋 Conversation Records<br/>AI Analysis Storage<br/>Structured Notifications]
    end
    
    subgraph "Layer 7: External APIs"
        EXT1[🔥 Firebase Auth<br/>Mock Implementation<br/>Development Ready]
        EXT2[🧠 OpenAI API<br/>GPT-4o-mini<br/>Production Ready]
        EXT3[🔔 Web Notification API<br/>Browser Native<br/>Push Notifications]
        EXT4[📧 Email Service<br/>Notification Delivery<br/>Emergency Alerts]
    end
    
    %% Connections
    CL1 --> CDN1
    CL2 --> CDN1
    CL3 --> CDN1
    CDN1 --> FE1
    CDN2 --> FE4
    CDN3 --> FE1
    
    FE1 --> RT1
    FE2 --> RT2
    FE3 --> RT3
    FE5 --> DS3
    
    RT1 --> BE1
    RT2 --> BE5
    RT3 --> BE2
    RT4 --> BE1
    
    BE1 --> DS1
    BE2 --> EXT2
    BE3 --> EXT3
    BE4 --> EXT4
    BE5 --> DS4
    
    DS2 --> EXT1
    
    %% Styling
    classDef clientLayer fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    classDef cdnLayer fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px
    classDef frontendLayer fill:#E8F5E8,stroke:#388E3C,stroke-width:2px
    classDef realtimeLayer fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    classDef backendLayer fill:#FCE4EC,stroke:#C2185B,stroke-width:2px
    classDef storageLayer fill:#E1F5FE,stroke:#0288D1,stroke-width:2px
    classDef externalLayer fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px
    
    class CL1,CL2,CL3 clientLayer
    class CDN1,CDN2,CDN3 cdnLayer
    class FE1,FE2,FE3,FE4,FE5 frontendLayer
    class RT1,RT2,RT3,RT4 realtimeLayer
    class BE1,BE2,BE3,BE4,BE5 backendLayer
    class DS1,DS2,DS3,DS4 storageLayer
    class EXT1,EXT2,EXT3,EXT4 externalLayer
```

## 🔄 データフロー詳細図

### メッセージング・音声・AI統合フロー
```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as ⚛️ Frontend
    participant RT as 📡 Real-time Layer
    participant BE as 🔧 Backend Services
    participant AI as 🤖 AI Engine
    participant DB as 🗄️ Database
    participant EXT as 🌐 External APIs
    participant O as 👥 Other Users
    
    Note over U,O: 🎯 統合コミュニケーションフロー
    
    %% Text Message Flow
    U->>FE: 💬 Text Message Input
    FE->>RT: Socket.io Emit
    RT->>BE: Message Processing
    BE->>AI: AI Analysis (if enabled)
    AI-->>BE: Response Generation
    BE->>DB: Message Storage
    BE->>O: Broadcast to Room
    
    %% Voice Communication Flow
    U->>FE: 🎤 PTT Button Press
    FE->>RT: Start Voice Recording
    RT->>RT: Audio Compression
    RT->>BE: Voice Data Stream
    BE->>O: Real-time Broadcast
    O->>O: Audio Playback
    
    %% AI Butler Flow
    U->>FE: 🤖 AI Butler Activation
    FE->>RT: Speech Recognition Start
    RT->>AI: Speech-to-Text
    AI->>AI: Intent Analysis
    AI->>FE: Butler Response
    AI->>DB: Conversation Record
    AI->>BE: Owner Notification
    BE->>EXT: Push Notification
    
    %% Emergency Flow
    U->>FE: 🚨 Emergency Button
    FE->>BE: Emergency Alert
    BE->>DB: Emergency Log
    BE->>EXT: Multi-channel Notification
    EXT->>O: Immediate Alert
    
    Note over U,O: ✅ All flows integrated and operational
```

## 🏢 機能別アーキテクチャ構成

### Phase 1-4 統合システム構成
```mermaid
graph LR
    subgraph "🔐 Authentication System"
        AUTH1[MockAuthProvider<br/>Development Ready]
        AUTH2[Firebase Integration<br/>Production Ready]
        AUTH3[JWT Token Management<br/>Session Control]
    end
    
    subgraph "💬 Chat Core System"
        CHAT1[Real-time Messaging<br/>Socket.io Integration]
        CHAT2[Room Management<br/>Public/Private Rooms]
        CHAT3[User Directory<br/>Search & Discovery]
        CHAT4[Message Persistence<br/>History Management]
    end
    
    subgraph "🤖 AI Response System"
        AI1[SimpleAI Engine<br/>Command Processing]
        AI2[ButlerAI Engine<br/>Voice Conversation]
        AI3[Response Templates<br/>Context-Aware Replies]
        AI4[Intent Recognition<br/>Natural Language Processing]
    end
    
    subgraph "🎙️ Voice Communication"
        VOICE1[Voice Transceiver<br/>PTT Interface]
        VOICE2[Audio Processing<br/>Web Audio API]
        VOICE3[Speech Recognition<br/>Japanese Support]
        VOICE4[Real-time Streaming<br/>Low Latency Audio]
    end
    
    subgraph "📢 Notification System"
        NOTIF1[Emergency Alerts<br/>Priority-based Routing]
        NOTIF2[Owner Notifications<br/>Structured Reports]
        NOTIF3[Web Push<br/>Browser Notifications]
        NOTIF4[Email Integration<br/>Backup Delivery]
    end
    
    subgraph "👤 Owner Management"
        OWNER1[Status Management<br/>Online/Away/Busy/Emergency]
        OWNER2[AI Proxy Settings<br/>Automated Responses]
        OWNER3[Notification Preferences<br/>Channel Configuration]
    end
    
    %% System Integration Flow
    AUTH1 --> CHAT1
    CHAT1 --> AI1
    AI1 --> VOICE1
    VOICE1 --> NOTIF1
    OWNER1 --> AI2
    AI2 --> NOTIF2
    
    %% Cross-system Dependencies
    CHAT2 --> OWNER1
    AI3 --> NOTIF3
    VOICE3 --> AI4
    
    classDef auth fill:#E8F5E8,stroke:#4CAF50
    classDef chat fill:#E3F2FD,stroke:#2196F3
    classDef ai fill:#FCE4EC,stroke:#E91E63
    classDef voice fill:#FFF3E0,stroke:#FF9800
    classDef notif fill:#F3E5F5,stroke:#9C27B0
    classDef owner fill:#FFEBEE,stroke:#F44336
    
    class AUTH1,AUTH2,AUTH3 auth
    class CHAT1,CHAT2,CHAT3,CHAT4 chat
    class AI1,AI2,AI3,AI4 ai
    class VOICE1,VOICE2,VOICE3,VOICE4 voice
    class NOTIF1,NOTIF2,NOTIF3,NOTIF4 notif
    class OWNER1,OWNER2,OWNER3 owner
```

## 🔧 技術スタック詳細図

### Development & Production Environment
```mermaid
graph TB
    subgraph "🛠️ Development Environment"
        DEV1[VS Code + Claude Code<br/>Integrated Development]
        DEV2[Node.js 20 + npm<br/>Package Management]
        DEV3[Git + GitHub<br/>Version Control]
        DEV4[Local Testing<br/>Jest + Playwright]
    end
    
    subgraph "⚡ Build & Deploy Pipeline"
        BUILD1[Next.js Build<br/>Turbopack Optimization]
        BUILD2[TypeScript Compilation<br/>Type Checking]
        BUILD3[ESLint + Prettier<br/>Code Quality]
        BUILD4[Automated Testing<br/>CI/CD Pipeline]
    end
    
    subgraph "🌐 Production Environment"
        PROD1[Vercel Hosting<br/>Global Edge Network]
        PROD2[Supabase Database<br/>PostgreSQL + Auth]
        PROD3[External APIs<br/>OpenAI + Firebase]
        PROD4[Monitoring<br/>Analytics + Error Tracking]
    end
    
    subgraph "📊 Quality Assurance"
        QA1[Unit Testing<br/>Jest Framework]
        QA2[E2E Testing<br/>Playwright]
        QA3[Performance Testing<br/>Lighthouse CI]
        QA4[Security Scanning<br/>Dependency Check]
    end
    
    DEV1 --> BUILD1
    BUILD1 --> PROD1
    BUILD2 --> QA1
    QA1 --> PROD4
    
    classDef dev fill:#E8F5E8,stroke:#4CAF50
    classDef build fill:#FFF3E0,stroke:#FF9800
    classDef prod fill:#E3F2FD,stroke:#2196F3
    classDef qa fill:#F3E5F5,stroke:#9C27B0
    
    class DEV1,DEV2,DEV3,DEV4 dev
    class BUILD1,BUILD2,BUILD3,BUILD4 build
    class PROD1,PROD2,PROD3,PROD4 prod
    class QA1,QA2,QA3,QA4 qa
```

## 📋 Draw.io インポート手順

### 1. オンライン Draw.io での作成
1. **https://app.diagrams.net/** にアクセス
2. 「Create New Diagram」→「Blank Diagram」選択
3. 以下のレイヤー構成で作成：

### 2. レイヤー設定
```
Layer 1: Client Devices        (色: #E3F2FD)
Layer 2: CDN & Edge           (色: #F3E5F5)
Layer 3: Frontend App         (色: #E8F5E8)
Layer 4: Real-time Comm      (色: #FFF3E0)
Layer 5: Backend Services     (色: #FCE4EC)
Layer 6: Data Storage         (色: #E1F5FE)
Layer 7: External APIs        (色: #FFEBEE)
```

### 3. 図形配置ガイド
- **矩形**: 基本コンポーネント
- **円角矩形**: サービス・API
- **菱形**: 判定処理
- **矢印**: データフロー（実線：同期、破線：非同期）

### 4. エクスポート形式
- **PNG**: プレゼンテーション用
- **SVG**: ドキュメント埋め込み用
- **PDF**: 印刷用
- **XML**: Draw.io再編集用

この詳細なアーキテクチャ仕様を使用して、draw.ioで包括的なシステム構成図を作成できます。各レイヤーが明確に分離され、技術スタックと依存関係が視覚的に理解できる構成になっています。