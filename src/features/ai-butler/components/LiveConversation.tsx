'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components';
import { conversationRecorder, ConversationSession } from '@/lib/conversation/conversationRecorder';
import { SpeechRecognitionResult } from '@/lib/speech/speechToTextService';
import { ButlerResponse, OwnerNotification } from '@/lib/ai/butlerAI';
import { User, Room } from '@/types';

interface LiveConversationProps {
  room: Room;
  user: User;
  onComplete?: (notification: OwnerNotification) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface ConversationMessage {
  id: string;
  type: 'user_speech' | 'ai_response' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  isFinal?: boolean;
}

export const LiveConversation: React.FC<LiveConversationProps> = ({
  room,
  user,
  onComplete,
  onError,
  className
}) => {
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // メッセージリストの自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 会話レコーダーのイベント設定
  useEffect(() => {
    conversationRecorder.on('onSessionStart', (newSession) => {
      console.log('Session started:', newSession.id);
      setSession(newSession);
      setError(null);
      
      // システムメッセージを追加
      const systemMessage: ConversationMessage = {
        id: `sys_${Date.now()}`,
        type: 'system',
        content: 'AI執事との会話を開始しました。マイクボタンを押して話しかけてください。',
        timestamp: new Date()
      };
      setMessages([systemMessage]);
    });

    conversationRecorder.on('onSpeechResult', (result: SpeechRecognitionResult) => {
      if (result.isFinal) {
        // 確定されたテキストをメッセージに追加
        const speechMessage: ConversationMessage = {
          id: `speech_${Date.now()}`,
          type: 'user_speech',
          content: result.text,
          timestamp: result.timestamp,
          confidence: result.confidence,
          isFinal: true
        };
        
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.type !== 'user_speech' || msg.isFinal);
          return [...filtered, speechMessage];
        });
        setCurrentSpeech('');
      } else {
        // 中間結果を表示
        setCurrentSpeech(result.text);
      }
    });

    conversationRecorder.on('onAIResponse', (response: ButlerResponse) => {
      const aiMessage: ConversationMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai_response',
        content: response.text,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    });

    conversationRecorder.on('onSessionComplete', (notification: OwnerNotification) => {
      console.log('Session completed:', notification);
      
      const completionMessage: ConversationMessage = {
        id: `complete_${Date.now()}`,
        type: 'system',
        content: `会話が完了しました。オーナーに以下の内容で通知を送信しました：\n${notification.summary}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
      setSession(null);
      onComplete?.(notification);
    });

    conversationRecorder.on('onError', (error: Error) => {
      console.error('Conversation error:', error);
      setError(error.message);
      setIsLoading(false);
      setIsRecording(false);
      onError?.(error);
    });

    return () => {
      // イベントハンドラーをクリア
      conversationRecorder.cleanup();
    };
  }, [onComplete, onError]);

  // 会話開始
  const startConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await conversationRecorder.startSession(room.roomId, user, room, {
        enableVoice: true,
        enableSpeechToText: true,
        enableAIButler: true
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  };

  // 会話終了
  const stopConversation = async () => {
    try {
      await conversationRecorder.stopSession();
      setSession(null);
      setIsRecording(false);
      setCurrentSpeech('');
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // 音声録音開始
  const startRecording = () => {
    if (!session || isRecording) return;
    
    conversationRecorder.startVoiceRecording();
    setIsRecording(true);
    
    // 最大録音時間の設定
    recordingTimeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 30000); // 30秒で自動停止
  };

  // 音声録音停止
  const stopRecording = () => {
    if (!isRecording) return;
    
    conversationRecorder.stopVoiceRecording();
    setIsRecording(false);
    
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  // メッセージの表示
  const renderMessage = (message: ConversationMessage) => {
    const isAI = message.type === 'ai_response';
    const isSystem = message.type === 'system';
    
    return (
      <div
        key={message.id}
        className={`flex ${isAI ? 'justify-start' : isSystem ? 'justify-center' : 'justify-end'} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isSystem
              ? 'bg-gray-100 text-gray-700 text-sm'
              : isAI
              ? 'bg-blue-100 text-blue-900'
              : 'bg-green-100 text-green-900'
          }`}
        >
          {isAI && (
            <div className="flex items-center mb-1">
              <span className="text-xs font-medium text-blue-600">🤖 AI執事</span>
            </div>
          )}
          
          {!isSystem && message.type === 'user_speech' && (
            <div className="flex items-center mb-1">
              <span className="text-xs font-medium text-green-600">🎤 あなた</span>
              {message.confidence && (
                <span className="ml-2 text-xs text-gray-500">
                  ({Math.round(message.confidence * 100)}%)
                </span>
              )}
            </div>
          )}
          
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          <div className="text-xs text-gray-500 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* ヘッダー */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">🤖 AI執事との会話</h3>
            <p className="text-sm text-gray-600">
              {session ? `会話中 - セッション: ${session.id.slice(-8)}` : '待機中'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {session ? (
              <Button
                variant="outline"
                size="sm"
                onClick={stopConversation}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                会話終了
              </Button>
            ) : (
              <Button
                onClick={startConversation}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? '開始中...' : '会話開始'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(renderMessage)}
        
        {/* 現在話している内容（中間結果） */}
        {currentSpeech && (
          <div className="flex justify-end mb-4">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-yellow-100 text-yellow-900 border border-yellow-200">
              <div className="flex items-center mb-1">
                <span className="text-xs font-medium text-yellow-600">🎤 入力中...</span>
              </div>
              <div className="whitespace-pre-wrap opacity-70">{currentSpeech}</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* コントロールパネル */}
      {session && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-center space-x-4">
            {/* 音声録音ボタン */}
            <Button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              onMouseLeave={stopRecording}
              disabled={!session || isLoading}
              className={`px-8 py-4 text-lg font-semibold transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isRecording ? '🔴 録音中' : '🎤 長押しして話す'}
            </Button>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              マイクボタンを長押しして話しかけてください
            </p>
            {isRecording && (
              <p className="text-xs text-red-500 mt-1">
                録音中... 離すと停止します（最大30秒）
              </p>
            )}
          </div>
        </div>
      )}

      {/* 使い方説明 */}
      {!session && !isLoading && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-2">使い方</h4>
          <ol className="text-xs text-gray-600 space-y-1">
            <li>1. 「会話開始」ボタンをクリック</li>
            <li>2. マイクの許可を与える</li>
            <li>3. 「長押しして話す」ボタンを押しながら話す</li>
            <li>4. AI執事が応答し、要件を整理します</li>
            <li>5. 会話終了時にオーナーに通知が送られます</li>
          </ol>
        </div>
      )}
    </div>
  );
};