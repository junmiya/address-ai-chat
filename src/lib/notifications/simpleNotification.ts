'use client';

import { EmergencyCall, NotificationPreference, User } from '@/types';

// 簡易通知サービス

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationResult {
  success: boolean;
  method: 'browser' | 'email' | 'sound' | 'none';
  error?: string;
}

export class SimpleNotificationService {
  private permissionGranted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkPermission();
    }
  }

  // 通知権限をチェック
  private async checkPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  // ブラウザ通知を送信
  async sendBrowserNotification(data: NotificationData): Promise<NotificationResult> {
    try {
      if (!await this.checkPermission()) {
        return {
          success: false,
          method: 'browser',
          error: 'Notification permission not granted'
        };
      }

      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/notification-icon.png',
        badge: data.badge || '/icons/badge-icon.png',
        tag: data.tag || 'address-ai-chat',
        requireInteraction: data.requireInteraction || false,
        data: data.data
      });

      // 通知クリック時の処理
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (data.data?.url) {
          window.location.href = data.data.url;
        }
        notification.close();
      };

      // 自動的に5秒後に閉じる（requireInteractionが無効の場合）
      if (!data.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return {
        success: true,
        method: 'browser'
      };

    } catch (error) {
      return {
        success: false,
        method: 'browser',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 音声通知を再生
  async playNotificationSound(type: 'message' | 'emergency' | 'alert' = 'message'): Promise<NotificationResult> {
    try {
      // HTMLAudioを使用してシンプルな音声再生
      const audio = new Audio();
      
      switch (type) {
        case 'emergency':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQeCC2AzvjahSsJIXy98O+GMAUZGbX1sxUaCA==';
          break;
        case 'alert':
          audio.src = 'data:audio/wav;base64,UklGRv4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdoCAAC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4QEBAQEBAQEBAQEBAQEBAQEBAQEBAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4QEBAQEBAQEBAQEBAQEBAQEBAQEBA';
          break;
        default:
          audio.src = 'data:audio/wav;base64,UklGRvIBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ys4BAADGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsZAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4';
          break;
      }
      
      audio.volume = 0.3;
      await audio.play();

      return {
        success: true,
        method: 'sound'
      };

    } catch (error) {
      return {
        success: false,
        method: 'sound',
        error: error instanceof Error ? error.message : 'Failed to play sound'
      };
    }
  }

  // 緊急呼び出し通知を送信
  async sendEmergencyNotification(
    emergencyCall: EmergencyCall, 
    ownerPreferences: NotificationPreference
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // ブラウザ通知
    if (ownerPreferences.browser) {
      const browserResult = await this.sendBrowserNotification({
        title: '🚨 緊急呼び出し',
        body: `${emergencyCall.callerName}さんから緊急呼び出し: ${emergencyCall.message}`,
        icon: '/icons/emergency-icon.png',
        tag: `emergency-${emergencyCall.id}`,
        requireInteraction: true,
        data: {
          emergencyCallId: emergencyCall.id,
          roomId: emergencyCall.roomId,
          url: `/chat/${emergencyCall.roomId}`
        }
      });
      results.push(browserResult);
    }

    // 音声通知
    if (ownerPreferences.sound) {
      const soundResult = await this.playNotificationSound('emergency');
      results.push(soundResult);
    }

    // メール通知（簡易実装）
    if (ownerPreferences.email && ownerPreferences.emailAddress) {
      const emailResult = await this.sendEmailNotification(emergencyCall, ownerPreferences.emailAddress);
      results.push(emailResult);
    }

    return results;
  }

  // 入室通知を送信
  async sendJoinNotification(
    roomTitle: string, 
    userName: string, 
    ownerPreferences: NotificationPreference
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    if (ownerPreferences.browser) {
      const browserResult = await this.sendBrowserNotification({
        title: `${roomTitle} - 新しい参加者`,
        body: `${userName}さんがチャットルームに参加しました`,
        icon: '/icons/join-icon.png',
        tag: 'user-joined',
        requireInteraction: false,
        data: {
          type: 'user-joined',
          userName: userName
        }
      });
      results.push(browserResult);
    }

    if (ownerPreferences.sound) {
      const soundResult = await this.playNotificationSound('message');
      results.push(soundResult);
    }

    return results;
  }

  // メール通知（シンプル実装）
  private async sendEmailNotification(
    emergencyCall: EmergencyCall, 
    emailAddress: string
  ): Promise<NotificationResult> {
    try {
      // 開発環境ではコンソールログのみ
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email notification (Mock):', {
          to: emailAddress,
          subject: `🚨 緊急呼び出し - ${emergencyCall.roomTitle}`,
          body: `${emergencyCall.callerName}さんから緊急呼び出しがありました。\n\nメッセージ: ${emergencyCall.message}\n\n至急、チャットルームをご確認ください。\n\n${window.location.origin}/chat/${emergencyCall.roomId}`
        });

        return {
          success: true,
          method: 'email'
        };
      }

      // 本番環境では実際のメール送信API呼び出し
      // 今回は簡易実装のため、fetch APIでサーバー側エンドポイントを呼び出し
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress,
          subject: `🚨 緊急呼び出し - ${emergencyCall.roomTitle}`,
          body: `${emergencyCall.callerName}さんから緊急呼び出しがありました。\n\nメッセージ: ${emergencyCall.message}\n\n至急、チャットルームをご確認ください。`,
          emergencyCallId: emergencyCall.id
        })
      });

      if (response.ok) {
        return {
          success: true,
          method: 'email'
        };
      } else {
        return {
          success: false,
          method: 'email',
          error: `Email API error: ${response.status}`
        };
      }

    } catch (error) {
      return {
        success: false,
        method: 'email',
        error: error instanceof Error ? error.message : 'Email send failed'
      };
    }
  }

  // 通知テスト
  async testNotifications(preferences: NotificationPreference): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    if (preferences.browser) {
      const browserResult = await this.sendBrowserNotification({
        title: '🧪 通知テスト',
        body: 'ブラウザ通知が正常に動作しています',
        tag: 'notification-test',
        requireInteraction: false
      });
      results.push(browserResult);
    }

    if (preferences.sound) {
      const soundResult = await this.playNotificationSound('alert');
      results.push(soundResult);
    }

    return results;
  }

  // 権限状態を取得
  getPermissionStatus(): {
    supported: boolean;
    permission: NotificationPermission | 'unsupported';
  } {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return {
        supported: false,
        permission: 'unsupported'
      };
    }

    return {
      supported: true,
      permission: Notification.permission
    };
  }
}

// デフォルトインスタンス
export const notificationService = new SimpleNotificationService();