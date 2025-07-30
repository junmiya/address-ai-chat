import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin の初期化
let adminApp;
let db;
let adminAuth;

try {
  // 開発環境ではエミュレーターを使用
  if (process.env.NODE_ENV === 'development') {
    // エミュレーター使用時
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    
    adminApp = getApps().length === 0 ? initializeApp({
      projectId: 'fake-project'
    }) : getApps()[0];
  } else {
    // 本番環境では Service Account を使用
    const serviceAccount = await import(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
    adminApp = getApps().length === 0 ? initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    }) : getApps()[0];
  }
  
  db = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// 接続中のユーザー管理
const connectedUsers = new Map();
const userSockets = new Map();

export default function setupSocketHandlers(io) {
  console.log('Socket.io handlers initialized');
  
  // 認証ミドルウェア
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Firebase Auth でトークンを検証
      let decodedToken;
      if (process.env.NODE_ENV === 'development') {
        // 開発環境ではエミュレーター用の簡易認証
        // 実際のプロジェクトでは適切なトークン検証を実装
        decodedToken = { uid: token, email: `${token}@example.com` };
      } else {
        decodedToken = await adminAuth.verifyIdToken(token);
      }
      
      socket.userId = decodedToken.uid;
      socket.userEmail = decodedToken.email;
      
      console.log(`User authenticated: ${socket.userId}`);
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // ユーザー接続情報を記録
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      connectedAt: new Date(),
      lastSeen: new Date()
    });
    userSockets.set(socket.id, socket.userId);

    // ユーザーのオンライン状態を更新
    updateUserOnlineStatus(socket.userId, true);

    // チャットルームに参加
    socket.on('join-room', async (roomId) => {
      try {
        // ルームの存在確認とアクセス権限チェック
        const hasAccess = await checkRoomAccess(socket.userId, roomId);
        if (!hasAccess) {
          socket.emit('error', { message: 'Room access denied' });
          return;
        }

        socket.join(roomId);
        socket.currentRoom = roomId;
        
        console.log(`User ${socket.userId} joined room ${roomId}`);
        
        // 他の参加者にユーザー参加を通知
        socket.to(roomId).emit('user-joined', {
          userId: socket.userId,
          userEmail: socket.userEmail,
          timestamp: new Date()
        });

        // 最近のメッセージを送信
        const recentMessages = await getRecentMessages(roomId, 50);
        socket.emit('recent-messages', recentMessages);

      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // チャットルームから退出
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      socket.currentRoom = null;
      
      // 他の参加者にユーザー退出を通知
      socket.to(roomId).emit('user-left', {
        userId: socket.userId,
        timestamp: new Date()
      });
      
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // メッセージ送信
    socket.on('send-message', async (data) => {
      try {
        const { roomId, content, type = 'text' } = data;
        
        if (!socket.currentRoom || socket.currentRoom !== roomId) {
          socket.emit('error', { message: 'Not in the specified room' });
          return;
        }

        // メッセージをFirestoreに保存
        const messageDoc = await saveMessageToFirestore({
          roomId,
          senderId: socket.userId,
          senderEmail: socket.userEmail,
          content,
          type,
          timestamp: new Date()
        });

        const message = {
          id: messageDoc.id,
          roomId,
          senderId: socket.userId,
          senderEmail: socket.userEmail,
          content,
          type,
          timestamp: new Date()
        };

        // ルーム内の全ユーザーにメッセージを配信
        io.to(roomId).emit('new-message', message);
        
        console.log(`Message sent in room ${roomId} by ${socket.userId}`);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // タイピング状態の通知
    socket.on('typing-start', (roomId) => {
      if (socket.currentRoom === roomId) {
        socket.to(roomId).emit('user-typing', {
          userId: socket.userId,
          isTyping: true
        });
      }
    });

    socket.on('typing-stop', (roomId) => {
      if (socket.currentRoom === roomId) {
        socket.to(roomId).emit('user-typing', {
          userId: socket.userId,
          isTyping: false
        });
      }
    });

    // 既読状態の管理
    socket.on('mark-message-read', async (data) => {
      try {
        const { messageId, roomId } = data;
        
        if (!socket.currentRoom || socket.currentRoom !== roomId) {
          socket.emit('error', { message: 'Not in the specified room' });
          return;
        }

        // Firestoreにメッセージ既読状態を保存
        await markMessageAsRead(messageId, socket.userId);

        // ルーム内の他のユーザーに既読通知
        socket.to(roomId).emit('message-read', {
          messageId,
          userId: socket.userId,
          readAt: new Date()
        });

        console.log(`Message ${messageId} marked as read by ${socket.userId}`);

      } catch (error) {
        console.error('Mark message as read error:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    socket.on('mark-all-messages-read', async (data) => {
      try {
        const { roomId } = data;
        
        if (!socket.currentRoom || socket.currentRoom !== roomId) {
          socket.emit('error', { message: 'Not in the specified room' });
          return;
        }

        // ルーム内の未読メッセージをすべて既読にマーク
        const messageIds = await markAllMessagesAsRead(roomId, socket.userId);

        // ルーム内の他のユーザーに一括既読通知
        socket.to(roomId).emit('messages-read', {
          messageIds,
          userId: socket.userId,
          readAt: new Date()
        });

        console.log(`All messages in room ${roomId} marked as read by ${socket.userId}`);

      } catch (error) {
        console.error('Mark all messages as read error:', error);
        socket.emit('error', { message: 'Failed to mark all messages as read' });
      }
    });

    // === 音声トランシーバー機能 ===
    
    // 音声ルーム参加
    socket.on('join-voice-room', (data) => {
      const { roomId, userId, userName } = data;
      console.log(`User ${userId} joined voice room: ${roomId}`);
      
      socket.join(`voice-${roomId}`);
      socket.voiceRoomId = roomId;
      
      // 他の参加者に通知
      socket.to(`voice-${roomId}`).emit('user-joined-voice', {
        userId,
        userName,
        timestamp: Date.now()
      });
    });

    // 音声ルーム退出
    socket.on('leave-voice-room', (data) => {
      const { roomId, userId } = data;
      console.log(`User ${userId} left voice room: ${roomId}`);
      
      socket.leave(`voice-${roomId}`);
      delete socket.voiceRoomId;
      
      // 他の参加者に通知
      socket.to(`voice-${roomId}`).emit('user-left-voice', {
        userId,
        timestamp: Date.now()
      });
    });

    // 話し始め通知
    socket.on('voice-start-speaking', (data) => {
      const { roomId, userId, userName } = data;
      console.log(`User ${userId} started speaking in room: ${roomId}`);
      
      // 同じ音声ルームの他の参加者に通知
      socket.to(`voice-${roomId}`).emit('user-started-speaking', {
        userId,
        userName,
        timestamp: Date.now()
      });
    });

    // 話し終わり通知
    socket.on('voice-stop-speaking', (data) => {
      const { roomId, userId } = data;
      console.log(`User ${userId} stopped speaking in room: ${roomId}`);
      
      // 同じ音声ルームの他の参加者に通知
      socket.to(`voice-${roomId}`).emit('user-stopped-speaking', {
        userId,
        timestamp: Date.now()
      });
    });

    // 音声データ送信
    socket.on('voice-data', (data) => {
      const { roomId, userId, audioData, timestamp, duration } = data;
      
      if (!roomId || !audioData) {
        console.warn('Invalid voice data received');
        return;
      }

      // 同じ音声ルームの他の参加者に音声データを送信
      socket.to(`voice-${roomId}`).emit('receive-voice-data', {
        userId,
        userName: socket.userName || 'Unknown',
        audioData,
        timestamp: timestamp || Date.now(),
        duration: duration || 0
      });

      console.log(`Voice data forwarded from ${userId} in room: ${roomId}`);
    });

    // === 既存の接続解除処理 ===
    
    // 接続解除時の処理
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // 音声ルームからも退出
      if (socket.voiceRoomId) {
        socket.to(`voice-${socket.voiceRoomId}`).emit('user-left-voice', {
          userId: socket.userId,
          timestamp: Date.now()
        });
      }
      
      // ユーザー情報をクリーンアップ
      connectedUsers.delete(socket.userId);
      userSockets.delete(socket.id);
      
      // オンライン状態を更新
      updateUserOnlineStatus(socket.userId, false);
      
      // 参加していたルームから退出通知
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('user-left', {
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  });

  // ヘルパー関数
  async function checkRoomAccess(userId, roomId) {
    try {
      if (!db) return true; // エミュレーター環境では一時的に全許可
      
      const roomDoc = await db.collection('rooms').doc(roomId).get();
      if (!roomDoc.exists) return false;
      
      const roomData = roomDoc.data();
      return roomData.participants && roomData.participants.includes(userId);
    } catch (error) {
      console.error('Room access check error:', error);
      return false;
    }
  }

  async function saveMessageToFirestore(messageData) {
    try {
      if (!db) {
        // エミュレーター環境で Firebase が利用できない場合のモック
        return { id: `mock-${Date.now()}` };
      }
      
      const docRef = await db.collection('messages').add({
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return docRef;
    } catch (error) {
      console.error('Save message error:', error);
      throw error;
    }
  }

  async function getRecentMessages(roomId, limit = 50) {
    try {
      if (!db) {
        // エミュレーター環境でのモックデータ
        return [];
      }
      
      const messagesSnapshot = await db.collection('messages')
        .where('roomId', '==', roomId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
    } catch (error) {
      console.error('Get recent messages error:', error);
      return [];
    }
  }

  async function updateUserOnlineStatus(userId, isOnline) {
    try {
      if (!db) return; // エミュレーター環境では無視
      
      await db.collection('users').doc(userId).update({
        isOnline,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Update online status error:', error);
    }
  }

  async function markMessageAsRead(messageId, userId) {
    try {
      if (!db) return; // エミュレーター環境では無視
      
      const messageRef = db.collection('messages').doc(messageId);
      const messageDoc = await messageRef.get();
      
      if (!messageDoc.exists) {
        throw new Error('Message not found');
      }
      
      const messageData = messageDoc.data();
      const readBy = messageData.readBy || [];
      
      // 既に既読済みでない場合のみ追加
      if (!readBy.includes(userId)) {
        await messageRef.update({
          readBy: [...readBy, userId]
        });
        
        // 詳細な既読状態をread_statusコレクションに保存
        await db.collection('read_status').add({
          messageId,
          userId,
          readAt: new Date(),
          roomId: messageData.roomId
        });
      }
    } catch (error) {
      console.error('Mark message as read error:', error);
      throw error;
    }
  }

  async function markAllMessagesAsRead(roomId, userId) {
    try {
      if (!db) return []; // エミュレーター環境では空配列を返す
      
      // ルーム内の未読メッセージを取得
      const messagesSnapshot = await db.collection('messages')
        .where('roomId', '==', roomId)
        .where('senderUid', '!=', userId) // 自分が送信したメッセージは除外
        .get();
      
      const batch = db.batch();
      const messageIds = [];
      const readStatusBatch = [];
      
      messagesSnapshot.docs.forEach(doc => {
        const messageData = doc.data();
        const readBy = messageData.readBy || [];
        
        // 未読メッセージのみ処理
        if (!readBy.includes(userId)) {
          batch.update(doc.ref, {
            readBy: [...readBy, userId]
          });
          
          messageIds.push(doc.id);
          readStatusBatch.push({
            messageId: doc.id,
            userId,
            readAt: new Date(),
            roomId
          });
        }
      });
      
      // メッセージの既読状態を一括更新
      if (messageIds.length > 0) {
        await batch.commit();
        
        // 詳細な既読状態を一括保存
        const readStatusPromises = readStatusBatch.map(status => 
          db.collection('read_status').add(status)
        );
        await Promise.all(readStatusPromises);
      }
      
      return messageIds;
    } catch (error) {
      console.error('Mark all messages as read error:', error);
      throw error;
    }
  }
}