# Address AI Chat - ユーザージャーニー図

## 👤 ユーザーロール別フロー

### オーナー（事業主・管理者）のワークフロー
```mermaid
journey
    title オーナーのワークフロー
    section 初期設定
      ログイン: 5: オーナー
      ルーム作成: 4: オーナー
      AI執事設定: 4: オーナー
      ステータス設定: 5: オーナー
    section 日常運用
      ステータス更新: 5: オーナー
      チャット対応: 4: オーナー
      通知確認: 5: オーナー
      緊急対応: 3: オーナー
    section AI執事管理
      通知確認: 5: オーナー
      会話記録確認: 4: オーナー
      返信・フォローアップ: 4: オーナー
      設定調整: 3: オーナー
```

### ゲスト（訪問者・顧客）のワークフロー
```mermaid
journey
    title ゲストのワークフロー
    section 初回アクセス
      ログイン: 4: ゲスト
      ルーム検索: 4: ゲスト
      ルーム参加: 5: ゲスト
    section 基本コミュニケーション
      メッセージ送信: 5: ゲスト
      ファイル共有: 4: ゲスト
      音声通話: 4: ゲスト
    section AI執事利用
      AI執事起動: 5: ゲスト
      音声問い合わせ: 4: ゲスト
      要件整理: 5: ゲスト
      完了確認: 4: ゲスト
    section 緊急時対応
      緊急ボタン: 3: ゲスト
      緊急メッセージ: 3: ゲスト
      オーナー応答待ち: 2: ゲスト
```

## 🤖 AI執事との対話フロー

### 標準的な問い合わせシナリオ
```mermaid
sequenceDiagram
    participant G as ゲスト
    participant AI as AI執事
    participant STT as 音声認識
    participant BA as Butler AI
    participant O as オーナー
    
    Note over G,O: 1. セッション開始
    G->>AI: 「🤖 執事ON」クリック
    AI->>G: 挨拶と使い方説明表示
    G->>AI: 「会話開始」ボタン
    AI->>STT: マイク許可・音声認識開始
    
    Note over G,O: 2. 要件聞き取り
    G->>STT: 🎤「料金について教えてください」
    STT->>BA: 音声→テキスト変換
    BA->>AI: 意図解析・応答生成
    AI->>G: 「料金についてですね。詳しくお聞かせください」
    
    Note over G,O: 3. 詳細確認
    G->>STT: 🎤「法人向けプランの見積もりが欲しいです」
    STT->>BA: 音声→テキスト変換
    BA->>AI: 緊急度判定・要約生成
    AI->>G: 「法人プランですね。ご連絡先もお聞かせください」
    
    Note over G,O: 4. 会話完了・通知
    G->>STT: 🎤「メールは example@company.com です」
    STT->>BA: 最終分析・構造化
    BA->>O: 📋 構造化通知送信
    AI->>G: 「ありがとうございます。オーナーにお伝えしました」
```

### 緊急時対応シナリオ
```mermaid
sequenceDiagram
    participant G as ゲスト
    participant EB as 緊急ボタン
    participant ES as Emergency Service
    participant NS as Notification Service
    participant O as オーナー
    
    Note over G,O: 緊急状況発生
    G->>EB: 🚨「緊急」ボタンクリック
    EB->>G: 緊急度選択画面表示
    G->>EB: 「重要」選択・メッセージ入力
    EB->>ES: 緊急呼び出し作成
    
    Note over G,O: 多重通知配信
    ES->>NS: 通知配信指示
    NS->>O: 📱 Web Push通知
    NS->>O: 📧 Email通知
    NS->>O: 🔔 ブラウザ通知
    
    Note over G,O: オーナー応答
    O->>ES: 緊急呼び出し確認
    ES->>G: オーナー対応中表示
    O->>G: 直接メッセージ送信
    ES->>ES: 緊急状態解除
```

## 🎯 主要ユースケース詳細

### 1. 新規顧客の問い合わせ
```mermaid
flowchart TD
    A[ゲストログイン] --> B[ルーム検索]
    B --> C{オーナー在席?}
    C -->|オンライン| D[直接チャット]
    C -->|不在・取り込み中| E[AI執事起動]
    E --> F[音声で要件聞き取り]
    F --> G[AI分析・整理]
    G --> H[オーナーに構造化通知]
    H --> I[オーナーが後日対応]
    D --> J[リアルタイム対応]
    
    classDef start fill:#e8f5e8
    classDef decision fill:#fff3e0
    classDef ai fill:#e1f5fe
    classDef end fill:#f3e5f5
    
    class A start
    class C decision
    class E,F,G ai
    class I,J end
```

### 2. 既存顧客のサポート
```mermaid
flowchart TD
    A[顧客ログイン] --> B[過去の会話履歴確認]
    B --> C[新しい質問]
    C --> D{問題の種類}
    D -->|技術的問題| E[音声通話で詳細説明]
    D -->|料金・契約| F[AI執事で整理]
    D -->|緊急障害| G[緊急ボタン]
    E --> H[画面共有・音声サポート]
    F --> I[構造化された問い合わせ]
    G --> J[即座にオーナー通知]
    
    classDef customer fill:#e8f5e8
    classDef support fill:#fff3e0
    classDef emergency fill:#ffebee
    
    class A,B,C customer
    class E,F,H,I support
    class G,J emergency
```

### 3. 複数ゲストの同時対応
```mermaid
flowchart TD
    A[複数ゲスト同時アクセス] --> B[個別ルーム作成]
    B --> C{オーナー対応能力}
    C -->|1対1対応可能| D[順次対応]
    C -->|処理能力超過| E[AI執事に振り分け]
    E --> F[各AI執事が個別対応]
    F --> G[要件を並行収集]
    G --> H[優先度別に整理]
    H --> I[オーナーに統合通知]
    I --> J[効率的な順次対応]
    
    classDef multi fill:#e8f5e8
    classDef ai fill:#e1f5fe
    classDef organize fill:#fff3e0
    
    class A,B multi
    class E,F,G ai
    class H,I,J organize
```

## 📱 デバイス別最適化フロー

### PC・デスクトップ環境
```mermaid
graph LR
    A[大画面表示] --> B[マルチウィンドウ]
    B --> C[音声認識精度最適]
    C --> D[キーボードショートカット]
    D --> E[効率的操作]
    
    classDef desktop fill:#e3f2fd
    class A,B,C,D,E desktop
```

### モバイル・スマートフォン環境
```mermaid
graph LR
    A[タッチ操作最適化] --> B[音声入力優先]
    B --> C[シンプルUI]
    C --> D[プッシュ通知]
    D --> E[外出先対応]
    
    classDef mobile fill:#e8f5e8
    class A,B,C,D,E mobile
```

### タブレット環境
```mermaid
graph LR
    A[中画面最適化] --> B[ハイブリッド操作]
    B --> C[音声・タッチ併用]
    C --> D[会議室利用]
    D --> E[プレゼン対応]
    
    classDef tablet fill:#fff3e0
    class A,B,C,D,E tablet
```

## 🔄 エラーハンドリング・フロー

### 接続エラー時の対応
```mermaid
flowchart TD
    A[ネットワーク断] --> B{自動再接続}
    B -->|成功| C[セッション復旧]
    B -->|失敗| D[オフラインモード]
    D --> E[ローカル保存]
    E --> F[接続復旧時同期]
    
    C --> G[通常利用継続]
    F --> G
    
    classDef error fill:#ffebee
    classDef recovery fill:#e8f5e8
    
    class A,D error
    class B,C,F,G recovery
```

### 音声認識エラー時の対応
```mermaid
flowchart TD
    A[音声認識失敗] --> B{エラー種類判定}
    B -->|マイク未許可| C[許可要求再表示]
    B -->|認識精度低下| D[テキスト入力提案]
    B -->|ネットワーク問題| E[オフライン処理]
    
    C --> F[マイク再設定]
    D --> G[ハイブリッド入力]
    E --> H[後で音声処理]
    
    classDef error fill:#ffebee
    classDef solution fill:#fff3e0
    
    class A,B error
    class C,D,E,F,G,H solution
```

このユーザージャーニー設計により、オーナー・ゲスト双方にとって直感的で効率的なコミュニケーション体験を提供しています。