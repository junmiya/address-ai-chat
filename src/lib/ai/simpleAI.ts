'use client';

import { OwnerStatus, AIProxySettings, User, Room } from '@/types';
import { ResponseTemplateManager, defaultTemplateManager } from './templates';

// 簡易AI応答エンジン

export interface AICommand {
  command: string;
  args: string[];
  originalMessage: string;
}

export interface AIResponse {
  content: string;
  type: 'greeting' | 'status' | 'command' | 'conversation' | 'error';
  shouldNotifyOwner: boolean;
  isEmergency: boolean;
}

export class SimpleAIEngine {
  private templateManager: ResponseTemplateManager;
  private mockMode: boolean = true; // 開発環境ではモックモード

  constructor(templateManager?: ResponseTemplateManager) {
    this.templateManager = templateManager || defaultTemplateManager;
    this.mockMode = process.env.NODE_ENV === 'development';
  }

  // メッセージがコマンドかチェック
  isCommand(message: string): boolean {
    return message.trim().startsWith('/');
  }

  // メッセージがAI宛てかチェック
  isAIMessage(message: string): boolean {
    const aiKeywords = ['ai', 'AI', 'bot', 'ボット', 'ロボット'];
    const lowerMessage = message.toLowerCase();
    return aiKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  }

  // 緊急キーワードをチェック
  isEmergencyMessage(message: string): boolean {
    const emergencyKeywords = ['緊急', '急ぎ', '至急', '助けて', 'help', 'emergency', 'urgent'];
    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // コマンドを解析
  parseCommand(message: string): AICommand | null {
    const trimmed = message.trim();
    if (!trimmed.startsWith('/')) return null;

    const parts = trimmed.slice(1).split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    return {
      command,
      args,
      originalMessage: message
    };
  }

  // 入室時の挨拶メッセージ生成
  generateGreeting(room: Room, user: User): AIResponse | null {
    if (!room.aiProxySettings?.autoGreeting || !room.ownerStatus) {
      return null;
    }

    const ownerName = room.title || 'オーナー';
    const content = this.templateManager.generateGreeting(
      room.ownerStatus,
      ownerName,
      room.aiProxySettings.greetingMessage
    );

    return {
      content,
      type: 'greeting',
      shouldNotifyOwner: false,
      isEmergency: false
    };
  }

  // コマンド処理
  async processCommand(command: AICommand, room: Room, user: User): Promise<AIResponse> {
    if (!room.aiProxySettings?.commandResponse) {
      return {
        content: 'AI応答機能は現在無効です。',
        type: 'error',
        shouldNotifyOwner: false,
        isEmergency: false
      };
    }

    switch (command.command) {
      case 'status':
        return this.handleStatusCommand(room, user);
      
      case 'ai':
        return this.handleAICommand(command.args.join(' '), room, user);
      
      case 'help':
        return this.handleHelpCommand(room, user);
      
      case 'emergency':
        return this.handleEmergencyCommand(command.args.join(' '), room, user);
      
      default:
        return {
          content: `不明なコマンドです: /${command.command}\n${this.templateManager.getHelpMessage()}`,
          type: 'error',
          shouldNotifyOwner: false,
          isEmergency: false
        };
    }
  }

  // ステータス確認コマンド
  private handleStatusCommand(room: Room, user: User): AIResponse {
    if (!room.ownerStatus) {
      return {
        content: 'オーナーの状況情報が取得できません。',
        type: 'error',
        shouldNotifyOwner: false,
        isEmergency: false
      };
    }

    const ownerName = room.title || 'オーナー';
    const content = this.templateManager.generateStatusResponse(room.ownerStatus, ownerName);

    return {
      content,
      type: 'status',
      shouldNotifyOwner: false,
      isEmergency: false
    };
  }

  // AI会話コマンド
  private async handleAICommand(query: string, room: Room, user: User): Promise<AIResponse> {
    if (!query.trim()) {
      return {
        content: 'AIとの会話を開始します。何か話しかけてください。\n例: /ai こんにちは',
        type: 'conversation',
        shouldNotifyOwner: false,
        isEmergency: false
      };
    }

    // モックモードでは簡易応答
    if (this.mockMode) {
      const mockResponse = this.generateMockResponse(query, user);
      return {
        content: mockResponse,
        type: 'conversation',
        shouldNotifyOwner: false,
        isEmergency: false
      };
    }

    // 実際のAI API呼び出し（将来実装）
    try {
      const response = await this.callAIAPI(query, room, user);
      return {
        content: response,
        type: 'conversation',
        shouldNotifyOwner: false,
        isEmergency: false
      };
    } catch (error) {
      return {
        content: 'AI応答でエラーが発生しました。しばらくしてから再度お試しください。',
        type: 'error',
        shouldNotifyOwner: false,
        isEmergency: false
      };
    }
  }

  // ヘルプコマンド
  private handleHelpCommand(room: Room, user: User): AIResponse {
    return {
      content: this.templateManager.getHelpMessage(),
      type: 'command',
      shouldNotifyOwner: false,
      isEmergency: false
    };
  }

  // 緊急コマンド
  private handleEmergencyCommand(message: string, room: Room, user: User): AIResponse {
    return {
      content: `${this.templateManager.getEmergencyMessage()}\n\n緊急メッセージ: ${message || 'なし'}`,
      type: 'command',
      shouldNotifyOwner: true,
      isEmergency: true
    };
  }

  // モック応答生成
  private generateMockResponse(query: string, user: User): string {
    const responses = [
      `${user.displayName}さん、こんにちは！「${query}」について、実際の本番環境では詳細な回答をいたします。`,
      `${query}に関して、AIが適切に応答します。（現在はテストモードです）`,
      `興味深いご質問ですね。本番環境では、より詳細な情報を提供できます。`,
      `${user.displayName}さんのご質問「${query}」について考えています...（モックモード）`,
      `AIとして、「${query}」について最適な回答を準備中です。実際の環境ではより高度な応答が可能です。`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 実際のAI API呼び出し（将来実装）
  private async callAIAPI(query: string, room: Room, user: User): Promise<string> {
    // OpenAI GPT-4o-mini API呼び出し実装予定
    // 現在はモックレスポンス
    return this.generateMockResponse(query, user);
  }

  // 自動応答判定
  shouldAutoRespond(message: string, room: Room): boolean {
    if (!room.aiProxySettings?.enabled) return false;
    
    // コマンドの場合は必ず応答
    if (this.isCommand(message)) return true;
    
    // AI宛てのメッセージの場合は応答
    if (this.isAIMessage(message)) return true;
    
    // 緊急メッセージの場合は応答
    if (this.isEmergencyMessage(message)) return true;
    
    // オーナーが離席中で、キーワードマッチした場合
    if (room.ownerStatus?.status === 'away' || room.ownerStatus?.status === 'busy') {
      const keywords = room.aiProxyConfig?.keywords || [];
      const lowerMessage = message.toLowerCase();
      return keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
    }
    
    return false;
  }

  // メッセージ処理のメインエントリーポイント
  async processMessage(message: string, room: Room, user: User): Promise<AIResponse | null> {
    if (!this.shouldAutoRespond(message, room)) {
      return null;
    }

    // コマンド処理
    const command = this.parseCommand(message);
    if (command) {
      return await this.processCommand(command, room, user);
    }

    // 緊急メッセージ処理
    if (this.isEmergencyMessage(message)) {
      return {
        content: `緊急のメッセージを検知しました。オーナーに通知しています。\n\n${this.templateManager.getEmergencyMessage()}`,
        type: 'command',
        shouldNotifyOwner: true,
        isEmergency: true
      };
    }

    // AI宛てメッセージ処理
    if (this.isAIMessage(message)) {
      const aiQuery = message.replace(/ai|AI|bot|ボット|ロボット/gi, '').trim();
      return await this.handleAICommand(aiQuery, room, user);
    }

    // キーワードマッチによる自動応答
    const ownerName = room.title || 'オーナー';
    let content = '';
    
    switch (room.ownerStatus?.status) {
      case 'away':
        content = room.aiProxySettings?.awayMessage || 
                 `${ownerName}は現在離席中です。メッセージを残していただければ、戻り次第確認いたします。`;
        break;
      case 'busy':
        content = room.aiProxySettings?.busyMessage || 
                 `${ownerName}は現在取り込み中です。緊急でない場合は、しばらくお待ちください。`;
        break;
      case 'emergency_only':
        content = room.aiProxySettings?.emergencyMessage || 
                 `${ownerName}は現在、緊急時のみ対応可能です。緊急の場合は「🚨緊急」ボタンをクリックしてください。`;
        break;
      default:
        return null;
    }

    return {
      content,
      type: 'status',
      shouldNotifyOwner: false,
      isEmergency: false
    };
  }
}

// デフォルトインスタンス
export const defaultAIEngine = new SimpleAIEngine();