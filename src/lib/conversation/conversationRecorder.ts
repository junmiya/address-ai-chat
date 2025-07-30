'use client';

import { speechToTextService, SpeechRecognitionResult, ConversationTranscript } from '@/lib/speech/speechToTextService';
import { simpleVoiceService } from '@/lib/voice/simpleVoiceService';
import { butlerAIEngine, ButlerConversation, ButlerResponse, OwnerNotification } from '@/lib/ai/butlerAI';
import { User, Room } from '@/types';

export interface ConversationSession {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  status: 'preparing' | 'active' | 'completed' | 'error';
  startTime: Date;
  endTime?: Date;
  voiceEnabled: boolean;
  textEnabled: boolean;
  
  // 音声データ
  voiceRecording: boolean;
  
  // テキストデータ
  speechToText: ConversationTranscript | null;
  
  // AI執事データ
  butlerConversation: ButlerConversation | null;
  aiResponses: ButlerResponse[];
  
  // 最終結果
  finalNotification: OwnerNotification | null;
}

export interface ConversationEvents {
  onSessionStart: (session: ConversationSession) => void;
  onSpeechResult: (result: SpeechRecognitionResult) => void;
  onAIResponse: (response: ButlerResponse) => void;
  onSessionComplete: (notification: OwnerNotification) => void;
  onError: (error: Error) => void;
}

export class ConversationRecorder {
  private currentSession: ConversationSession | null = null;
  private eventHandlers: Partial<ConversationEvents> = {};
  private isInitialized = false;

  constructor() {
    this.setupEventHandlers();
  }

  // イベントハンドラーの設定
  private setupEventHandlers(): void {
    // Speech-to-Text イベント
    speechToTextService.on('onResult', (result) => {
      this.handleSpeechResult(result);
    });

    speechToTextService.on('onError', (error) => {
      console.error('Speech-to-Text error:', error);
      this.handleError(error);
    });

    speechToTextService.on('onEnd', () => {
      console.log('Speech recognition ended');
      this.completeSession();
    });

    // Voice Service イベント
    simpleVoiceService.on('onRecordingStart', () => {
      console.log('Voice recording started');
      if (this.currentSession) {
        this.currentSession.voiceRecording = true;
      }
    });

    simpleVoiceService.on('onRecordingStop', () => {
      console.log('Voice recording stopped');
      if (this.currentSession) {
        this.currentSession.voiceRecording = false;
      }
    });

    simpleVoiceService.on('onError', (error) => {
      console.error('Voice service error:', error);
      this.handleError(new Error(`Voice error: ${error.message}`));
    });
  }

  // 会話セッション開始
  async startSession(
    roomId: string,
    user: User,
    room: Room,
    options: {
      enableVoice?: boolean;
      enableSpeechToText?: boolean;
      enableAIButler?: boolean;
    } = {}
  ): Promise<ConversationSession> {
    try {
      // 既存セッションがある場合は終了
      if (this.currentSession) {
        await this.stopSession();
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 新しいセッションを作成
      this.currentSession = {
        id: sessionId,
        roomId,
        userId: user.uid,
        userName: user.displayName,
        status: 'preparing',
        startTime: new Date(),
        voiceEnabled: options.enableVoice ?? true,
        textEnabled: options.enableSpeechToText ?? true,
        voiceRecording: false,
        speechToText: null,
        butlerConversation: null,
        aiResponses: [],
        finalNotification: null
      };

      console.log('Starting conversation session:', sessionId);

      // サービスの初期化
      if (this.currentSession.voiceEnabled) {
        if (!simpleVoiceService.isReady()) {
          await simpleVoiceService.initialize(user.uid);
        }
      }

      if (this.currentSession.textEnabled) {
        if (!speechToTextService.isSupported()) {
          throw new Error('Speech-to-Text is not supported in this browser');
        }
      }

      // AI執事の開始
      if (options.enableAIButler) {
        const butlerResponse = await butlerAIEngine.handleVoiceCallStart(roomId, user, room);
        this.currentSession.aiResponses.push(butlerResponse);
        this.eventHandlers.onAIResponse?.(butlerResponse);
      }

      // Speech-to-Text開始
      if (this.currentSession.textEnabled) {
        await speechToTextService.start(roomId, user.uid, user.displayName);
      }

      this.currentSession.status = 'active';
      this.eventHandlers.onSessionStart?.(this.currentSession);

      console.log('Conversation session started successfully');
      return this.currentSession;

    } catch (error) {
      console.error('Failed to start conversation session:', error);
      if (this.currentSession) {
        this.currentSession.status = 'error';
      }
      this.handleError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }

  // 音声録音開始
  startVoiceRecording(): void {
    if (!this.currentSession?.voiceEnabled) {
      console.warn('Voice recording not available');
      return;
    }

    if (!simpleVoiceService.isReady()) {
      console.warn('Voice service not ready');
      return;
    }

    simpleVoiceService.startRecording(this.currentSession.roomId);
  }

  // 音声録音停止
  stopVoiceRecording(): void {
    if (!this.currentSession?.voiceEnabled) return;

    simpleVoiceService.stopRecording();
  }

  // 音声認識結果の処理
  private async handleSpeechResult(result: SpeechRecognitionResult): Promise<void> {
    if (!this.currentSession) return;

    try {
      // イベント通知
      this.eventHandlers.onSpeechResult?.(result);

      // AI執事に音声結果を送信（確定されたもののみ）
      if (result.isFinal && this.currentSession.butlerConversation) {
        const aiResponse = await butlerAIEngine.processVoiceInput(
          this.currentSession.butlerConversation.id,
          result
        );

        if (aiResponse) {
          this.currentSession.aiResponses.push(aiResponse);
          this.eventHandlers.onAIResponse?.(aiResponse);

          // 会話終了が提案された場合
          if (!aiResponse.shouldContinue) {
            setTimeout(() => {
              this.completeSession();
            }, 2000); // 2秒後に自動終了
          }
        }
      }
    } catch (error) {
      console.error('Error handling speech result:', error);
      this.handleError(error instanceof Error ? error : new Error('Speech processing error'));
    }
  }

  // セッション完了
  async completeSession(): Promise<OwnerNotification | null> {
    if (!this.currentSession || this.currentSession.status !== 'active') {
      return null;
    }

    try {
      console.log('Completing conversation session:', this.currentSession.id);

      // 音声録音停止
      if (this.currentSession.voiceEnabled) {
        this.stopVoiceRecording();
      }

      // Speech-to-Text停止
      if (this.currentSession.textEnabled) {
        speechToTextService.stop();
      }

      // 最終的な音声認識結果を取得
      const finalTranscript = speechToTextService.getCurrentTranscript();
      this.currentSession.speechToText = finalTranscript;

      // AI執事による最終分析
      let finalNotification: OwnerNotification | null = null;
      if (this.currentSession.butlerConversation && finalTranscript) {
        finalNotification = await butlerAIEngine.completeConversation(
          this.currentSession.butlerConversation.id,
          finalTranscript
        );
        this.currentSession.finalNotification = finalNotification;
      }

      this.currentSession.status = 'completed';
      this.currentSession.endTime = new Date();

      // イベント通知
      if (finalNotification) {
        this.eventHandlers.onSessionComplete?.(finalNotification);
      }

      console.log('Conversation session completed successfully');
      return finalNotification;

    } catch (error) {
      console.error('Error completing session:', error);
      this.handleError(error instanceof Error ? error : new Error('Session completion error'));
      return null;
    }
  }

  // セッション停止（強制終了）
  async stopSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      console.log('Stopping conversation session:', this.currentSession.id);

      // 各サービスを停止
      if (this.currentSession.voiceEnabled) {
        this.stopVoiceRecording();
      }

      if (this.currentSession.textEnabled) {
        speechToTextService.stop();
      }

      // AI執事の会話を中断
      if (this.currentSession.butlerConversation) {
        butlerAIEngine.interruptConversation(
          this.currentSession.butlerConversation.id,
          'Session manually stopped'
        );
      }

      this.currentSession.status = 'completed';
      this.currentSession.endTime = new Date();

    } catch (error) {
      console.error('Error stopping session:', error);
    } finally {
      this.currentSession = null;
    }
  }

  // エラーハンドリング
  private handleError(error: Error): void {
    console.error('Conversation recorder error:', error);
    
    if (this.currentSession) {
      this.currentSession.status = 'error';
    }
    
    this.eventHandlers.onError?.(error);
  }

  // 現在のセッション取得
  getCurrentSession(): ConversationSession | null {
    return this.currentSession;
  }

  // セッション状態確認
  isSessionActive(): boolean {
    return this.currentSession?.status === 'active' || false;
  }

  // 音声録音状態確認
  isVoiceRecording(): boolean {
    return this.currentSession?.voiceRecording || false;
  }

  // 最新の音声認識テキスト取得
  getLatestSpeechText(): string {
    if (!this.currentSession?.textEnabled) return '';
    return speechToTextService.getLatestText();
  }

  // 確定された音声認識テキスト取得
  getFinalSpeechText(): string {
    if (!this.currentSession?.textEnabled) return '';
    return speechToTextService.getFinalText();
  }

  // イベントハンドラー登録
  on<K extends keyof ConversationEvents>(event: K, handler: ConversationEvents[K]): void {
    this.eventHandlers[event] = handler;
  }

  // クリーンアップ
  cleanup(): void {
    this.stopSession();
    speechToTextService.cleanup();
    simpleVoiceService.cleanup();
    butlerAIEngine.cleanup();
    this.eventHandlers = {};
    console.log('ConversationRecorder cleaned up');
  }
}

// シングルトンインスタンス
export const conversationRecorder = new ConversationRecorder();