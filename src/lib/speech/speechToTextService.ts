'use client';

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
}

export interface ConversationTranscript {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  segments: TranscriptSegment[];
  startTime: Date;
  endTime?: Date;
  totalDuration: number;
  status: 'recording' | 'completed' | 'error';
}

export interface TranscriptSegment {
  id: string;
  text: string;
  confidence: number;
  startTime: Date;
  endTime?: Date;
  duration: number;
  isFinal: boolean;
}

export interface SpeechToTextEvents {
  onResult: (result: SpeechRecognitionResult) => void;
  onError: (error: Error) => void;
  onStart: () => void;
  onEnd: () => void;
  onSilence: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSupported = false;
  private currentTranscript: ConversationTranscript | null = null;
  private eventHandlers: Partial<SpeechToTextEvents> = {};
  private silenceTimer: NodeJS.Timeout | null = null;
  private lastResultTime = 0;
  private silenceThreshold = 3000; // 3秒間無音で終了

  constructor() {
    this.checkSupport();
    this.initializeRecognition();
  }

  // ブラウザサポート確認
  private checkSupport(): void {
    if (typeof window === 'undefined') {
      this.isSupported = false;
      return;
    }

    this.isSupported = !!(
      window.SpeechRecognition || 
      window.webkitSpeechRecognition
    );

    if (!this.isSupported) {
      console.warn('Speech Recognition API is not supported in this browser');
    }
  }

  // 音声認識の初期化
  private initializeRecognition(): void {
    if (!this.isSupported || typeof window === 'undefined') return;

    const SpeechRecognitionClass = 
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    this.recognition = new SpeechRecognitionClass();
    
    // 設定
    this.recognition.continuous = true; // 連続認識
    this.recognition.interimResults = true; // 中間結果を取得
    this.recognition.lang = 'ja-JP'; // 日本語
    this.recognition.maxAlternatives = 1; // 1つの候補のみ

    // イベントハンドラー設定
    this.setupEventHandlers();
  }

  // イベントハンドラーの設定
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.eventHandlers.onStart?.();
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
      this.stopSilenceTimer();
      this.finalizeCurrentTranscript();
      this.eventHandlers.onEnd?.();
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.stopSilenceTimer();
      
      const error = new Error(`Speech recognition error: ${event.error}`);
      this.eventHandlers.onError?.(error);
      
      if (this.currentTranscript) {
        this.currentTranscript.status = 'error';
      }
    };

    this.recognition.onresult = (event) => {
      this.handleSpeechResult(event);
    };

    this.recognition.onspeechstart = () => {
      console.log('Speech detected');
      this.resetSilenceTimer();
    };

    this.recognition.onspeechend = () => {
      console.log('Speech ended');
      this.startSilenceTimer();
    };
  }

  // 音声認識結果の処理
  private handleSpeechResult(event: SpeechRecognitionEvent): void {
    this.lastResultTime = Date.now();
    this.resetSilenceTimer();

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      const speechResult: SpeechRecognitionResult = {
        text: transcript,
        confidence: confidence || 0.5,
        isFinal,
        timestamp: new Date()
      };

      // 現在の会話記録に追加
      this.addToCurrentTranscript(speechResult);

      // イベント通知
      this.eventHandlers.onResult?.(speechResult);

      if (isFinal) {
        console.log('Final result:', transcript);
      }
    }
  }

  // 現在の会話記録に結果を追加
  private addToCurrentTranscript(result: SpeechRecognitionResult): void {
    if (!this.currentTranscript) return;

    const segmentId = `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 最後のセグメントが確定していない場合は更新、そうでなければ新規追加
    const lastSegment = this.currentTranscript.segments[this.currentTranscript.segments.length - 1];
    
    if (lastSegment && !lastSegment.isFinal && !result.isFinal) {
      // 中間結果の更新
      lastSegment.text = result.text;
      lastSegment.confidence = result.confidence;
      lastSegment.endTime = result.timestamp;
      lastSegment.duration = result.timestamp.getTime() - lastSegment.startTime.getTime();
    } else {
      // 新しいセグメントの追加
      const segment: TranscriptSegment = {
        id: segmentId,
        text: result.text,
        confidence: result.confidence,
        startTime: result.timestamp,
        endTime: result.isFinal ? result.timestamp : undefined,
        duration: 0,
        isFinal: result.isFinal
      };

      if (result.isFinal && lastSegment && !lastSegment.isFinal) {
        // 前のセグメントを確定
        lastSegment.isFinal = true;
        lastSegment.endTime = result.timestamp;
        lastSegment.duration = result.timestamp.getTime() - lastSegment.startTime.getTime();
      }

      this.currentTranscript.segments.push(segment);
    }

    // 全体の継続時間を更新
    this.currentTranscript.totalDuration = 
      result.timestamp.getTime() - this.currentTranscript.startTime.getTime();
  }

  // 無音タイマーの開始
  private startSilenceTimer(): void {
    this.stopSilenceTimer();
    
    this.silenceTimer = setTimeout(() => {
      console.log('Silence detected, stopping recognition');
      this.eventHandlers.onSilence?.();
      this.stop();
    }, this.silenceThreshold);
  }

  // 無音タイマーのリセット
  private resetSilenceTimer(): void {
    this.stopSilenceTimer();
    this.startSilenceTimer();
  }

  // 無音タイマーの停止
  private stopSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  // 音声認識開始
  start(roomId: string, userId: string, userName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech Recognition is not supported'));
        return;
      }

      if (!this.recognition) {
        reject(new Error('Speech Recognition is not initialized'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Speech Recognition is already running'));
        return;
      }

      try {
        // 新しい会話記録を開始
        this.currentTranscript = {
          id: `transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          roomId,
          userId,
          userName,
          segments: [],
          startTime: new Date(),
          totalDuration: 0,
          status: 'recording'
        };

        this.isListening = true;
        this.lastResultTime = Date.now();
        this.recognition.start();
        
        console.log('Speech recognition started for user:', userName);
        resolve();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  // 音声認識停止
  stop(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      this.stopSilenceTimer();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  // 現在の会話記録を確定
  private finalizeCurrentTranscript(): void {
    if (!this.currentTranscript) return;

    // 未確定のセグメントを確定
    this.currentTranscript.segments.forEach(segment => {
      if (!segment.isFinal && segment.endTime) {
        segment.isFinal = true;
        segment.duration = segment.endTime.getTime() - segment.startTime.getTime();
      }
    });

    this.currentTranscript.endTime = new Date();
    this.currentTranscript.status = 'completed';
    this.currentTranscript.totalDuration = 
      this.currentTranscript.endTime.getTime() - this.currentTranscript.startTime.getTime();

    console.log('Transcript finalized:', this.currentTranscript);
  }

  // 現在の会話記録を取得
  getCurrentTranscript(): ConversationTranscript | null {
    return this.currentTranscript;
  }

  // 最新のテキストを取得
  getLatestText(): string {
    if (!this.currentTranscript || this.currentTranscript.segments.length === 0) {
      return '';
    }

    return this.currentTranscript.segments
      .map(segment => segment.text)
      .join(' ')
      .trim();
  }

  // 確定されたテキストのみを取得
  getFinalText(): string {
    if (!this.currentTranscript || this.currentTranscript.segments.length === 0) {
      return '';
    }

    return this.currentTranscript.segments
      .filter(segment => segment.isFinal)
      .map(segment => segment.text)
      .join(' ')
      .trim();
  }

  // イベントハンドラーの設定
  on<K extends keyof SpeechToTextEvents>(event: K, handler: SpeechToTextEvents[K]): void {
    this.eventHandlers[event] = handler;
  }

  // 状態確認
  isSupported(): boolean {
    return this.isSupported;
  }

  isRunning(): boolean {
    return this.isListening;
  }

  // 設定変更
  setLanguage(language: string): void {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  setSilenceThreshold(milliseconds: number): void {
    this.silenceThreshold = milliseconds;
  }

  // クリーンアップ
  cleanup(): void {
    this.stop();
    this.stopSilenceTimer();
    this.eventHandlers = {};
    
    if (this.currentTranscript) {
      this.currentTranscript.status = 'completed';
    }
    
    this.currentTranscript = null;
    console.log('SpeechToTextService cleaned up');
  }
}

// シングルトンインスタンス
export const speechToTextService = new SpeechToTextService();