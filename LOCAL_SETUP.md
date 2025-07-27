# ローカル環境での確認手順

## 1. プロジェクトのダウンロード

```bash
# このプロジェクトをローカルにクローンまたはダウンロード
git clone <repository-url>
cd chat-app
```

## 2. 依存関係のインストール

```bash
npm install
```

## 3. 環境変数の設定

```bash
# .env.localファイルを作成（既存のものを使用）
cp .env.local.example .env.local

# Firebase設定を実際の値に更新
# NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# など
```

## 4. 開発サーバーの起動

```bash
npm run dev
```

## 5. ブラウザで確認

```
http://localhost:3000
```

## 現在の構築状況

✅ Next.js 15 + React 19 + TypeScript
✅ 機能駆動アーキテクチャ（features/）
✅ Firebase基盤設定
✅ TypeScript Strict Mode
✅ Tailwind CSS + ESLint + Prettier

## 次のフェーズ

Phase 2: 認証システム実装
- Zustand認証ストア
- ログイン・サインアップフォーム
- Firebase Authentication統合