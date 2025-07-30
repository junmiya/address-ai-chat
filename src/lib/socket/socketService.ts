'use client';

import io from 'socket.io-client';
import { User } from '@/types';

export interface SocketMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderEmail: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
}

export interface TypingUser {
  userId: string;
  isTyping: boolean;
}

export interface UserJoinedEvent {
  userId: string;
  userEmail: string;
  timestamp: Date;
}

export interface UserLeftEvent {
  userId: string;
  timestamp: Date;
}

class SocketService {
  private socket: any | null = null;
  private currentUser: User | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // メッセージバッファリング（オフライン時用）
  private messageBuffer: Array<{
    type: 'message' | 'file' | 'image' | 'typing' | 'read';
    data: any;
    timestamp: number;
  }> = [];
  private maxBufferSize = 100;

  // イベントリスナー
  private messageHandlers: ((message: SocketMessage) => void)[] = [];
  private typingHandlers: ((data: TypingUser) => void)[] = [];
  private userJoinedHandlers: ((data: UserJoinedEvent) => void)[] = [];
  private userLeftHandlers: ((data: UserLeftEvent) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private errorHandlers: ((error: string) => void)[] = [];
  private messageReadHandlers: ((data: { messageId: string, userId: string, readAt: Date }) => void)[] = [];
  private messagesReadHandlers: ((data: { messageIds: string[], userId: string, readAt: Date }) => void)[] = [];

  constructor() {
    this.setupWindowEvents();
  }

  private setupWindowEvents() {
    if (typeof window !== 'undefined') {
      // ページリロード時の接続クリーンアップ
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });

      // ネットワーク状態の監視
      window.addEventListener('online', () => {
        if (this.currentUser && !this.isConnected()) {
          this.connect(this.currentUser);
        }
      });

      window.addEventListener('offline', () => {
        this.notifyConnectionStatus(false);
      });
    }
  }

  async connect(user: User): Promise<boolean> {
    if (this.isConnecting || this.isConnected()) {
      return true;
    }

    try {
      this.isConnecting = true;
      this.currentUser = user;

      const serverUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : `http://localhost:${process.env.PORT || 3000}`;

      this.socket = io(serverUrl, {
        auth: {
          token: user.uid // 開発環境では uid をトークンとして使用
        },
        transports: ['polling', 'websocket'], // pollingを優先して接続安定性を向上
        timeout: 20000, // タイムアウトを20秒に延長
        reconnection: true,
        reconnectionDelay: 2000, // 再接続間隔を2秒に
        reconnectionAttempts: this.maxReconnectAttempts,
        forceNew: true // 新しい接続を強制
      });

      await this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.isConnecting = false;
          reject(new Error('Connection timeout'));
        }, 25000); // 25秒のタイムアウト

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.notifyConnectionStatus(true);
          console.log('Socket.io connected successfully');
          resolve(true);
        });

        this.socket!.on('connect_error', (error: any) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.error('Socket.io connection error:', error);
          this.notifyError(`Connection failed: ${error.message}`);
          reject(error);
        });
      });

    } catch (error) {
      this.isConnecting = false;
      console.error('Socket connection error:', error);
      throw error;
    }
  }

  private async setupEventListeners() {
    if (!this.socket) return;

    // 接続・切断イベント
    this.socket.on('disconnect', (reason: any) => {
      console.log('Socket.io disconnected:', reason);
      this.notifyConnectionStatus(false);

      if (reason === 'io server disconnect') {
        // サーバー側から切断された場合は再接続
        this.reconnect();
      }
    });

    this.socket.on('reconnect', () => {
      console.log('Socket.io reconnected');
      this.notifyConnectionStatus(true);
    });

    this.socket.on('reconnect_error', (error: any) => {
      this.reconnectAttempts++;
      console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.notifyError('Failed to reconnect after multiple attempts');
      }
    });

    // メッセージイベント
    this.socket.on('new-message', (message: SocketMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('recent-messages', (messages: SocketMessage[]) => {
      messages.forEach(message => {
        this.messageHandlers.forEach(handler => handler(message));
      });
    });

    // タイピングイベント
    this.socket.on('user-typing', (data: TypingUser) => {
      this.typingHandlers.forEach(handler => handler(data));
    });

    // ユーザー参加・退出イベント
    this.socket.on('user-joined', (data: UserJoinedEvent) => {
      this.userJoinedHandlers.forEach(handler => handler(data));
    });

    this.socket.on('user-left', (data: UserLeftEvent) => {
      this.userLeftHandlers.forEach(handler => handler(data));
    });

    // 既読状態イベント
    this.socket.on('message-read', (data: { messageId: string, userId: string, readAt: Date }) => {
      this.messageReadHandlers.forEach(handler => handler(data));
    });

    this.socket.on('messages-read', (data: { messageIds: string[], userId: string, readAt: Date }) => {
      this.messagesReadHandlers.forEach(handler => handler(data));
    });

    // エラーイベント
    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket.io error:', error);
      this.notifyError(error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentUser = null;
    this.isConnecting = false;
    this.notifyConnectionStatus(false);
  }

  private async reconnect() {
    if (this.currentUser && !this.isConnecting) {
      try {
        await this.connect(this.currentUser);
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // ルーム操作
  joinRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', roomId);
    }
  }

  // メッセージ送信（バッファリング機能付き）
  sendMessage(roomId: string, content: string, type: 'text' | 'image' | 'file' = 'text') {
    const messageData = { roomId, content, type };
    
    if (this.socket?.connected) {
      this.socket.emit('send-message', messageData);
    } else {
      // オフライン時はバッファに保存
      this.addToBuffer('message', messageData);
      console.warn('Socket not connected, message buffered');
    }
  }

  // ファイルメッセージ送信
  sendFileMessage(roomId: string, fileData: {
    url: string;
    filename: string;
    size: number;
    type: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('send-message', {
        roomId,
        content: JSON.stringify(fileData),
        type: 'file'
      });
    } else {
      throw new Error('Socket not connected');
    }
  }

  // 画像メッセージ送信
  sendImageMessage(roomId: string, imageData: {
    url: string;
    filename: string;
    size: number;
    type: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('send-message', {
        roomId,
        content: JSON.stringify(imageData),
        type: 'image'
      });
    } else {
      throw new Error('Socket not connected');
    }
  }

  // メッセージ既読マーク
  markMessageAsRead(messageId: string, roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark-message-read', {
        messageId,
        roomId
      });
    }
  }

  // ルーム内全メッセージ既読マーク
  markAllMessagesAsRead(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark-all-messages-read', {
        roomId
      });
    }
  }

  // タイピング通知
  startTyping(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing-start', roomId);
    }
  }

  stopTyping(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing-stop', roomId);
    }
  }

  // イベントリスナー登録
  onMessage(handler: (message: SocketMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onTyping(handler: (data: TypingUser) => void) {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
    };
  }

  onUserJoined(handler: (data: UserJoinedEvent) => void) {
    this.userJoinedHandlers.push(handler);
    return () => {
      this.userJoinedHandlers = this.userJoinedHandlers.filter(h => h !== handler);
    };
  }

  onUserLeft(handler: (data: UserLeftEvent) => void) {
    this.userLeftHandlers.push(handler);
    return () => {
      this.userLeftHandlers = this.userLeftHandlers.filter(h => h !== handler);
    };
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  onError(handler: (error: string) => void) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  onMessageRead(handler: (data: { messageId: string, userId: string, readAt: Date }) => void) {
    this.messageReadHandlers.push(handler);
    return () => {
      this.messageReadHandlers = this.messageReadHandlers.filter(h => h !== handler);
    };
  }

  onMessagesRead(handler: (data: { messageIds: string[], userId: string, readAt: Date }) => void) {
    this.messagesReadHandlers.push(handler);
    return () => {
      this.messagesReadHandlers = this.messagesReadHandlers.filter(h => h !== handler);
    };
  }

  // バッファリング機能
  private addToBuffer(type: 'message' | 'file' | 'image' | 'typing' | 'read', data: any) {
    // バッファサイズ制限
    if (this.messageBuffer.length >= this.maxBufferSize) {
      this.messageBuffer.shift(); // 古いメッセージを削除
    }
    
    this.messageBuffer.push({
      type,
      data,
      timestamp: Date.now()
    });
  }

  private async flushBuffer() {
    if (!this.socket?.connected || this.messageBuffer.length === 0) {
      return;
    }

    console.log(`Flushing ${this.messageBuffer.length} buffered messages`);
    
    // バッファ内のメッセージを順番に送信
    const buffer = [...this.messageBuffer];
    this.messageBuffer = [];
    
    for (const item of buffer) {
      try {
        // 古すぎるメッセージ（5分以上）はスキップ
        if (Date.now() - item.timestamp > 5 * 60 * 1000) {
          console.warn('Skipping old buffered message:', item);
          continue;
        }
        
        switch (item.type) {
          case 'message':
            this.socket.emit('send-message', item.data);
            break;
          case 'file':
          case 'image':
            this.socket.emit('send-message', item.data);
            break;
          case 'typing':
            this.socket.emit(item.data.action, item.data.roomId);
            break;
          case 'read':
            this.socket.emit(item.data.action, item.data);
            break;
        }
        
        // レート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Failed to flush buffered message:', error);
      }
    }
  }

  // プライベートメソッド
  private notifyConnectionStatus(connected: boolean) {
    this.connectionHandlers.forEach(handler => handler(connected));
    
    // 接続復旧時にバッファをフラッシュ
    if (connected) {
      this.flushBuffer().catch(console.error);
    }
  }

  private notifyError(error: string) {
    this.errorHandlers.forEach(handler => handler(error));
  }
}

// シングルトンインスタンス
export const socketService = new SocketService();