'use client';

import { ConversationTranscript, SpeechRecognitionResult } from '@/lib/speech/speechToTextService';
import { User, Room } from '@/types';

export interface ButlerConversation {
  id: string;
  roomId: string;
  guestUserId: string;
  guestUserName: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'interrupted';
  transcript: ConversationTranscript | null;
  analysis: ConversationAnalysis | null;
  ownerNotified: boolean;
}

export interface ConversationAnalysis {
  summary: string;
  intent: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  requiresFollowUp: boolean;
  suggestedResponse: string;
  confidence: number;
}

export interface ButlerResponse {
  text: string;
  type: 'greeting' | 'gathering_info' | 'clarification' | 'summary' | 'closing';
  shouldContinue: boolean;
  nextQuestions?: string[];
}

export interface OwnerNotification {
  conversationId: string;
  summary: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  guestInfo: {
    name: string;
    userId: string;
  };
  callDuration: number;
  transcript: string;
  analysis: ConversationAnalysis;
  timestamp: Date;
}

export class ButlerAIEngine {
  private activeConversations = new Map<string, ButlerConversation>();
  private mockMode = true; // 開発環境ではモック

  constructor() {
    this.mockMode = process.env.NODE_ENV === 'development';
  }

  // 音声通話開始時の執事応答
  async handleVoiceCallStart(
    roomId: string, 
    guest: User, 
    room: Room
  ): Promise<ButlerResponse> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 新しい会話セッションを開始
    const conversation: ButlerConversation = {
      id: conversationId,
      roomId,
      guestUserId: guest.uid,
      guestUserName: guest.displayName,
      startTime: new Date(),
      status: 'active',
      transcript: null,
      analysis: null,
      ownerNotified: false
    };

    this.activeConversations.set(conversationId, conversation);

    // 丁寧な挨拶と状況説明
    const ownerName = room.title || 'オーナー';
    const greeting = this.generateGreeting(guest.displayName, ownerName);

    return {
      text: greeting,
      type: 'greeting',
      shouldContinue: true,
      nextQuestions: [
        'お名前とご用件を教えていただけますでしょうか？',
        'どのようなことでお困りでしょうか？',
        'ご連絡先もお聞かせいただけますか？'
      ]
    };
  }

  // 会話中の音声認識結果を処理
  async processVoiceInput(
    conversationId: string,
    result: SpeechRecognitionResult
  ): Promise<ButlerResponse | null> {
    const conversation = this.activeConversations.get(conversationId);
    if (!conversation) return null;

    // 確定した音声のみを処理
    if (!result.isFinal) return null;

    // 会話分析
    const analysis = await this.analyzeConversation(result.text, conversation);
    
    // 応答生成
    return await this.generateResponse(result.text, analysis, conversation);
  }

  // 会話完了時の処理
  async completeConversation(
    conversationId: string,
    transcript: ConversationTranscript
  ): Promise<OwnerNotification | null> {
    const conversation = this.activeConversations.get(conversationId);
    if (!conversation) return null;

    conversation.transcript = transcript;
    conversation.endTime = new Date();
    conversation.status = 'completed';

    // 最終分析
    const fullText = transcript.segments
      .filter(s => s.isFinal)
      .map(s => s.text)
      .join(' ');

    const finalAnalysis = await this.analyzeFullConversation(fullText, conversation);
    conversation.analysis = finalAnalysis;

    // オーナー通知の作成
    const notification = this.createOwnerNotification(conversation);
    conversation.ownerNotified = true;

    // 会話セッションをクリーンアップ（少し遅延）
    setTimeout(() => {
      this.activeConversations.delete(conversationId);
    }, 60000); // 1分後にクリーンアップ

    return notification;
  }

  // 挨拶メッセージの生成
  private generateGreeting(guestName: string, ownerName: string): string {
    const greetings = [
      `${guestName}様、お疲れ様でございます。私は${ownerName}の執事AIでございます。`,
      `${guestName}様、こんにちは。${ownerName}の代理でお話を承らせていただきます。`,
      `${guestName}様、お忙しい中お時間をいただき、ありがとうございます。私が${ownerName}に代わってお話を伺います。`
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return `${greeting}\n\n現在${ownerName}は不在でございますが、ご用件を詳しくお聞かせいただければ、適切にお伝えいたします。どのようなことでお困りでしょうか？`;
  }

  // 会話分析（リアルタイム）
  private async analyzeConversation(
    text: string,
    conversation: ButlerConversation
  ): Promise<ConversationAnalysis> {
    if (this.mockMode) {
      return this.generateMockAnalysis(text);
    }

    // 実際のAI分析実装予定
    return this.generateMockAnalysis(text);
  }

  // 完全な会話の分析
  private async analyzeFullConversation(
    fullText: string,
    conversation: ButlerConversation
  ): Promise<ConversationAnalysis> {
    if (this.mockMode) {
      return this.generateMockFullAnalysis(fullText, conversation);
    }

    // 実際のAI分析実装予定
    return this.generateMockFullAnalysis(fullText, conversation);
  }

  // 応答生成
  private async generateResponse(
    input: string,
    analysis: ConversationAnalysis,
    conversation: ButlerConversation
  ): Promise<ButlerResponse> {
    if (this.mockMode) {
      return this.generateMockResponse(input, analysis);
    }

    // 実際のAI応答生成実装予定
    return this.generateMockResponse(input, analysis);
  }

  // モック分析生成
  private generateMockAnalysis(text: string): ConversationAnalysis {
    const urgencyKeywords = {
      emergency: ['緊急', '急ぎ', '至急', 'emergency', 'urgent'],
      high: ['重要', '大切', '必要', '問題', 'important'],
      medium: ['相談', '質問', '確認', 'question'],
      low: ['挨拶', 'こんにちは', 'hello']
    };

    let urgency: 'low' | 'medium' | 'high' | 'emergency' = 'low';
    const lowerText = text.toLowerCase();

    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        urgency = level as any;
        break;
      }
    }

    return {
      summary: `「${text.substring(0, 50)}...」について`,
      intent: '問い合わせ・相談',
      urgency,
      topics: this.extractTopics(text),
      sentiment: 'neutral',
      requiresFollowUp: true,
      suggestedResponse: 'より詳しい情報をお聞かせください',
      confidence: 0.8
    };
  }

  // 完全な会話のモック分析
  private generateMockFullAnalysis(
    fullText: string,
    conversation: ButlerConversation
  ): ConversationAnalysis {
    const baseAnalysis = this.generateMockAnalysis(fullText);
    
    return {
      ...baseAnalysis,
      summary: `${conversation.guestUserName}様からのお問い合わせ: ${fullText.substring(0, 100)}...`,
      intent: '詳細な問い合わせ',
      confidence: 0.9,
      requiresFollowUp: fullText.length > 50
    };
  }

  // モック応答生成
  private generateMockResponse(
    input: string,
    analysis: ConversationAnalysis
  ): ButlerResponse {
    const responses = [
      'かしこまりました。詳しくお聞かせください。',
      'なるほど、承知いたしました。他にも何かございますか？',
      'ありがとうございます。追加で確認したいことがございます。',
      'とても重要なお話ですね。オーナーにしっかりとお伝えいたします。'
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    return {
      text: response,
      type: 'gathering_info',
      shouldContinue: analysis.urgency !== 'emergency',
      nextQuestions: analysis.requiresFollowUp ? [
        'ご連絡先はお聞かせいただけますでしょうか？',
        '緊急度はいかがでしょうか？',
        '他にもお伝えしたいことはございますか？'
      ] : undefined
    };
  }

  // トピック抽出
  private extractTopics(text: string): string[] {
    const commonTopics = [
      '料金', '価格', 'サービス', '製品', '問題', '質問', 
      'サポート', '技術', '営業', '契約', '相談'
    ];

    return commonTopics.filter(topic => 
      text.includes(topic)
    ).slice(0, 3);
  }

  // オーナー通知の作成
  private createOwnerNotification(conversation: ButlerConversation): OwnerNotification {
    if (!conversation.transcript || !conversation.analysis) {
      throw new Error('Conversation not properly analyzed');
    }

    const transcript = conversation.transcript.segments
      .filter(s => s.isFinal)
      .map(s => s.text)
      .join(' ');

    return {
      conversationId: conversation.id,
      summary: conversation.analysis.summary,
      urgency: conversation.analysis.urgency,
      guestInfo: {
        name: conversation.guestUserName,
        userId: conversation.guestUserId
      },
      callDuration: conversation.transcript.totalDuration,
      transcript,
      analysis: conversation.analysis,
      timestamp: new Date()
    };
  }

  // アクティブな会話の取得
  getActiveConversation(conversationId: string): ButlerConversation | null {
    return this.activeConversations.get(conversationId) || null;
  }

  // 全てのアクティブな会話の取得
  getAllActiveConversations(): ButlerConversation[] {
    return Array.from(this.activeConversations.values());
  }

  // 会話の中断
  interruptConversation(conversationId: string, reason: string): boolean {
    const conversation = this.activeConversations.get(conversationId);
    if (!conversation) return false;

    conversation.status = 'interrupted';
    conversation.endTime = new Date();

    console.log(`Conversation ${conversationId} interrupted: ${reason}`);
    return true;
  }

  // クリーンアップ
  cleanup(): void {
    this.activeConversations.clear();
    console.log('ButlerAI cleaned up');
  }
}

// シングルトンインスタンス
export const butlerAIEngine = new ButlerAIEngine();