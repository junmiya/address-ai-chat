# 🎨 Draw.io アーキテクチャ図作成ガイド

## 📁 提供ファイル

Address AI Chatのアーキテクチャ図を以下の形式で提供しています：

### 1. 📄 詳細仕様書
- **ファイル**: `detailed-architecture-drawio.md`
- **内容**: レイヤー構成、コンポーネント詳細、色分けガイド
- **用途**: Draw.io作成時の設計資料

### 2. 🖼️ SVG形式図
- **ファイル**: `architecture-diagram.svg`
- **内容**: 完成したアーキテクチャ図（ベクター形式）
- **用途**: ドキュメント埋め込み、プレゼンテーション

### 3. 📋 Draw.io XMLファイル
- **ファイル**: `architecture-drawio.xml`
- **内容**: Draw.io直接インポート用XMLファイル
- **用途**: Draw.ioでの編集・カスタマイズ

## 🚀 Draw.io での使用方法

### オンライン版（推奨）
1. **https://app.diagrams.net/** にアクセス
2. 「Open Existing Diagram」をクリック
3. `architecture-drawio.xml` ファイルをアップロード
4. 編集・カスタマイズ

### デスクトップ版
1. Draw.io デスクトップアプリを起動
2. File → Import → `architecture-drawio.xml` を選択
3. 自動的に図が読み込まれます

## 🎨 アーキテクチャ図の特徴

### 7層レイヤー構成
```
Layer 1: Client Devices        (🌐 ブラウザ、📱 モバイル)
Layer 2: CDN & Edge Network    (🌍 Vercel Edge、📦 Assets)
Layer 3: Frontend Application  (⚛️ Next.js、🎨 React)
Layer 4: Real-time Comm       (🔌 Socket.io、🎤 Audio)
Layer 5: Backend Services      (🤖 AI Engine、📢 Notification)
Layer 6: Data Storage          (🐘 Supabase、💾 Browser)
Layer 7: External APIs         (🔥 Firebase、🧠 OpenAI)
```

### 色分けシステム
- **Client Layer**: #E3F2FD (水色)
- **CDN Layer**: #F3E5F5 (薄紫)
- **Frontend Layer**: #E8F5E8 (薄緑)
- **Real-time Layer**: #FFF3E0 (薄橙)
- **Backend Layer**: #FCE4EC (薄ピンク)
- **Storage Layer**: #E1F5FE (青)
- **External Layer**: #FFEBEE (薄赤)

### データフロー矢印
- **実線**: 同期処理
- **破線**: 非同期処理
- **太矢印**: 主要データフロー
- **細矢印**: 補助的な連携

## 🔧 カスタマイズのポイント

### 1. コンポーネントの追加・変更
```xml
<mxCell id="new-component" value="🆕 新しいコンポーネント&#xa;説明文&#xa;詳細情報" 
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#色コード;strokeColor=#境界色;" 
        vertex="1" parent="1">
  <mxGeometry x="位置X" y="位置Y" width="幅" height="高さ" as="geometry" />
</mxCell>
```

### 2. 接続線の追加
```xml
<mxCell id="new-arrow" value="" 
        style="endArrow=classic;html=1;rounded=0;strokeColor=#333333;strokeWidth=2;" 
        edge="1" parent="1">
  <mxGeometry width="50" height="50" relative="1" as="geometry">
    <mxPoint x="開始X" y="開始Y" as="sourcePoint" />
    <mxPoint x="終了X" y="終了Y" as="targetPoint" />
  </mxGeometry>
</mxCell>
```

### 3. 新しいレイヤーの追加
```xml
<mxCell id="new-layer-bg" value="" 
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#背景色;strokeColor=#境界色;strokeWidth=2;opacity=30;" 
        vertex="1" parent="1">
  <mxGeometry x="50" y="Y位置" width="1070" height="80" as="geometry" />
</mxCell>
```

## 📊 技術仕様表示

現在の図には以下の技術情報が含まれています：

### ✅ 実装完了
- Next.js 15 + React 19
- TypeScript (Strict Mode)
- Socket.io リアルタイム通信
- Web Audio API 音声処理
- Web Speech API 音声認識
- AI Engine (SimpleAI + ButlerAI)
- Supabase統合準備完了

### 🔄 Phase完了状況
- **Phase 1**: 基盤チャットシステム ✅
- **Phase 2**: AI代理応答システム ✅
- **Phase 3**: 音声通信システム ✅
- **Phase 4**: AI執事システム ✅

## 🎯 使用シーン

### プレゼンテーション用
- SVG形式をパワーポイントに埋め込み
- 高解像度での印刷対応
- スケーラブルベクター形式

### ドキュメント用
- README.mdへの埋め込み
- 技術仕様書への添付
- アーキテクチャレビュー資料

### 開発用
- チーム内での設計共有
- 新メンバーへのオンボーディング
- システム理解促進ツール

## 📝 更新・メンテナンス

システムの変更があった場合：

1. `architecture-drawio.xml` を Draw.io で開く
2. 該当コンポーネントを更新
3. エクスポート: File → Export as → SVG/PNG
4. ドキュメントファイルを更新

この包括的なアーキテクチャ図により、Address AI Chatの複雑なシステム構成が視覚的に理解できます。