import { connect } from 'socket.io-client';
import type { SocketEvents } from '@/types';

class SocketService {
  private socket: unknown | null = null;
  private mockMode = false;
  private mockEventHandlers: Map<string, ((...args: any[]) => void)[]> = new Map();

  // Socket.ioサーバーに接続
  connect(userId: string, token?: string): Promise<unknown> {
    return new Promise((resolve) => {
      if (this.socket && (this.socket as any)?.connected) {
        resolve(this.socket);
        return;
      }

      // 開発環境でSocket.ioサーバーが利用できない場合はモックモードを使用
      if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SOCKET_SERVER_URL) {
        console.warn('Socket.io server not configured. Using mock mode.');
        this.mockMode = true;
        this.socket = this.createMockSocket();
        resolve(this.socket);
        return;
      }

      // 開発環境ではモックサーバーを使用、本番環境では実際のSocket.ioサーバーに接続
      const serverUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001';
      
      this.socket = connect(serverUrl, {
        auth: {
          userId,
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      // 接続成功
      (this.socket as any).on('connect', () => {
        console.log('Socket.io connected:', (this.socket as any)?.id);
        resolve(this.socket!);
      });

      // 接続エラー - モックモードにフォールバック
      (this.socket as any).on('connect_error', (error: unknown) => {
        console.error('Socket.io connection error:', error);
        console.warn('Falling back to mock mode due to connection error');
        this.mockMode = true;
        this.socket = this.createMockSocket();
        resolve(this.socket);
      });

      // 切断時の処理
      (this.socket as any).on('disconnect', (reason: string) => {
        console.log('Socket.io disconnected:', reason);
        if (reason === 'io server disconnect') {
          // サーバーから切断された場合は再接続
          this.reconnect(userId, token);
        }
      });

      // カスタムエラーハンドリング
      (this.socket as any).on('error', (error: unknown) => {
        console.error('Socket.io error:', error);
      });
    });
  }


  // 手動再接続
  private reconnect(userId: string, token?: string) {
    if (this.socket && !this.mockMode) {
      (this.socket as any).disconnect();
    }
    this.connect(userId, token);
  }

  // モックSocket.ioオブジェクトを作成
  private createMockSocket() {
    return {
      connected: true,
      id: 'mock-socket-' + Math.random().toString(36).substr(2, 9),
      emit: (event: string, ...args: any[]) => {
        console.log('[Mock Socket] Emit:', event, args);
        
        // メッセージ送信のシミュレーション
        if (event === 'send_message') {
          const messageData = args[0];
          // モックモードでは実際のメッセージ送信は行わず、
          // chatStoreで直接状態管理を行うため、ここでは何もしない
          console.log('[Mock Socket] Message sent (handled by chatStore):', messageData);
        }
      },
      on: (event: string, callback: (...args: any[]) => void) => {
        console.log('[Mock Socket] Register listener for:', event);
        if (!this.mockEventHandlers.has(event)) {
          this.mockEventHandlers.set(event, []);
        }
        this.mockEventHandlers.get(event)!.push(callback);
      },
      off: (event: string, callback?: (...args: any[]) => void) => {
        if (callback) {
          const handlers = this.mockEventHandlers.get(event) || [];
          const index = handlers.indexOf(callback);
          if (index > -1) {
            handlers.splice(index, 1);
          }
        } else {
          this.mockEventHandlers.delete(event);
        }
      },
      disconnect: () => {
        console.log('[Mock Socket] Disconnect');
        (this as any).connected = false;
      },
    };
  }

  // モックイベントをトリガー
  private triggerMockEvent(event: string, ...args: any[]) {
    const handlers = this.mockEventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error('[Mock Socket] Error in event handler:', error);
      }
    });
  }

  // ルームに参加
  joinRoom(roomId: string): void {
    if (!(this.socket as any)?.connected) {
      console.error('Socket not connected');
      return;
    }
    (this.socket as any).emit('join_room', roomId);
    
    // モックモードの場合、参加成功をシミュレート
    if (this.mockMode) {
      setTimeout(() => {
        this.triggerMockEvent('room_joined', roomId);
      }, 50);
    }
  }

  // ルームから退出
  leaveRoom(roomId: string): void {
    if (!(this.socket as any)?.connected) {
      console.error('Socket not connected');
      return;
    }
    (this.socket as any).emit('leave_room', roomId);
    
    // モックモードの場合、退出成功をシミュレート
    if (this.mockMode) {
      setTimeout(() => {
        this.triggerMockEvent('room_left', roomId);
      }, 50);
    }
  }

  // メッセージ送信
  sendMessage(message: Parameters<SocketEvents['send_message']>[0]): void {
    if (!(this.socket as any)?.connected) {
      console.error('Socket not connected');
      return;
    }
    (this.socket as any).emit('send_message', message);
  }

  // タイピング状態開始
  startTyping(roomId: string, userId: string): void {
    if (!(this.socket as any)?.connected) return;
    (this.socket as any).emit('typing_start', roomId, userId);
  }

  // タイピング状態終了
  stopTyping(roomId: string, userId: string): void {
    if (!(this.socket as any)?.connected) return;
    (this.socket as any).emit('typing_stop', roomId, userId);
  }

  // 汎用的なイベント送信
  emit(event: string, data: any): void {
    if (!(this.socket as any)?.connected) {
      console.error('Socket not connected');
      return;
    }
    (this.socket as any).emit(event, data);
  }

  // イベントリスナー追加
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    (this.socket as any).on(event, callback as never);
  }

  // イベントリスナー削除
  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (!this.socket) return;
    if (callback) {
      (this.socket as any).off(event, callback as never);
    } else {
      (this.socket as any).off(event);
    }
  }

  // 接続状態確認
  isConnected(): boolean {
    return (this.socket as any)?.connected ?? false;
  }

  // モックモード確認
  isMockMode(): boolean {
    return this.mockMode;
  }

  // Socket.ioインスタンス取得
  getSocket(): unknown | null {
    return this.socket;
  }

  // 接続切断
  disconnect(): void {
    if (this.socket) {
      if (!this.mockMode) {
        (this.socket as any).disconnect();
      }
      this.socket = null;
    }
    this.mockMode = false;
    this.mockEventHandlers.clear();
  }
}

// シングルトンインスタンス
export const socketService = new SocketService();

// 開発環境用のモック関数
export const createMockSocketServer = () => {
  // 実際のSocket.ioサーバーが利用できない場合のフォールバック
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SOCKET_SERVER_URL) {
    console.warn('Socket.io server not configured. Using mock mode.');
    return {
      connect: () => Promise.resolve(null),
      joinRoom: () => {},
      leaveRoom: () => {},
      sendMessage: () => {},
      startTyping: () => {},
      stopTyping: () => {},
      on: () => {},
      off: () => {},
      isConnected: () => false,
      disconnect: () => {},
    };
  }
};

export default socketService;