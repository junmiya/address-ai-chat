# ⚡ 簡潔な移行手順: address-ai-chat

## 🎯 実行ステップ

### **Step 1: GitHubで新リポジトリ作成**
```
Repository name: address-ai-chat
Description: AI-powered chat application with room management
Visibility: Public
✅ Add README
✅ Add .gitignore (Node.js)  
✅ Add License (MIT)
```

### **Step 2: ローカル移行実行**
```bash
# 作業ディレクトリに移動
cd /workspace

# 新しいリポジトリをクローン
git clone https://github.com/junmiya/address-ai-chat.git

# chat-appの内容をコピー
cp -r chat-app/* address-ai-chat/
cp chat-app/.* address-ai-chat/ 2>/dev/null || true

# 新しいディレクトリに移動
cd address-ai-chat

# gitを初期化し直し
rm -rf .git
git init
git remote add origin https://github.com/junmiya/address-ai-chat.git

# READMEを置き換え
mv NEW_README.md README.md

# 初回コミット
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

### **Step 3: 動作確認**
```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm test
```

### **Step 4: Vercel再デプロイ**
- Vercelで新しいリポジトリを接続
- 環境変数を再設定
- デプロイテスト

## ✅ 完了チェックリスト

- [ ] GitHubリポジトリ作成
- [ ] ローカル移行実行
- [ ] 初回コミット完了
- [ ] npm install 成功
- [ ] npm run dev 起動確認
- [ ] npm test 実行確認
- [ ] Vercelデプロイ設定

---

**所要時間**: 約10-15分  
**準備完了**: 全ファイルが移行準備済み