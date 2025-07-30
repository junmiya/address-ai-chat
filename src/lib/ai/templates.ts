'use client';

import { OwnerStatus, AIProxySettings } from '@/types';

// AI応答テンプレート管理

export interface ResponseTemplate {
  greeting: {
    online: string;
    away: string;
    busy: string;
    emergency_only: string;
  };
  status: {
    online: string;
    away: string;
    busy: string;
    emergency_only: string;
  };
  commands: {
    help: string;
    status: string;
    emergency: string;
  };
}

export const DEFAULT_TEMPLATES: ResponseTemplate = {
  greeting: {
    online: "こんにちは！{ownerName}のチャットルームへようこそ。オーナーは現在オンラインです。お気軽にお話しください。",
    away: "こんにちは！{ownerName}のチャットルームへようこそ。オーナーは現在離席中です。メッセージを残していただければ、戻り次第確認いたします。",
    busy: "こんにちは！{ownerName}のチャットルームへようこそ。オーナーは現在取り込み中です。緊急でない場合は、しばらくお待ちください。",
    emergency_only: "こんにちは！{ownerName}のチャットルームへようこそ。オーナーは現在、緊急時のみ対応可能です。緊急の場合は「🚨緊急」ボタンをクリックしてください。"
  },
  status: {
    online: "{ownerName}は現在オンラインです。お気軽にお話しください。",
    away: "{ownerName}は現在離席中です。{message}",
    busy: "{ownerName}は現在取り込み中です。{message}",
    emergency_only: "{ownerName}は現在、緊急時のみ対応可能です。緊急の場合は「🚨緊急」ボタンをクリックしてください。"
  },
  commands: {
    help: `利用可能なコマンド:
/status - オーナーの現在の状況を確認
/ai こんにちは - AIと会話
🚨緊急ボタン - オーナーに緊急連絡`,
    status: "オーナーの状況: {status}",
    emergency: "緊急時には「🚨緊急」ボタンをクリックして、オーナーに直接連絡できます。"
  }
};

export class ResponseTemplateManager {
  private templates: ResponseTemplate;

  constructor(customTemplates?: Partial<ResponseTemplate>) {
    this.templates = {
      ...DEFAULT_TEMPLATES,
      ...customTemplates
    };
  }

  // 挨拶メッセージ生成
  generateGreeting(ownerStatus: OwnerStatus, ownerName: string, customMessage?: string): string {
    const template = this.templates.greeting[ownerStatus.status];
    let message = template.replace('{ownerName}', ownerName);
    
    if (customMessage && ownerStatus.status !== 'online') {
      message += ` ${customMessage}`;
    }
    
    return message;
  }

  // ステータス確認メッセージ生成
  generateStatusResponse(ownerStatus: OwnerStatus, ownerName: string): string {
    const template = this.templates.status[ownerStatus.status];
    let message = template.replace('{ownerName}', ownerName);
    
    if (ownerStatus.message) {
      message = message.replace('{message}', ownerStatus.message);
    } else {
      message = message.replace('{message}', '');
    }
    
    return message;
  }

  // コマンドヘルプメッセージ
  getHelpMessage(): string {
    return this.templates.commands.help;
  }

  // 緊急時メッセージ
  getEmergencyMessage(): string {
    return this.templates.commands.emergency;
  }

  // カスタムテンプレート更新
  updateTemplate(section: keyof ResponseTemplate, updates: Partial<ResponseTemplate[keyof ResponseTemplate]>) {
    this.templates[section] = {
      ...this.templates[section],
      ...updates
    };
  }

  // テンプレート全体取得
  getTemplates(): ResponseTemplate {
    return { ...this.templates };
  }
}

// デフォルトインスタンス
export const defaultTemplateManager = new ResponseTemplateManager();