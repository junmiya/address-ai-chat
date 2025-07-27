# 🔄 Git移行計画: address-ai-chat リポジトリ作成

## **移行の理由**

1. **プロジェクトの独立性**: チャットアプリとメモアプリは全く異なる機能
2. **Git履歴の整理**: チャットアプリ専用の履歴管理
3. **デプロイの独立性**: 各アプリが独立してデプロイ可能
4. **開発効率**: チャットアプリに特化した開発環境

## **📋 移行手順**

### **Phase 1: 新しいリポジトリ作成（GitHubで手動実行）**

```bash
# GitHubで以下の設定で新しいリポジトリを作成
Repository name: address-ai-chat
Description: AI-powered chat application with room management and real-time messaging
Visibility: Public (or Private)
Initialize: README, .gitignore (Node.js), License (MIT)
```

### **Phase 2: ローカル環境の準備**

```bash
# chat-appディレクトリをバックアップ
cp -r /workspace/chat-app /workspace/chat-app-backup

# 新しいディレクトリを作成
mkdir /workspace/address-ai-chat
cd /workspace/address-ai-chat

# 新しいリポジトリをクローン
git clone https://github.com/junmiya/address-ai-chat.git .
```

### **Phase 3: ファイル移行**

```bash
# chat-appの中身を新しいリポジトリにコピー
cd /workspace/chat-app
cp -r * /workspace/address-ai-chat/
cp -r .* /workspace/address-ai-chat/ 2>/dev/null || true

# 不要なファイルを除外
cd /workspace/address-ai-chat
rm -rf .git  # 一時的に削除（新しいgitで初期化）
git init
git remote add origin https://github.com/junmiya/address-ai-chat.git
```

### **Phase 4: 初回コミット**

```bash
# 必要なファイルをステージング
git add .
git commit -m "Initial commit: AI chat application with localStorage room sharing

Features:
- Next.js 15 + React 19 + TypeScript
- Socket.io integration with mock mode
- Firebase Authentication & Firestore
- Room management with moderation features  
- Real-time messaging
- localStorage persistence for cross-session room sharing
- Playwright E2E testing
- Jest unit testing
- Responsive design with Tailwind CSS

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# リモートにプッシュ
git branch -M main
git push -u origin main
```

## **📁 移行対象ファイル一覧**

### **コアアプリケーション**
- ✅ `src/` - アプリケーションソースコード
- ✅ `public/` - 静的ファイル  
- ✅ `package.json` - 依存関係
- ✅ `package-lock.json` - 依存関係ロック
- ✅ `next.config.js` - Next.js設定
- ✅ `tailwind.config.ts` - Tailwind設定
- ✅ `tsconfig.json` - TypeScript設定

### **設定ファイル**
- ✅ `.env.local.example` - 環境変数例
- ✅ `firebase.json` - Firebase設定
- ✅ `firestore.rules` - Firestore規則
- ✅ `vercel.json` - Vercel設定

### **テスト関連**
- ✅ `__tests__/` - Jest単体テスト
- ✅ `e2e/` - Playwright E2Eテスト
- ✅ `jest.config.js` - Jest設定
- ✅ `jest.setup.js` - Jestセットアップ
- ✅ `playwright.config.ts` - Playwright設定

### **ドキュメント**
- ✅ `LOCAL_TEST_GUIDE.md` - ローカルテスト手順
- ✅ `DEBUG_UTILS.md` - デバッグユーティリティ
- ✅ `PROBLEM_ANALYSIS.md` - 問題分析
- ✅ `SOLUTION_REPORT.md` - 解決報告書
- ✅ `TEST_MANUAL.md` - 手動テスト手順

### **除外ファイル**
- ❌ `node_modules/` - npm install で再生成
- ❌ `.next/` - ビルド時に再生成
- ❌ `playwright-report/` - テスト実行時に再生成
- ❌ `test-results/` - テスト実行時に再生成

## **🔧 移行後の必要作業**

### **1. 環境変数設定**
```bash
# .env.local ファイルを作成
cp .env.local.example .env.local
# Firebase設定値を入力
```

### **2. 依存関係インストール**
```bash
npm install
```

### **3. 動作確認**
```bash
npm run dev        # 開発サーバー
npm test          # 単体テスト
npm run build     # プロダクションビルド
```

### **4. Vercelデプロイ設定**
- 新しいリポジトリをVercelに接続
- 環境変数をVercelに設定
- デプロイテスト実行

## **📊 移行前後の比較**

| 項目 | 移行前 | 移行後 |
|-----|--------|--------|
| リポジトリ | junmiya/memo-app | junmiya/address-ai-chat |
| プロジェクト構造 | memo-app/chat-app/ | address-ai-chat/ |
| Git履歴 | メモアプリと混在 | チャットアプリ専用 |
| デプロイ | サブディレクトリ | ルートディレクトリ |
| 開発効率 | 混在による混乱 | 専用環境 |

## **🎯 移行完了後のメリット**

1. **独立したプロジェクト管理**
2. **クリーンなGit履歴**
3. **CI/CD設定の簡素化**
4. **デプロイの最適化**
5. **チーム開発への対応**

## **⚠️ 注意事項**

- 移行前に現在の作業を必ずコミット
- バックアップの作成を確実に実行
- Vercelの環境変数を新しいプロジェクトに移行
- 既存のデプロイURLが変更される

---

**実行準備完了！** GitHubで新しいリポジトリを作成したら、この手順に従って移行を進めましょう。