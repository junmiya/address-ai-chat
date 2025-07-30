# Address AI Chat - システム構成図

## 🌐 システム全体構成図

### プロダクション環境構成
```mermaid
graph TB
    subgraph "Client Layer"
        C1[Web Browser<br/>Chrome/Safari/Firefox]
        C2[Mobile Browser<br/>iOS Safari/Android Chrome]
        C3[PWA Support<br/>準備済み]
    end
    
    subgraph "CDN & Edge Layer"
        CDN1[Vercel Edge Network]
        CDN2[Static Assets CDN]
        CDN3[Global Load Balancer]
    end
    
    subgraph "Frontend Application Layer"
        APP1[Next.js 15 App<br/>Vercel Hosting]
        APP2[React 19 Components]
        APP3[TypeScript Runtime]
        APP4[Tailwind CSS Styles]
    end
    
    subgraph "Real-time Communication Layer"
        RT1[Socket.io Server<br/>Vercel Functions]
        RT2[WebSocket Connections]
        RT3[Voice Data Streaming]
        RT4[Message Broadcasting]
    end
    
    subgraph "Backend Services Layer"
        BS1[AI Processing Service<br/>Serverless Functions]
        BS2[Notification Service<br/>Web Push API]
        BS3[Emergency Call Service<br/>Multi-channel]
        BS4[Speech Processing<br/>Browser Native APIs]
    end
    
    subgraph "Data Storage Layer"
        DS1[Supabase PostgreSQL<br/>本番データ]
        DS2[Supabase Auth<br/>ユーザー認証]
        DS3[Browser LocalStorage<br/>開発・キャッシュ]
        DS4[Session Storage<br/>一時データ]
    end
    
    subgraph "External APIs"
        EXT1[Firebase Auth<br/>認証プロバイダー]
        EXT2[OpenAI API<br/>GPT-4o-mini準備済み]
        EXT3[Web Notification API<br/>ブラウザ通知]
        EXT4[Web Speech API<br/>音声認識]
    end
    
    subgraph "Monitoring & Analytics"
        MON1[Vercel Analytics]
        MON2[Error Tracking<br/>Sentry準備済み]
        MON3[Performance Monitoring]
        MON4[Usage Analytics]
    end
    
    C1 --> CDN1
    C2 --> CDN1
    CDN1 --> APP1
    APP1 --> RT1
    RT1 --> BS1
    BS1 --> DS1
    BS1 --> EXT2
    APP1 --> DS2
    APP1 --> EXT1
    BS2 --> EXT3
    BS4 --> EXT4
    APP1 --> MON1
    
    classDef client fill:#e3f2fd
    classDef cdn fill:#f3e5f5
    classDef app fill:#e8f5e8
    classDef realtime fill:#fff3e0
    classDef backend fill:#fce4ec
    classDef storage fill:#e1f5fe
    classDef external fill:#ffebee
    classDef monitoring fill:#f1f8e9
    
    class C1,C2,C3 client
    class CDN1,CDN2,CDN3 cdn
    class APP1,APP2,APP3,APP4 app
    class RT1,RT2,RT3,RT4 realtime
    class BS1,BS2,BS3,BS4 backend
    class DS1,DS2,DS3,DS4 storage
    class EXT1,EXT2,EXT3,EXT4 external
    class MON1,MON2,MON3,MON4 monitoring
```

## 🏗️ 開発環境構成図

### ローカル開発環境
```mermaid
graph TB
    subgraph "Developer Machine"
        DEV1[VS Code IDE<br/>Claude Code統合]
        DEV2[Node.js 20<br/>npm/yarn]
        DEV3[Git Repository<br/>GitHub連携]
        DEV4[Docker Desktop<br/>devcontainer]
    end
    
    subgraph "Local Services"
        LOC1[Next.js Dev Server<br/>localhost:3000]
        LOC2[Socket.io Server<br/>開発モード]
        LOC3[Hot Reload<br/>Turbopack]
        LOC4[TypeScript Compiler<br/>tsc --watch]
    end
    
    subgraph "Testing Environment"
        TEST1[Jest Unit Tests<br/>コンポーネントテスト]
        TEST2[Playwright E2E<br/>ブラウザテスト]
        TEST3[Mock Services<br/>Firebase/AI Mock]
        TEST4[Test Coverage<br/>Istanbul]
    end
    
    subgraph "Quality Tools"
        QUA1[ESLint<br/>コード品質]
        QUA2[Prettier<br/>コード整形]
        QUA3[TypeScript<br/>型チェック]
        QUA4[Husky<br/>Git Hooks]
    end
    
    subgraph "Local Storage"
        STO1[Browser LocalStorage<br/>開発データ]
        STO2[Mock Database<br/>JSON Files]
        STO3[Session Storage<br/>一時データ]
    end
    
    DEV1 --> LOC1
    LOC1 --> TEST1
    TEST1 --> QUA1
    QUA1 --> STO1
    
    classDef dev fill:#e8f5e8
    classDef local fill:#fff3e0
    classDef test fill:#fce4ec
    classDef quality fill:#e1f5fe
    classDef storage fill:#f3e5f5
    
    class DEV1,DEV2,DEV3,DEV4 dev
    class LOC1,LOC2,LOC3,LOC4 local
    class TEST1,TEST2,TEST3,TEST4 test
    class QUA1,QUA2,QUA3,QUA4 quality
    class STO1,STO2,STO3 storage
```

## 🚀 デプロイメント構成図

### CI/CD パイプライン
```mermaid
graph LR
    subgraph "Source Control"
        SC1[GitHub Repository<br/>main branch]
        SC2[Feature Branches<br/>pull requests]
        SC3[Release Tags<br/>versioning]
    end
    
    subgraph "CI Pipeline"
        CI1[GitHub Actions<br/>Workflow]
        CI2[Quality Checks<br/>lint/test/type]
        CI3[Build Process<br/>Next.js build]
        CI4[Security Scan<br/>依存関係チェック]
    end
    
    subgraph "CD Pipeline"
        CD1[Vercel Deployment<br/>自動デプロイ]
        CD2[Preview Deployments<br/>PR毎]
        CD3[Production Deploy<br/>main branch]
        CD4[Rollback Support<br/>即座復旧]
    end
    
    subgraph "Post-Deploy"
        PD1[Health Checks<br/>動作確認]
        PD2[Performance Tests<br/>負荷テスト]
        PD3[Monitoring Setup<br/>アラート設定]
        PD4[User Notification<br/>更新通知]
    end
    
    SC1 --> CI1
    SC2 --> CI1
    CI1 --> CI2
    CI2 --> CI3
    CI3 --> CD1
    CD1 --> CD2
    CD2 --> CD3
    CD3 --> PD1
    
    classDef source fill:#e8f5e8
    classDef ci fill:#fff3e0
    classDef cd fill:#fce4ec
    classDef post fill:#e1f5fe
    
    class SC1,SC2,SC3 source
    class CI1,CI2,CI3,CI4 ci
    class CD1,CD2,CD3,CD4 cd
    class PD1,PD2,PD3,PD4 post
```

## 🔒 セキュリティ構成図

### セキュリティレイヤー
```mermaid
graph TB
    subgraph "Network Security"
        NS1[HTTPS/TLS 1.3<br/>全通信暗号化]
        NS2[WSS WebSocket<br/>暗号化通信]
        NS3[CORS Policy<br/>クロスオリジン制御]
        NS4[CSP Headers<br/>XSS防止]
    end
    
    subgraph "Authentication & Authorization"
        AUTH1[Firebase Auth<br/>JWT Token]
        AUTH2[Multi-factor Auth<br/>準備済み]
        AUTH3[Role-based Access<br/>オーナー/ゲスト権限]
        AUTH4[Session Management<br/>自動ログアウト]
    end
    
    subgraph "Data Protection"
        DP1[Input Validation<br/>XSS/SQLi防止]
        DP2[Data Encryption<br/>機密データ暗号化]
        DP3[Audio Data Security<br/>一時的保存のみ]
        DP4[LocalStorage Encryption<br/>機密データ保護]
    end
    
    subgraph "API Security"
        API1[Rate Limiting<br/>API制限]
        API2[API Key Management<br/>環境変数管理]
        API3[Request Validation<br/>スキーマ検証]
        API4[Error Handling<br/>情報漏洩防止]
    end
    
    NS1 --> AUTH1
    AUTH1 --> DP1
    DP1 --> API1
    
    classDef network fill:#ffebee
    classDef auth fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef api fill:#e1f5fe
    
    class NS1,NS2,NS3,NS4 network
    class AUTH1,AUTH2,AUTH3,AUTH4 auth
    class DP1,DP2,DP3,DP4 data
    class API1,API2,API3,API4 api
```

## 📊 パフォーマンス構成図

### パフォーマンス最適化層
```mermaid
graph TB
    subgraph "Frontend Optimization"
        FO1[Code Splitting<br/>動的インポート]
        FO2[Tree Shaking<br/>未使用コード除去]
        FO3[Image Optimization<br/>Next.js Image]
        FO4[Bundle Analysis<br/>サイズ監視]
    end
    
    subgraph "Caching Strategy"
        CACHE1[Browser Cache<br/>静的リソース]
        CACHE2[Service Worker<br/>PWA準備済み]
        CACHE3[CDN Cache<br/>Vercel Edge]
        CACHE4[API Response Cache<br/>レスポンス最適化]
    end
    
    subgraph "Real-time Optimization"
        RT1[WebSocket Pooling<br/>接続最適化]
        RT2[Audio Compression<br/>音声データ圧縮]
        RT3[Batch Processing<br/>メッセージ集約]
        RT4[Debounce/Throttle<br/>イベント制御]
    end
    
    subgraph "Database Optimization"
        DB1[Connection Pooling<br/>Supabase最適化]
        DB2[Query Optimization<br/>インデックス活用]
        DB3[Data Pagination<br/>大量データ対応]
        DB4[Real-time Sync<br/>効率的な同期]
    end
    
    FO1 --> CACHE1
    CACHE1 --> RT1
    RT1 --> DB1
    
    classDef frontend fill:#e8f5e8
    classDef cache fill:#fff3e0
    classDef realtime fill:#fce4ec
    classDef database fill:#e1f5fe
    
    class FO1,FO2,FO3,FO4 frontend
    class CACHE1,CACHE2,CACHE3,CACHE4 cache
    class RT1,RT2,RT3,RT4 realtime
    class DB1,DB2,DB3,DB4 database
```

## 🔧 運用監視構成図

### モニタリング・ログ構成
```mermaid
graph TB
    subgraph "Application Monitoring"
        AM1[Vercel Analytics<br/>パフォーマンス監視]
        AM2[Error Tracking<br/>Sentry統合準備済み]
        AM3[Custom Metrics<br/>AI応答時間等]
        AM4[User Behavior<br/>使用パターン分析]
    end
    
    subgraph "Infrastructure Monitoring"
        IM1[Server Metrics<br/>CPU/Memory使用率]
        IM2[Database Metrics<br/>クエリ性能]
        IM3[Network Metrics<br/>レイテンシ監視]
        IM4[Storage Metrics<br/>容量監視]
    end
    
    subgraph "Business Monitoring"
        BM1[User Engagement<br/>アクティブユーザー]
        BM2[Feature Usage<br/>AI執事利用率]
        BM3[Conversion Metrics<br/>成功率指標]
        BM4[Performance KPIs<br/>応答時間等]
    end
    
    subgraph "Alert System"
        AS1[Real-time Alerts<br/>障害即時通知]
        AS2[Threshold Monitoring<br/>閾値監視]
        AS3[Escalation Rules<br/>エスカレーション]
        AS4[Recovery Automation<br/>自動復旧]
    end
    
    AM1 --> IM1
    IM1 --> BM1
    BM1 --> AS1
    
    classDef app fill:#e8f5e8
    classDef infra fill:#fff3e0
    classDef business fill:#fce4ec
    classDef alert fill:#ffebee
    
    class AM1,AM2,AM3,AM4 app
    class IM1,IM2,IM3,IM4 infra
    class BM1,BM2,BM3,BM4 business
    class AS1,AS2,AS3,AS4 alert
```

## 📈 システム指標・制限値

| 項目 | 開発環境 | 本番環境 | 備考 |
|------|---------|---------|------|
| **同時接続数** | 10ユーザー | 1000ユーザー | Socket.io制限 |
| **音声データ** | 10MB/session | 100MB/session | 圧縮後サイズ |
| **メッセージ履歴** | 1000件 | 10000件 | ローカル保存制限 |
| **AI応答時間** | <2秒 | <1秒 | レスポンス目標 |
| **ファイルアップロード** | 10MB | 50MB | 添付ファイル制限 |
| **WebSocket接続** | 持続接続 | 持続接続 | 自動再接続機能 |
| **認証セッション** | 24時間 | 7日間 | 自動延長対応 |

## 🔄 災害復旧構成

### DR (Disaster Recovery) 戦略
```mermaid
graph LR
    subgraph "Primary System"
        P1[Main Vercel Instance]
        P2[Primary Database]
        P3[Active CDN]
    end
    
    subgraph "Backup System"
        B1[Backup Vercel Region]
        B2[Database Replica]
        B3[Fallback CDN]
    end
    
    subgraph "Recovery Process"
        R1[Health Check Failure]
        R2[Automatic Failover]
        R3[Traffic Rerouting]
        R4[Service Restoration]
    end
    
    P1 -.->|Monitor| R1
    R1 --> R2
    R2 --> B1
    R2 --> B2
    
    classDef primary fill:#e8f5e8
    classDef backup fill:#fff3e0
    classDef recovery fill:#fce4ec
    
    class P1,P2,P3 primary
    class B1,B2,B3 backup
    class R1,R2,R3,R4 recovery
```

このシステム構成図により、開発から本番運用まで包括的なインフラ構成が把握できます。