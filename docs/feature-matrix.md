# Address AI Chat - 機能別モジュール構成図

## 🎯 Phase別実装状況マトリックス

```mermaid
gantt
    title Address AI Chat 開発フェーズ
    dateFormat  YYYY-MM-DD
    section Phase 1: 基盤構築
    チャットシステム基盤        :done, p1-1, 2025-01-10, 2025-01-12
    ユーザー認証システム        :done, p1-2, 2025-01-10, 2025-01-11
    Socket.io リアルタイム通信  :done, p1-3, 2025-01-11, 2025-01-12
    基本UI/UXコンポーネント     :done, p1-4, 2025-01-10, 2025-01-12
    
    section Phase 2: AI代理応答
    オーナーステータス管理      :done, p2-1, 2025-01-13, 2025-01-15
    AI自動応答エンジン         :done, p2-2, 2025-01-14, 2025-01-16
    緊急呼び出しシステム        :done, p2-3, 2025-01-15, 2025-01-17
    通知システム基盤           :done, p2-4, 2025-01-16, 2025-01-17
    
    section Phase 3: 音声通信
    音声トランシーバー機能      :done, p3-1, 2025-01-18, 2025-01-20
    PTTインターフェース        :done, p3-2, 2025-01-19, 2025-01-21
    リアルタイム音声送受信      :done, p3-3, 2025-01-20, 2025-01-22
    マルチユーザー音声通話      :done, p3-4, 2025-01-21, 2025-01-22
    
    section Phase 4: AI執事
    音声認識・テキスト変換      :done, p4-1, 2025-01-25, 2025-01-28
    AI執事エンジン            :done, p4-2, 2025-01-27, 2025-01-30
    構造化オーナー通知システム   :done, p4-3, 2025-01-29, 2025-01-30
    リアルタイム会話UI         :done, p4-4, 2025-01-28, 2025-01-30
```

## 🏗️ 機能別モジュール構成

### Phase 1: 基盤チャットシステム
```mermaid
graph TB
    subgraph "Authentication (auth/)"
        A1[MockAuthProvider] --> A2[LoginForm]
        A1 --> A3[RegisterForm]
        A1 --> A4[authStore]
        A4 --> A5[useAuth hook]
    end
    
    subgraph "Chat Core (chat/)"
        B1[ChatRoom] --> B2[MessageList]
        B1 --> B3[MessageInput]
        B1 --> B4[RoomList]
        B1 --> B5[chatStore]
        B5 --> B6[Socket.io Client]
    end
    
    subgraph "User Directory (directory/)"
        C1[UserDirectory] --> C2[DirectorySearchBar]
        C1 --> C3[DirectorySortControl]
        C1 --> C4[directoryStore]
    end
    
    A1 --> B1
    B1 --> C1
    
    classDef auth fill:#e3f2fd
    classDef chat fill:#e8f5e8
    classDef directory fill:#fff3e0
    
    class A1,A2,A3,A4,A5 auth
    class B1,B2,B3,B4,B5,B6 chat
    class C1,C2,C3,C4 directory
```

### Phase 2: AI代理応答システム
```mermaid
graph TB
    subgraph "Owner Status (owner-status/)"
        D1[StatusToggle] --> D2[statusStore]
        D2 --> D3[OwnerStatus管理]
        D3 --> D4[自動ステータス更新]
    end
    
    subgraph "AI Engine (lib/ai/)"
        E1[simpleAI.ts] --> E2[butlerAI.ts]
        E1 --> E3[templates.ts]
        E2 --> E4[会話分析エンジン]
        E3 --> E5[応答テンプレート]
    end
    
    subgraph "Emergency System (emergency/)"
        F1[EmergencyButton] --> F2[CallStatusDisplay]
        F1 --> F3[emergencyService]
        F3 --> F4[通知配信]
    end
    
    subgraph "Notifications (lib/notifications/)"
        G1[simpleNotification] --> G2[Web Notification]
        G1 --> G3[Email通知]
        G1 --> G4[Push通知]
    end
    
    D1 --> E1
    E1 --> F1
    F3 --> G1
    
    classDef status fill:#f3e5f5
    classDef ai fill:#e1f5fe
    classDef emergency fill:#ffebee
    classDef notification fill:#e8f5e8
    
    class D1,D2,D3,D4 status
    class E1,E2,E3,E4,E5 ai
    class F1,F2,F3,F4 emergency
    class G1,G2,G3,G4 notification
```

### Phase 3: 音声通信システム
```mermaid
graph TB
    subgraph "Voice Transceiver (voice-transceiver/)"
        H1[SimpleTransceiver] --> H2[PTT Interface]
        H1 --> H3[Participant管理]
        H1 --> H4[音量レベル表示]
    end
    
    subgraph "Voice Service (lib/voice/)"
        I1[simpleVoiceService] --> I2[MediaRecorder]
        I1 --> I3[Web Audio API]
        I1 --> I4[音声圧縮]
        I1 --> I5[Base64エンコード]
    end
    
    subgraph "Socket Integration (lib/socket/)"
        J1[socketService] --> J2[socketHandlers]
        J2 --> J3[voice-data events]
        J2 --> J4[voice-room events]
        J2 --> J5[participant events]
    end
    
    subgraph "Voice Types (types/)"
        K1[voice-transceiver.ts] --> K2[VoiceTransceiver]
        K1 --> K3[VoiceParticipant]
        K1 --> K4[VoiceMessage]
        K1 --> K5[VoiceSettings]
    end
    
    H1 --> I1
    I1 --> J1
    J1 --> K1
    
    classDef transceiver fill:#e8f5e8
    classDef voice fill:#fff3e0
    classDef socket fill:#f3e5f5
    classDef types fill:#e1f5fe
    
    class H1,H2,H3,H4 transceiver
    class I1,I2,I3,I4,I5 voice
    class J1,J2,J3,J4,J5 socket
    class K1,K2,K3,K4,K5 types
```

### Phase 4: AI執事システム
```mermaid
graph TB
    subgraph "AI Butler Components (ai-butler/)"
        L1[LiveConversation] --> L2[リアルタイム会話UI]
        L3[OwnerNotificationPanel] --> L4[構造化通知表示]
        L1 --> L5[音声入力制御]
        L3 --> L6[緊急度フィルタリング]
    end
    
    subgraph "Speech Processing (lib/speech/)"
        M1[speechToTextService] --> M2[Web Speech API]
        M1 --> M3[日本語認識]
        M1 --> M4[信頼度スコア]
        M1 --> M5[会話セグメント管理]
    end
    
    subgraph "Conversation Recording (lib/conversation/)"
        N1[conversationRecorder] --> N2[Session管理]
        N1 --> N3[統合イベント処理]
        N1 --> N4[ライフサイクル管理]
    end
    
    subgraph "Butler AI Engine (lib/ai/butlerAI)"
        O1[ButlerAIEngine] --> O2[丁寧な対話生成]
        O1 --> O3[会話分析・要約]
        O1 --> O4[緊急度判定]
        O1 --> O5[構造化通知生成]
    end
    
    L1 --> M1
    M1 --> N1
    N1 --> O1
    O1 --> L3
    
    classDef butler fill:#e8f5e8
    classDef speech fill:#fff3e0
    classDef conversation fill:#f3e5f5
    classDef aiengine fill:#e1f5fe
    
    class L1,L2,L3,L4,L5,L6 butler
    class M1,M2,M3,M4,M5 speech
    class N1,N2,N3,N4 conversation
    class O1,O2,O3,O4,O5 aiengine
```

## 📊 機能完成度マトリックス

| 機能カテゴリ | Phase | 実装状況 | テスト状況 | ドキュメント |
|-------------|-------|---------|-----------|-------------|
| **認証システム** | 1 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **チャット基盤** | 1 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **ユーザーディレクトリ** | 1 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **オーナーステータス** | 2 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **AI自動応答** | 2 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **緊急呼び出し** | 2 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **音声トランシーバー** | 3 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **リアルタイム音声** | 3 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **音声認識・変換** | 4 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **AI執事エンジン** | 4 | ✅ 完了 | ✅ 完了 | ✅ 完了 |
| **構造化通知** | 4 | ✅ 完了 | ✅ 完了 | ✅ 完了 |

## 🔄 機能間依存関係

```mermaid
graph TB
    A[Authentication] --> B[Chat System]
    B --> C[User Directory]
    B --> D[Owner Status]
    D --> E[AI Auto Response]
    E --> F[Emergency System]
    B --> G[Voice Transceiver]
    G --> H[Speech Recognition]
    H --> I[AI Butler]
    I --> J[Structured Notifications]
    F --> K[Notification Service]
    J --> K
    
    classDef core fill:#e3f2fd
    classDef ai fill:#e1f5fe
    classDef voice fill:#e8f5e8
    classDef notification fill:#fff3e0
    
    class A,B,C core
    class D,E,I,J ai
    class G,H voice
    class F,K notification
```

## 🎯 次期開発計画

### Phase 5: 高度な機能（計画中）
- **本格AI API統合**: GPT-4o-mini API実装
- **Supabase統合**: 本番データベース対応
- **パフォーマンス最適化**: 仮想スクロール・キャッシュ戦略
- **セキュリティ強化**: 認証・認可システム本格化

### Phase 6: エンタープライズ機能（構想中）
- **多言語対応**: i18n国際化対応
- **オフライン対応**: PWA・ServiceWorker
- **モバイルアプリ化**: React Native移行検討
- **分析・ダッシュボード**: 使用状況分析機能

この機能構成により、段階的で保守性の高いAI執事付きリアルタイム通信システムを実現しています。