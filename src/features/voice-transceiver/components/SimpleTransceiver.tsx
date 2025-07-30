'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VoiceParticipant, VoiceError, VoiceMessage } from '@/types/voice-transceiver';
import { simpleVoiceService } from '@/lib/voice/simpleVoiceService';
import { socketService } from '@/lib/socket/socketService';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';

interface SimpleTransceiverProps {
  roomId: string;
  className?: string;
}

export const SimpleTransceiver: React.FC<SimpleTransceiverProps> = ({
  roomId,
  className = ''
}) => {
  const { user } = useMockAuth();
  const [isHolding, setIsHolding] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [receivedMessages, setReceivedMessages] = useState<VoiceMessage[]>([]);
  const [isJoinedVoiceRoom, setIsJoinedVoiceRoom] = useState(false);

  const pttButtonRef = useRef<HTMLButtonElement>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初期化
  useEffect(() => {
    if (!user) return;

    const initializeVoice = async () => {
      try {
        await simpleVoiceService.initialize(user.uid);
        setIsInitialized(true);
        setError(null);

        // イベントハンドラーを設定
        simpleVoiceService.on('onError', handleVoiceError);
        simpleVoiceService.on('onVolumeChange', setVolumeLevel);
        simpleVoiceService.on('onRecordingStart', () => {
          console.log('Recording started');
        });
        simpleVoiceService.on('onRecordingStop', () => {
          console.log('Recording stopped');
        });

      } catch (error) {
        console.error('Failed to initialize voice service:', error);
        setError('マイクの初期化に失敗しました。ブラウザでマイクの許可を確認してください。');
      }
    };

    initializeVoice();

    // クリーンアップ
    return () => {
      simpleVoiceService.cleanup();
    };
  }, [user]);

  // Socket.io メッセージ受信
  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleMessage = (message: any) => {
      try {
        const data = JSON.parse(message.content);
        
        switch (data.type) {
          case 'voice-start-speaking':
            if (data.userId !== user?.uid) {
              setCurrentSpeaker(data.userId);
              updateParticipantSpeakingStatus(data.userId, true);
            }
            break;

          case 'voice-stop-speaking':
            if (data.userId !== user?.uid) {
              setCurrentSpeaker(null);
              updateParticipantSpeakingStatus(data.userId, false);
            }
            break;

          case 'voice-data':
            if (data.userId !== user?.uid) {
              playReceivedAudio(data);
            }
            break;
        }
      } catch (error) {
        console.error('Failed to parse voice message:', error);
      }
    };

    const unsubscribe = socketService.onMessage(handleMessage);
    return unsubscribe;
  }, [user?.uid]);

  // 音声ルーム参加
  const joinVoiceRoom = () => {
    if (!user || !isInitialized || isJoinedVoiceRoom) return;

    // 新しい参加者として自分を追加
    const newParticipant: VoiceParticipant = {
      userId: user.uid,
      userName: user.displayName,
      isSpeaking: false,
      audioLevel: 0,
      joinedAt: new Date()
    };

    setParticipants(prev => {
      const existing = prev.find(p => p.userId === user.uid);
      if (existing) return prev;
      return [...prev, newParticipant];
    });

    setIsJoinedVoiceRoom(true);
    console.log('Joined voice room:', roomId);
  };

  // 音声ルーム退出
  const leaveVoiceRoom = () => {
    if (!user || !isJoinedVoiceRoom) return;

    // 録音中の場合は停止
    if (isHolding) {
      handlePTTEnd();
    }

    // 参加者リストから自分を削除
    setParticipants(prev => prev.filter(p => p.userId !== user.uid));
    setIsJoinedVoiceRoom(false);
    console.log('Left voice room:', roomId);
  };

  // 参加者の発話状態を更新
  const updateParticipantSpeakingStatus = (userId: string, isSpeaking: boolean) => {
    setParticipants(prev => 
      prev.map(p => 
        p.userId === userId 
          ? { ...p, isSpeaking, audioLevel: isSpeaking ? 50 : 0 }
          : p
      )
    );
  };

  // 受信した音声データを再生
  const playReceivedAudio = async (data: any) => {
    try {
      await simpleVoiceService.playAudio(data.audioData);
      
      // 受信メッセージとして記録
      const voiceMessage: VoiceMessage = {
        id: `${data.userId}-${data.timestamp}`,
        roomId,
        senderId: data.userId,
        senderName: participants.find(p => p.userId === data.userId)?.userName || 'Unknown',
        audioData: data.audioData,
        timestamp: new Date(data.timestamp),
        duration: data.duration || 0
      };

      setReceivedMessages(prev => [...prev.slice(-9), voiceMessage]); // 最新10件を保持
    } catch (error) {
      console.error('Failed to play received audio:', error);
    }
  };

  // PTTボタン押下開始
  const handlePTTStart = () => {
    if (!isInitialized || !user || !isJoinedVoiceRoom || isHolding) return;

    setIsHolding(true);
    simpleVoiceService.startRecording(roomId);
    setCurrentSpeaker(user.uid);
    updateParticipantSpeakingStatus(user.uid, true);

    // 最大録音時間でのタイムアウト
    recordingTimeoutRef.current = setTimeout(() => {
      if (isHolding) {
        handlePTTEnd();
      }
    }, 30000); // 30秒
  };

  // PTTボタン離す
  const handlePTTEnd = () => {
    if (!isHolding) return;

    setIsHolding(false);
    simpleVoiceService.stopRecording();
    setCurrentSpeaker(null);
    updateParticipantSpeakingStatus(user?.uid || '', false);

    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  // キーボードショートカット（Spaceキー）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat && isJoinedVoiceRoom) {
        event.preventDefault();
        handlePTTStart();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isJoinedVoiceRoom) {
        event.preventDefault();
        handlePTTEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isJoinedVoiceRoom, isHolding]);

  // エラーハンドリング
  const handleVoiceError = (voiceError: VoiceError) => {
    console.error('Voice error:', voiceError);
    setError(voiceError.message);
  };

  // エラーをクリア
  const clearError = () => {
    setError(null);
  };

  if (!user) {
    return (
      <div className={`voice-transceiver ${className}`}>
        <p className="text-sm text-gray-500">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className={`voice-transceiver bg-gray-50 border rounded-lg p-4 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          🎙️ 音声トランシーバー
        </h3>
        <div className="text-xs text-gray-500">
          {isJoinedVoiceRoom ? '参加中' : '未参加'}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 初期化状態 */}
      {!isInitialized && !error && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">マイクを初期化しています...</p>
        </div>
      )}

      {/* 参加/退出ボタン */}
      {isInitialized && (
        <div className="mb-4">
          {!isJoinedVoiceRoom ? (
            <button
              onClick={joinVoiceRoom}
              className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              🎤 音声ルームに参加
            </button>
          ) : (
            <button
              onClick={leaveVoiceRoom}
              className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              🔇 音声ルームから退出
            </button>
          )}
        </div>
      )}

      {/* 参加者一覧 */}
      {isJoinedVoiceRoom && participants.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">参加者 ({participants.length}名)</h4>
          <div className="space-y-1">
            {participants.map(participant => (
              <div
                key={participant.userId}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  participant.isSpeaking 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  {participant.isSpeaking && <span className="mr-1">🎤</span>}
                  {participant.userName}
                  {participant.userId === user.uid && <span className="ml-1 text-xs">(あなた)</span>}
                </span>
                {participant.isSpeaking && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 現在の話者表示 */}
      {currentSpeaker && currentSpeaker !== user?.uid && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center text-sm text-blue-800">
            <span className="mr-2">🔊</span>
            <span>
              {participants.find(p => p.userId === currentSpeaker)?.userName || 'Someone'} が話しています
            </span>
          </div>
        </div>
      )}

      {/* PTTボタン */}
      {isJoinedVoiceRoom && (
        <div className="mb-4">
          <button
            ref={pttButtonRef}
            className={`w-full py-4 px-4 rounded-lg font-medium transition-all duration-200 ${
              isHolding
                ? 'bg-red-600 text-white shadow-lg scale-105'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
            }`}
            onMouseDown={handlePTTStart}
            onMouseUp={handlePTTEnd}
            onMouseLeave={handlePTTEnd}
            onTouchStart={handlePTTStart}
            onTouchEnd={handlePTTEnd}
            disabled={!isInitialized}
          >
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2">
                {isHolding ? '🔴' : '🎙️'}
              </span>
              <span>
                {isHolding ? '話し中... (離すと終了)' : '長押しで話す'}
              </span>
            </div>
          </button>
          
          {/* 音量レベル表示 */}
          {isHolding && (
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${Math.min(volumeLevel, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* キーボードショートカット説明 */}
      {isJoinedVoiceRoom && (
        <div className="text-xs text-gray-500 text-center">
          💡 Spaceキー長押しでも話せます
        </div>
      )}

      {/* 受信メッセージ履歴 */}
      {receivedMessages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">
            最近の音声メッセージ ({receivedMessages.length}件)
          </h4>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {receivedMessages.slice(-5).map(msg => (
              <div key={msg.id} className="text-xs text-gray-600">
                <span className="font-medium">{msg.senderName}</span>
                <span className="ml-1">
                  {msg.timestamp.toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};