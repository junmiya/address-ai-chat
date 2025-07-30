'use client';

import { EmergencyCall, User, Room, NotificationPreference } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from '@/lib/notifications/simpleNotification';

// 緊急呼び出しサービス

export interface EmergencyCallOptions {
  message: string;
  priority: 'normal' | 'high' | 'critical';
  timeout?: number; // ミリ秒
}

export interface EmergencyCallResult {
  success: boolean;
  emergencyCall?: EmergencyCall;
  error?: string;
}

export class EmergencyCallService {
  private activeCalls: Map<string, EmergencyCall> = new Map();
  private callTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private storageKey = 'emergency-calls';

  constructor() {
    this.loadFromStorage();
  }

  // localStorageから緊急呼び出し履歴を読み込み
  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const calls = JSON.parse(stored);
        calls.forEach((call: any) => {
          this.activeCalls.set(call.id, {
            ...call,
            timestamp: new Date(call.timestamp),
            respondedAt: call.respondedAt ? new Date(call.respondedAt) : undefined
          });
        });
      }
    } catch (error) {
      console.error('Failed to load emergency calls from storage:', error);
    }
  }

  // localStorageに保存
  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const calls = Array.from(this.activeCalls.values());
      localStorage.setItem(this.storageKey, JSON.stringify(calls));
    } catch (error) {
      console.error('Failed to save emergency calls to storage:', error);
    }
  }

  // 緊急呼び出しを作成
  async createEmergencyCall(
    caller: User,
    room: Room,
    options: EmergencyCallOptions
  ): Promise<EmergencyCallResult> {
    try {
      // 同一ユーザーの重複呼び出しをチェック
      const existingCall = Array.from(this.activeCalls.values()).find(
        call => call.callerId === caller.uid && 
                call.roomId === room.roomId && 
                call.status === 'pending'
      );

      if (existingCall) {
        return {
          success: false,
          error: '既に緊急呼び出し中です。しばらくお待ちください。'
        };
      }

      // 緊急呼び出しオブジェクト作成
      const emergencyCall: EmergencyCall = {
        id: uuidv4(),
        callerId: caller.uid,
        callerName: caller.displayName,
        roomId: room.roomId,
        roomTitle: room.title,
        message: options.message,
        timestamp: new Date(),
        status: 'pending'
      };

      // アクティブな呼び出しに追加
      this.activeCalls.set(emergencyCall.id, emergencyCall);
      this.saveToStorage();

      // タイムアウト設定（デフォルト5分）
      const timeout = options.timeout || 5 * 60 * 1000;
      const timeoutId = setTimeout(() => {
        this.timeoutCall(emergencyCall.id);
      }, timeout);
      this.callTimeouts.set(emergencyCall.id, timeoutId);

      // オーナーに通知送信
      await this.notifyOwner(emergencyCall, room);

      return {
        success: true,
        emergencyCall
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '緊急呼び出しの作成に失敗しました'
      };
    }
  }

  // オーナーに通知を送信
  private async notifyOwner(emergencyCall: EmergencyCall, room: Room) {
    // デフォルトの通知設定
    const defaultPreferences: NotificationPreference = {
      browser: true,
      email: false,
      sound: true,
      emailAddress: undefined
    };

    // オーナーの通知設定を取得（実装時にはFirestoreから取得）
    const ownerPreferences = defaultPreferences; // TODO: 実際の設定を取得

    // 通知を送信
    const results = await notificationService.sendEmergencyNotification(
      emergencyCall,
      ownerPreferences
    );

    console.log('Emergency notification results:', results);
  }

  // 緊急呼び出しに応答
  async respondToCall(
    callId: string,
    response: 'answered' | 'ignored',
    ownerResponse?: string
  ): Promise<boolean> {
    const call = this.activeCalls.get(callId);
    if (!call || call.status !== 'pending') {
      return false;
    }

    // 呼び出し状態を更新
    call.status = response;
    call.ownerResponse = ownerResponse;
    call.respondedAt = new Date();

    this.activeCalls.set(callId, call);
    this.saveToStorage();

    // タイムアウトをクリア
    const timeoutId = this.callTimeouts.get(callId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.callTimeouts.delete(callId);
    }

    return true;
  }

  // 呼び出しをタイムアウト
  private timeoutCall(callId: string) {
    const call = this.activeCalls.get(callId);
    if (!call || call.status !== 'pending') {
      return;
    }

    call.status = 'timeout';
    call.respondedAt = new Date();
    this.activeCalls.set(callId, call);
    this.saveToStorage();

    this.callTimeouts.delete(callId);
    console.log(`Emergency call ${callId} timed out`);
  }

  // アクティブな呼び出しを取得
  getActiveCall(roomId: string): EmergencyCall | null {
    return Array.from(this.activeCalls.values()).find(
      call => call.roomId === roomId && call.status === 'pending'
    ) || null;
  }

  // 呼び出し履歴を取得
  getCallHistory(roomId?: string, limit: number = 50): EmergencyCall[] {
    let calls = Array.from(this.activeCalls.values());
    
    if (roomId) {
      calls = calls.filter(call => call.roomId === roomId);
    }

    // 新しい順にソート
    calls.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return calls.slice(0, limit);
  }

  // 特定の呼び出しを取得
  getCall(callId: string): EmergencyCall | null {
    return this.activeCalls.get(callId) || null;
  }

  // 呼び出しを削除（履歴クリア用）
  deleteCall(callId: string): boolean {
    const deleted = this.activeCalls.delete(callId);
    if (deleted) {
      this.saveToStorage();
      
      // タイムアウトもクリア
      const timeoutId = this.callTimeouts.get(callId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.callTimeouts.delete(callId);
      }
    }
    return deleted;
  }

  // すべての呼び出し履歴をクリア
  clearHistory(): void {
    // アクティブな呼び出し以外を削除
    const activeCalls = Array.from(this.activeCalls.values()).filter(
      call => call.status === 'pending'
    );
    
    this.activeCalls.clear();
    activeCalls.forEach(call => {
      this.activeCalls.set(call.id, call);
    });
    
    this.saveToStorage();
  }

  // 統計情報を取得
  getStatistics(roomId?: string): {
    total: number;
    pending: number;
    answered: number;
    ignored: number;
    timeout: number;
  } {
    let calls = Array.from(this.activeCalls.values());
    
    if (roomId) {
      calls = calls.filter(call => call.roomId === roomId);
    }

    return {
      total: calls.length,
      pending: calls.filter(call => call.status === 'pending').length,
      answered: calls.filter(call => call.status === 'answered').length,
      ignored: calls.filter(call => call.status === 'ignored').length,
      timeout: calls.filter(call => call.status === 'timeout').length
    };
  }

  // 緊急呼び出しテスト
  async testEmergencyCall(user: User, room: Room): Promise<EmergencyCallResult> {
    return await this.createEmergencyCall(user, room, {
      message: 'これはテスト用の緊急呼び出しです。',
      priority: 'normal',
      timeout: 30000 // 30秒でタイムアウト
    });
  }
}

// デフォルトインスタンス
export const emergencyCallService = new EmergencyCallService();