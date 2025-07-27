# 🔧 デバッグユーティリティ

## **localStorage データ確認コマンド**

ブラウザの開発者ツールのConsoleで以下のコマンドを実行すると、現在のlocalStorageデータを確認できます。

### **ルームデータ確認**
```javascript
// ルーム情報を整形して表示
const rooms = JSON.parse(localStorage.getItem('chat-app-mock-rooms') || '[]');
console.table(rooms.map(room => ({
  roomId: room.roomId,
  title: room.title,
  owner: room.ownerUid,
  visibility: room.visibility,
  participantCount: room.participants.length,
  participants: room.participants.join(', ')
})));
```

### **メッセージデータ確認**
```javascript
// メッセージ情報を整形して表示
const messages = JSON.parse(localStorage.getItem('chat-app-mock-messages') || '{}');
Object.keys(messages).forEach(roomId => {
  console.log(`=== Room: ${roomId} ===`);
  console.table(messages[roomId].map(msg => ({
    msgId: msg.msgId,
    sender: msg.senderUid,
    text: msg.text.substring(0, 50) + '...',
    time: new Date(msg.createdAt).toLocaleString()
  })));
});
```

### **localStorage完全削除（リセット用）**
```javascript
// テストデータをクリア
localStorage.removeItem('chat-app-mock-rooms');
localStorage.removeItem('chat-app-mock-messages');
console.log('localStorage cleared');
```

### **テストデータ作成**
```javascript
// 手動でテストデータを作成
const testRoom = {
  roomId: 'manual-test-room',
  ownerUid: 'test1@example.com',
  title: 'Manual Test Room',
  notice: 'Created manually for testing',
  visibility: 'public',
  chatType: '1vN',
  participants: ['test1@example.com'],
  aiProxyEnabled: true,
  createdAt: new Date().toISOString(),
  isActive: true,
  isClosed: false
};

localStorage.setItem('chat-app-mock-rooms', JSON.stringify([testRoom]));
console.log('Test room created');
```

## **ネットワーク状況確認**

### **開発サーバー接続確認**
```javascript
fetch('/api/health')
  .then(response => console.log('Server status:', response.status))
  .catch(error => console.log('Server connection error:', error));
```

## **React State確認**

### **Zustand Store確認（React Developer Tools）**
```javascript
// ChatStoreの現在の状態を確認
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('React DevTools available');
} else {
  console.log('React DevTools not found');
}
```

## **よくある問題と解決法**

### **1. データが表示されない**
```javascript
// 現在のlocalStorageサイズを確認
let totalSize = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    totalSize += localStorage[key].length;
  }
}
console.log('localStorage total size:', totalSize, 'characters');
console.log('Available storage:', 5 * 1024 * 1024 - totalSize, 'characters remaining');
```

### **2. 参加者リストが更新されない**
```javascript
// 特定ルームの参加者を確認
const roomId = 'YOUR_ROOM_ID'; // 実際のルームIDに置き換え
const rooms = JSON.parse(localStorage.getItem('chat-app-mock-rooms') || '[]');
const targetRoom = rooms.find(room => room.roomId === roomId);
if (targetRoom) {
  console.log('Room participants:', targetRoom.participants);
} else {
  console.log('Room not found:', roomId);
}
```

### **3. メッセージが重複する**
```javascript
// 重複メッセージをチェック
const messages = JSON.parse(localStorage.getItem('chat-app-mock-messages') || '{}');
Object.keys(messages).forEach(roomId => {
  const msgIds = messages[roomId].map(msg => msg.msgId);
  const uniqueIds = [...new Set(msgIds)];
  if (msgIds.length !== uniqueIds.length) {
    console.warn('Duplicate messages found in room:', roomId);
    console.log('Total messages:', msgIds.length, 'Unique messages:', uniqueIds.length);
  }
});
```

## **パフォーマンス確認**

### **localStorage読み書き速度**
```javascript
// localStorage操作の速度を測定
const testData = JSON.stringify(Array(1000).fill({ test: 'data' }));

console.time('localStorage-write');
localStorage.setItem('speed-test', testData);
console.timeEnd('localStorage-write');

console.time('localStorage-read');
const readData = localStorage.getItem('speed-test');
console.timeEnd('localStorage-read');

localStorage.removeItem('speed-test');
```

## **自動リロードテスト**

### **データ永続性確認**
```javascript
// 5秒後にページをリロードしてデータが保持されているか確認
console.log('Current rooms:', JSON.parse(localStorage.getItem('chat-app-mock-rooms') || '[]').length);
console.log('Page will reload in 5 seconds...');
setTimeout(() => {
  location.reload();
}, 5000);
```

---

**💡 使用方法**: ブラウザのF12→Consoleタブで上記のコードをコピー&ペーストして実行してください。