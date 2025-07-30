'use client';

// 音声トランシーバー機能の型定義

export interface VoiceTransceiver {
  roomId: string;
  participants: VoiceParticipant[];
  isRecording: boolean;
  currentSpeaker?: string;
  isEnabled: boolean;
}

export interface VoiceParticipant {
  userId: string;
  userName: string;
  isSpeaking: boolean;
  audioLevel: number;
  joinedAt: Date;
}

export interface VoiceMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  audioData: string; // Base64エンコード済み音声データ
  timestamp: Date;
  duration: number; // ミリ秒
}

export interface VoiceSettings {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  recordingInterval: number; // ミリ秒
  maxRecordingDuration: number; // ミリ秒
}

// Socket.io用イベント型定義
export interface VoiceSocketEvents {
  // ルーム参加・退出
  'join-voice-room': { roomId: string; userId: string; userName: string };
  'leave-voice-room': { roomId: string; userId: string };
  'user-joined-voice': { userId: string; userName: string };
  'user-left-voice': { userId: string };

  // 音声送信・受信
  'voice-start-speaking': { roomId: string; userId: string; userName: string };
  'voice-stop-speaking': { roomId: string; userId: string };
  'voice-data': { roomId: string; userId: string; audioData: string; timestamp: number };
  'receive-voice-data': { userId: string; userName: string; audioData: string; timestamp: number };

  // 参加者状態通知
  'user-started-speaking': { userId: string; userName: string };
  'user-stopped-speaking': { userId: string };
  'voice-participants-update': { participants: VoiceParticipant[] };
}

// 音声品質測定用
export interface VoiceQualityMetrics {
  latency: number; // レイテンシ（ミリ秒）
  packetLoss: number; // パケットロス率（0-1）
  audioLevel: number; // 音声レベル（0-100）
  timestamp: Date;
}

// エラー処理用
export interface VoiceError {
  type: 'microphone_access' | 'recording_failed' | 'playback_failed' | 'network_error';
  message: string;
  timestamp: Date;
}