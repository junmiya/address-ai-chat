# 🚀 ローカル開発環境セットアップガイド

AI代理応答チャットアプリのローカル開発環境構築手順です。

## 📋 必要な環境

### システム要件
- **Node.js**: v18以上
- **npm**: v8以上
- **Java**: v11以上 (Firebase Emulator用)

### 確認コマンド
```bash
node --version  # v18.0.0以上
npm --version   # v8.0.0以上  
java --version  # v11.0.0以上
```

## 🛠️ セットアップ手順

### 1. プロジェクトクローン
```bash
git clone <repository-url>
cd chat-app
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. Firebase Emulator初期化
```bash
# Firebase CLIの初期化（初回のみ）
npx firebase login --no-localhost
npx firebase init emulators
```

### 4. 環境変数設定
`.env.local` ファイルは既に設定済みです。内容確認：
```bash
cat .env.local
```

設定内容：
- Firebase Emulator設定
- AI API キー（ダミー値）
- 開発環境フラグ

## 🚀 開発サーバー起動

### 方法1: 自動セットアップ（推奨）
```bash
# Firebase Emulator + Next.js を同時起動
npm run dev:local
```

### 方法2: 手動セットアップ
```bash
# ターミナル1: Firebase Emulator起動
npm run emulators

# ターミナル2: Next.js開発サーバー起動  
npm run dev
```

### 方法3: データ投入付きセットアップ
```bash
# Emulator起動 → テストデータ投入
npm run setup:local

# 別ターミナルでNext.js起動
npm run dev
```

## 🌐 アクセス先

起動後、以下のURLにアクセス可能：

| サービス | URL | 説明 |
|---------|-----|------|
| **チャットアプリ** | http://localhost:3000 | メインアプリケーション |
| **Firebase UI** | http://localhost:4000 | Emulator管理画面 |
| **Auth Emulator** | http://localhost:9099 | 認証エミュレータ |
| **Firestore Emulator** | http://localhost:8080 | DB エミュレータ |

## 👤 テストアカウント

事前作成済みのテストアカウント：

| Email | Password | 名前 | 役割 |
|-------|----------|------|------|
| test1@example.com | password123 | 山田太郎 | ルームオーナー |
| test2@example.com | password123 | 佐藤花子 | 一般ユーザー |
| test3@example.com | password123 | 田中次郎 | 一般ユーザー |

## 🗄️ テストデータ

自動投入されるテストデータ：

### チャットルーム
- **プロジェクト相談** (1対1公開、AI代理応答ON)
- **チームミーティング** (1対複数非公開、AI代理応答OFF)  
- **技術的な質問・相談** (1対複数公開、AI代理応答ON)

### メッセージ履歴
各ルームに実際の会話データが投入済み

### 課金設定
- user1: 無料プラン (1000トークン/月制限)
- user2: サブスクリプション (無制限)
- user3: 従量課金 (5000トークン購入済み)

## 🛠️ 開発用コマンド

### Firebase Emulator
```bash
# Emulator起動
npm run emulators

# データエクスポート
npm run emulators:export

# データインポート付き起動
npm run emulators:import

# テストデータ投入（Emulator起動後）
npm run seed-data
```

### Next.js開発
```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# ビルド結果確認
npm run start

# ESLint実行
npm run lint
```

## 🔧 デバッグ方法

### 1. Firebase接続確認
ブラウザの開発者ツールで以下を確認：
```javascript
// コンソールで実行
console.log('Firebase Emulator:', process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR);
```

### 2. 認証状態確認
```javascript
// ブラウザコンソールで確認
import { useAuthStore } from '@/features/auth/store/authStore';
console.log('Auth State:', useAuthStore.getState());
```

### 3. Firestore接続確認
Firebase UI (http://localhost:4000) でデータベース状態を確認

## 🚨 トラブルシューティング

### よくある問題

#### 1. Emulator起動エラー
```bash
# ポート競合の場合
lsof -ti:9099 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

#### 2. Firebase接続エラー
- `.env.local`の設定確認
- Emulatorが起動しているか確認
- ブラウザキャッシュクリア

#### 3. テストデータが表示されない
```bash
# データ再投入
npm run seed-data
```

#### 4. ビルドエラー
```bash
# 依存関係再インストール
rm -rf node_modules package-lock.json
npm install
```

## 📱 モバイル確認

### ローカルネットワークでアクセス
```bash
# IPアドレス確認
ifconfig | grep "inet " | grep -v 127.0.0.1

# アプリアクセス
http://[YOUR_IP]:3000

# Firebase UI
http://[YOUR_IP]:4000
```

### 環境変数更新（必要時）
```bash
# .env.local に追記
NEXT_PUBLIC_APP_URL=http://[YOUR_IP]:3000
```

## 🔄 データリセット

### Emulatorデータクリア
```bash
# Emulator停止後
rm -rf ./firebase-export

# テストデータ再投入
npm run setup:local
```

### 完全リセット
```bash
# 全てのローカルデータクリア
rm -rf node_modules .next firebase-export
npm install
npm run setup:local
```

## 📝 注意事項

1. **Emulator専用**: 本番環境には接続されません
2. **データ永続化**: Emulator停止時にデータは消失します
3. **API制限なし**: AI APIはダミーキーで動作確認のみ
4. **セキュリティ**: ローカル環境専用の設定です

## 🆘 サポート

問題が解決しない場合：
1. GitHub Issues で報告
2. 開発チームに相談
3. ログファイル確認: `.next/trace`

---

**🎉 ローカル開発環境の準備が完了しました！**
**チャットアプリの開発をお楽しみください！**