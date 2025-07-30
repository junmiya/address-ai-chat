# 🤖 Address AI Chat - AI執事付きリアルタイム通信システム

Next.js 15 + React 19で構築された、AI執事機能を備えた包括的なリアルタイム通信システムです。音声認識、自然言語処理、緊急呼び出し機能を統合し、オーナーとゲスト間の効率的な情報交換を実現します。

## ✨ 主な機能

### 🎯 完了済み機能（Phase 1-4）

#### 💬 基盤チャットシステム
- **リアルタイムメッセージング** - Socket.io統合による即時通信
- **ルーム管理システム** - 公開/非公開ルーム、1対1・1対多チャット
- **認証システム** - Firebase Auth（Mock実装）
- **モデレーション機能** - ユーザー管理・ルーム制御・メッセージ管理

#### 🤖 AI代理応答システム
- **オーナーステータス管理** - 4段階（online/away/busy/emergency_only）
- **AI自動応答エンジン** - キーワードベース応答、コマンド処理（/status, /ai）
- **緊急呼び出しシステム** - 優先度別通知、複数通知方法対応

#### 🎙️ 音声通信システム
- **音声トランシーバー** - PTT（Push-to-Talk）インターフェース
- **リアルタイム音声送受信** - Web Audio API + Socket.io
- **マルチユーザー音声通話** - 複数参加者による同時通話

#### 🧠 AI執事システム
- **音声認識・テキスト変換** - Web Speech API日本語対応
- **AI執事エンジン** - 丁寧な対話スタイル、会話分析・意図理解
- **構造化オーナー通知** - 緊急度判定、分析結果に基づく通知
- **リアルタイム会話UI** - ライブ音声認識表示、AI応答管理

### 🧪 テスト環境
- **Jest単体テスト** - localStorage機能の包括的テスト
- **Playwright E2Eテスト** - ブラウザ間でのルーム共有テスト
- **手動テストガイド** - 詳細なテスト手順書

## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 15 (Turbopack) + React 19
- **Language**: TypeScript (Strict Mode)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **UI Components**: 自社開発（モジュラー設計）

### リアルタイム通信
- **WebSocket**: Socket.io
- **音声処理**: Web Audio API + MediaRecorder
- **音声認識**: Web Speech API（日本語対応）

### AI・データ処理
- **AI Engine**: 自社開発（GPT-4o-mini統合準備済み）
- **会話分析**: 自然言語処理、意図理解、感情分析
- **データ永続化**: LocalStorage（開発）+ Supabase（本番準備済み）

### 認証・セキュリティ
- **Authentication**: Firebase Auth（Mock実装）
- **権限管理**: ルールベース機能制限
- **通信**: HTTPS/WSS暗号化

### 開発・品質管理
- **Testing**: Jest, Playwright, @testing-library
- **Code Quality**: ESLint, Prettier, TypeScript strict
- **Git Hooks**: Husky + lint-staged
- **Deployment**: Vercel

## 🚀 クイックスタート

### 前提条件
- Node.js 20以上
- npm または yarn

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/junmiya/address-ai-chat.git
cd address-ai-chat

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.localに必要な値を入力

# 開発サーバーを起動
npm run dev
```

アプリケーションは http://localhost:3000 で利用できます。

## 📋 使用方法

### 基本的な流れ

1. **ログイン** - test1@example.com / password123
2. **ルーム作成** - 公開ルームを作成
3. **別ブラウザでログイン** - test2@example.com / password123  
4. **ルーム参加** - 「参加可能な公開ルーム」から参加
5. **メッセージ送受信** - リアルタイムチャット

### AI執事機能の使用方法

#### ゲスト側（問い合わせ者）
1. チャットルームに入室
2. 「🤖 執事ON」ボタンをクリック
3. 「会話開始」でAI執事との対話開始
4. マイクボタン長押しで音声入力
5. AI執事が要件を聞き取り・整理

#### オーナー側（事業主）
1. 「📋 通知」ボタンで問い合わせ確認
2. 緊急度別フィルタリング
3. 詳細な会話記録・分析結果確認
4. 返信・既読・削除などのアクション

### 音声機能の使用方法

1. 「🎤 音声ON」で音声トランシーバー有効化
2. 「音声ルームに参加」でマイク許可
3. PTTボタン長押しまたはSpaceキー長押しで送信
4. リアルタイム音声通話

### テストアカウント

```
Owner (オーナー): test1@example.com / password123
Guest (ゲスト):  test2@example.com / password123
```

## 🧪 テスト実行

### 品質チェック
```bash
npm run quality:check      # 型チェック + lint + format確認
npm run quality:fix        # 型チェック + lint修正 + format適用
```

### 単体テスト
```bash
npm test                    # Jest単体テスト
npm run test:watch         # 監視モード
npm run test:coverage      # カバレッジ付き
npm run test:ci            # CI用（watch無効）
```

### E2Eテスト
```bash
npm run test:e2e           # Playwright E2E
npm run test:e2e:headed    # ヘッド付きモード
npm run test:e2e:debug     # デバッグモード
```

### 個別品質チェック
```bash
npm run type-check         # TypeScript型チェック
npm run lint               # ESLint実行
npm run lint:fix           # ESLint修正
npm run format             # Prettier適用
npm run format:check       # Prettier確認
```

### 手動テスト
詳細な手順は `LOCAL_TEST_GUIDE.md` を参照してください。

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
├── components/             # 再利用可能コンポーネント
├── features/              # 機能別モジュール
│   ├── auth/              # 認証システム
│   ├── chat/              # チャット機能
│   ├── ai-butler/         # AI執事機能
│   ├── voice-transceiver/ # 音声通信
│   ├── owner-status/      # オーナーステータス
│   └── emergency/         # 緊急呼び出し
├── lib/                   # ユーティリティ・サービス
│   ├── ai/               # AI処理エンジン
│   ├── voice/            # 音声処理
│   ├── speech/           # 音声認識
│   ├── socket/           # Socket.io
│   └── conversation/     # 会話記録
├── shared/               # 共有コンポーネント
├── types/                # TypeScript型定義
└── utils/                # ユーティリティ関数

__tests__/                # Jest単体テスト
e2e/                      # Playwright E2Eテスト
.claude/                  # Claude Code プロジェクト管理
├── context.md           # プロジェクトコンテキスト
├── project-knowledge.md # 技術知識ベース
├── common-patterns.md   # 共通パターン集
└── project-improvements.md # 改善履歴
```

## 🔧 設定ファイル

### 環境変数 (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... 他のFirebase設定
```

### 主要な設定ファイル
- `next.config.js` - Next.js設定
- `tailwind.config.ts` - Tailwind CSS設定
- `jest.config.js` - Jest設定  
- `playwright.config.ts` - Playwright設定
- `firebase.json` - Firebase設定

## 🚀 デプロイ

### Vercel (推奨)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/junmiya/address-ai-chat)

```bash
npm run build              # プロダクションビルド
npm start                  # プロダクション実行
```

### 環境変数設定
Vercelの環境変数に以下を設定：
- Firebase設定値
- その他API キー

## 🐛 トラブルシューティング

### よくある問題

1. **ルームが表示されない**
   - ページをリロード (F5)
   - localStorage確認: `DEBUG_UTILS.md` 参照

2. **テストが失敗する**
   - ブラウザ依存関係の確認
   - 開発サーバーの起動確認

3. **Firebase接続エラー**  
   - 環境変数の確認
   - Firebase設定の確認

詳細なデバッグ情報は `DEBUG_UTILS.md` を参照してください。

## 📚 ドキュメント

- `LOCAL_TEST_GUIDE.md` - ローカルテスト手順
- `DEBUG_UTILS.md` - デバッグユーティリティ
- `SOLUTION_REPORT.md` - localStorage実装報告書
- `GIT_MIGRATION_PLAN.md` - リポジトリ移行計画

## 🤝 コントリビューション

1. フォークする
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- Next.js チーム
- Firebase チーム  
- Socket.io チーム
- Claude Code Assistant

---

**開発者**: junmiya with Claude Code Assistant  
**最終更新**: 2025-07-26  
**バージョン**: 1.0.0