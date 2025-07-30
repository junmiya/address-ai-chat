'use client';

import { VoiceSettings, VoiceError, VoiceQualityMetrics } from '@/types/voice-transceiver';
import { socketService } from '@/lib/socket/socketService';

export interface VoiceServiceEvents {
  onAudioData: (audioData: string) => void;
  onError: (error: VoiceError) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  onVolumeChange: (volume: number) => void;
}

export class SimpleVoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private isInitialized = false;
  private currentRoomId: string | null = null;
  private currentUserId: string | null = null;
  private audioContext: AudioContext | null = null;
  private volumeAnalyzer: AnalyserNode | null = null;
  private volumeDataArray: Uint8Array | null = null;
  private volumeMonitorInterval: NodeJS.Timeout | null = null;

  // イベントハンドラー
  private eventHandlers: Partial<VoiceServiceEvents> = {};

  // デフォルト設定
  private settings: VoiceSettings = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    recordingInterval: 100, // 100ms間隔で送信
    maxRecordingDuration: 30000, // 最大30秒
  };

  constructor() {
    this.setupAudioContext();
  }

  // 初期化
  async initialize(userId: string): Promise<void> {
    try {
      this.currentUserId = userId;
      console.log('Initializing voice service for user:', userId);

      // マイクアクセス許可を取得
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: this.settings.echoCancellation,
          noiseSuppression: this.settings.noiseSuppression,
          autoGainControl: this.settings.autoGainControl,
          sampleRate: 16000, // 音声品質を適度に保ちつつファイルサイズを抑制
          channelCount: 1, // モノラル
        }
      });

      // MediaRecorderを設定
      this.setupMediaRecorder();
      
      // 音量モニタリングを設定
      this.setupVolumeMonitoring();

      this.isInitialized = true;
      console.log('Voice service initialized successfully');

    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      const voiceError: VoiceError = {
        type: 'microphone_access',
        message: error instanceof Error ? error.message : 'マイクへのアクセスに失敗しました',
        timestamp: new Date()
      };
      this.notifyError(voiceError);
      throw error;
    }
  }

  // AudioContextのセットアップ
  private setupAudioContext(): void {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  // MediaRecorderのセットアップ
  private setupMediaRecorder(): void {
    if (!this.audioStream) return;

    try {
      // WebMを優先、対応していない場合はMP4を使用
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4';

      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType,
        audioBitsPerSecond: 16000 // 音声品質を調整
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processRecordedAudio();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        const voiceError: VoiceError = {
          type: 'recording_failed',
          message: '録音中にエラーが発生しました',
          timestamp: new Date()
        };
        this.notifyError(voiceError);
      };

    } catch (error) {
      console.error('Failed to setup MediaRecorder:', error);
      throw error;
    }
  }

  // 音量モニタリングのセットアップ
  private setupVolumeMonitoring(): void {
    if (!this.audioContext || !this.audioStream) return;

    try {
      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      this.volumeAnalyzer = this.audioContext.createAnalyser();
      this.volumeAnalyzer.fftSize = 256;
      this.volumeDataArray = new Uint8Array(this.volumeAnalyzer.frequencyBinCount);
      
      source.connect(this.volumeAnalyzer);

    } catch (error) {
      console.warn('Failed to setup volume monitoring:', error);
    }
  }

  // 音量レベルを取得
  getVolumeLevel(): number {
    if (!this.volumeAnalyzer || !this.volumeDataArray) return 0;

    this.volumeAnalyzer.getByteFrequencyData(this.volumeDataArray);
    
    let sum = 0;
    for (let i = 0; i < this.volumeDataArray.length; i++) {
      sum += this.volumeDataArray[i];
    }
    
    return Math.round((sum / this.volumeDataArray.length / 255) * 100);
  }

  // 録音開始（PTTボタン押下時）
  startRecording(roomId: string): void {
    if (!this.isInitialized || !this.mediaRecorder || this.isRecording) {
      console.warn('Cannot start recording: not initialized or already recording');
      return;
    }

    try {
      this.currentRoomId = roomId;
      this.audioChunks = [];
      this.mediaRecorder.start(this.settings.recordingInterval);
      this.isRecording = true;

      // 音量モニタリング開始
      this.startVolumeMonitoring();

      // Socket.ioで話し始めを通知
      if (socketService.isConnected()) {
        socketService.sendSocketMessage(roomId, JSON.stringify({
          type: 'voice-start-speaking',
          userId: this.currentUserId,
          timestamp: Date.now()
        }));
      }

      this.eventHandlers.onRecordingStart?.();
      console.log('Recording started for room:', roomId);

      // 最大録音時間での自動停止
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, this.settings.maxRecordingDuration);

    } catch (error) {
      console.error('Failed to start recording:', error);
      const voiceError: VoiceError = {
        type: 'recording_failed',
        message: '録音の開始に失敗しました',
        timestamp: new Date()
      };
      this.notifyError(voiceError);
    }
  }

  // 録音停止（PTTボタン離す時）
  stopRecording(): void {
    if (!this.isRecording || !this.mediaRecorder) {
      return;
    }

    try {
      this.mediaRecorder.stop();
      this.isRecording = false;

      // 音量モニタリング停止
      this.stopVolumeMonitoring();

      // Socket.ioで話し終わりを通知
      if (socketService.isConnected() && this.currentRoomId) {
        socketService.sendSocketMessage(this.currentRoomId, JSON.stringify({
          type: 'voice-stop-speaking',
          userId: this.currentUserId,
          timestamp: Date.now()
        }));
      }

      this.eventHandlers.onRecordingStop?.();
      console.log('Recording stopped');

    } catch (error) {
      console.error('Failed to stop recording:', error);
      const voiceError: VoiceError = {
        type: 'recording_failed',
        message: '録音の停止に失敗しました',
        timestamp: new Date()
      };
      this.notifyError(voiceError);
    }
  }

  // 録音データの処理
  private async processRecordedAudio(): Promise<void> {
    if (this.audioChunks.length === 0) return;

    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const audioData = await this.blobToBase64(audioBlob);

      // Socket.ioで音声データを送信
      if (socketService.isConnected() && this.currentRoomId) {
        socketService.sendSocketMessage(this.currentRoomId, JSON.stringify({
          type: 'voice-data',
          userId: this.currentUserId,
          audioData,
          timestamp: Date.now(),
          duration: this.audioChunks.length * this.settings.recordingInterval
        }));
      }

      // イベントハンドラーに通知
      this.eventHandlers.onAudioData?.(audioData);

      // チャンクをクリア
      this.audioChunks = [];

    } catch (error) {
      console.error('Failed to process recorded audio:', error);
      const voiceError: VoiceError = {
        type: 'recording_failed',
        message: '録音データの処理に失敗しました',
        timestamp: new Date()
      };
      this.notifyError(voiceError);
    }
  }

  // 音声データの再生
  async playAudio(audioData: string): Promise<void> {
    try {
      const audioBlob = this.base64ToBlob(audioData);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        const voiceError: VoiceError = {
          type: 'playback_failed',
          message: '音声の再生に失敗しました',
          timestamp: new Date()
        };
        this.notifyError(voiceError);
      };

      await audio.play();

    } catch (error) {
      console.error('Failed to play audio:', error);
      const voiceError: VoiceError = {
        type: 'playback_failed',
        message: '音声の再生に失敗しました',
        timestamp: new Date()
      };
      this.notifyError(voiceError);
    }
  }

  // 音量モニタリング開始
  private startVolumeMonitoring(): void {
    if (this.volumeMonitorInterval) return;

    this.volumeMonitorInterval = setInterval(() => {
      const volume = this.getVolumeLevel();
      this.eventHandlers.onVolumeChange?.(volume);
    }, 100);
  }

  // 音量モニタリング停止
  private stopVolumeMonitoring(): void {
    if (this.volumeMonitorInterval) {
      clearInterval(this.volumeMonitorInterval);
      this.volumeMonitorInterval = null;
    }
  }

  // Base64エンコード
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Base64デコード
  private base64ToBlob(base64Data: string): Blob {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'audio/webm' });
  }

  // イベントハンドラーの設定
  on<K extends keyof VoiceServiceEvents>(event: K, handler: VoiceServiceEvents[K]): void {
    this.eventHandlers[event] = handler;
  }

  // エラーの通知
  private notifyError(error: VoiceError): void {
    this.eventHandlers.onError?.(error);
  }

  // 品質メトリクス取得
  getQualityMetrics(): VoiceQualityMetrics {
    return {
      latency: 0, // 実装時に測定
      packetLoss: 0, // 実装時に測定
      audioLevel: this.getVolumeLevel(),
      timestamp: new Date()
    };
  }

  // クリーンアップ
  cleanup(): void {
    this.stopRecording();
    this.stopVolumeMonitoring();

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaRecorder = null;
    this.isInitialized = false;
    this.eventHandlers = {};

    console.log('Voice service cleaned up');
  }

  // 状態確認
  isReady(): boolean {
    return this.isInitialized && !!this.mediaRecorder;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

// シングルトンインスタンス
export const simpleVoiceService = new SimpleVoiceService();