'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components';
import { MessageInputData } from '@/types';

interface MessageInputProps {
  onSendMessage: (message: MessageInputData) => Promise<void>;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  roomId: string;
  senderUid: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = 'メッセージを入力...',
  roomId,
  senderUid,
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // テキストエリアの高さを自動調整
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // メッセージ変更時の処理
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    adjustTextareaHeight();

    // タイピングインジケーター
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // タイピング停止のタイマーをリセット
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingStop?.();
      }, 1000);
    } else {
      setIsTyping(false);
      onTypingStop?.();
    }
  };

  // メッセージ送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSubmitting || disabled) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // タイピング状態をクリア
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }
      
      const messageData: MessageInputData = {
        text: trimmedMessage,
        roomId,
        senderUid,
      };

      await onSendMessage(messageData);
      
      // 送信成功後にフォームをクリア
      setMessage('');
      adjustTextareaHeight();
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enterキーでの送信（Shift+Enterで改行）
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // テキストエリアの初期化
  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSubmitting}
            rows={1}
            data-testid="message-input"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{
              minHeight: '40px',
              maxHeight: '120px',
            }}
          />
          
          {/* ヘルプテキスト */}
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Shift + Enter で改行</span>
            <span>{message.length}/1000</span>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || isSubmitting || disabled}
          isLoading={isSubmitting}
          className="px-4 py-2 min-w-[80px]"
          data-testid="send-message-button"
        >
          {isSubmitting ? '送信中' : '送信'}
        </Button>
      </form>
      
      {/* AI代理応答の説明 */}
      <div className="mt-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-xs text-purple-800 font-medium">AI代理応答が有効です</p>
            <p className="text-xs text-purple-700 mt-1">
              キーワード「緊急」「至急」「重要」を含むメッセージに30秒以内に返信がない場合、AIが代理で応答します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};