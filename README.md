# 🚀 Address AI Chat - AI-Powered Chat Application

Next.js 15 + React 19で構築された、AI機能付きリアルタイムチャットアプリケーションです。

## ✨ 主な機能

### 🎯 Phase 6完了機能（現在）
- **ルーム管理システム** - 公開/非公開ルーム作成・参加・退出
- **リアルタイムメッセージング** - Socket.io統合
- **AI Proxy機能** - AI応答の自動生成
- **モデレーション機能** - ユーザー管理・ルーム閉鎖・メッセージクリア
- **お知らせ編集** - ルーム管理者によるリアルタイム更新
- **localStorage永続化** - ブラウザセッション間でのデータ共有
- **認証システム** - Firebase Authentication統合
- **レスポンシブデザイン** - PC・タブレット・モバイル対応

### 🧪 テスト環境
- **Jest単体テスト** - localStorage機能の包括的テスト
- **Playwright E2Eテスト** - ブラウザ間でのルーム共有テスト
- **手動テストガイド** - 詳細なテスト手順書

## 🛠️ 技術スタック

- **Framework**: Next.js 15 (Turbopack)
- **Frontend**: React 19, TypeScript (Strict Mode)
- **State Management**: Zustand
- **Real-time**: Socket.io
- **Authentication**: Firebase Auth
- **Database**: Firestore (with Mock mode)
- **Styling**: Tailwind CSS
- **Testing**: Jest, Playwright, @testing-library
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

### テストアカウント

```
User 1: test1@example.com / password123
User 2: test2@example.com / password123
```

## 🧪 テスト実行

### 単体テスト
```bash
npm test                    # Jest単体テスト
npm run test:watch         # 監視モード
npm run test:coverage      # カバレッジ付き
```

### E2Eテスト
```bash
npm run test:e2e           # Playwright E2E
npm run test:e2e:headed    # ヘッド付きモード
npm run test:e2e:debug     # デバッグモード
```

### 手動テスト
詳細な手順は `LOCAL_TEST_GUIDE.md` を参照してください。

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
├── components/             # 再利用可能コンポーネント
├── features/               # 機能別コンポーネント
│   ├── auth/              # 認証機能
│   ├── chat/              # チャット機能
│   └── dashboard/         # ダッシュボード
├── lib/                   # ライブラリ設定
├── types/                 # TypeScript型定義
└── utils/                 # ユーティリティ関数

__tests__/                 # Jest単体テスト
e2e/                       # Playwright E2Eテスト
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