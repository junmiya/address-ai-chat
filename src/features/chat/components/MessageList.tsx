'use client';

import React, { useEffect, useRef } from 'react';
import { Message, User } from '@/types';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';

interface MessageListProps {
  messages: Message[];
  participants: User[];
  typingUsers: string[];
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  participants,
  typingUsers,
  isLoading = false,
}) => {
  const { user: currentUser } = useMockAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 参加者情報を取得
  const getParticipantInfo = (uid: string): User | null => {
    return participants.find(p => p.uid === uid) || null;
  };

  // Firebase Timestampを Dateに変換
  const timestampToDate = (timestamp: any): Date => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  };

  // メッセージ時刻をフォーマット
  const formatMessageTime = (timestamp: any) => {
    const date = timestampToDate(timestamp);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // メッセージ日付をフォーマット
  const formatMessageDate = (timestamp: any) => {
    const date = timestampToDate(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    } else {
      return date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // 日付区切りが必要かチェック
  const shouldShowDateDivider = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    
    const currentDate = timestampToDate(currentMessage.createdAt);
    const previousDate = timestampToDate(previousMessage.createdAt);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  // メッセージグループ（同じ送信者の連続メッセージ）をチェック
  const isFirstInGroup = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    return previousMessage.senderUid !== currentMessage.senderUid;
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">メッセージを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">メッセージがありません</h4>
          <p className="text-sm text-gray-500">
            最初のメッセージを送信して会話を始めましょう
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="message-list">
      {messages.filter(message => !message.isDeleted).map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : undefined;
        const isCurrentUser = message.senderUid === currentUser?.uid;
        const participant = getParticipantInfo(message.senderUid);
        const showDateDivider = shouldShowDateDivider(message, previousMessage);
        const isFirstMessage = isFirstInGroup(message, previousMessage);

        return (
          <div key={message.msgId}>
            {/* 日付区切り */}
            {showDateDivider && (
              <div className="flex items-center justify-center my-6">
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-xs text-gray-600 font-medium">
                    {formatMessageDate(message.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {/* メッセージ */}
            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                {/* 送信者名（自分以外の最初のメッセージのみ表示） */}
                {!isCurrentUser && isFirstMessage && (
                  <div className="mb-1">
                    <span className="text-xs text-gray-600 font-medium">
                      {participant?.displayName || 'Unknown User'}
                    </span>
                    {message.isAiGenerated && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        AI代理応答
                      </span>
                    )}
                  </div>
                )}

                {/* メッセージバブル */}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : message.isAiGenerated
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'bg-gray-100 text-gray-900'
                  } ${
                    isFirstMessage
                      ? isCurrentUser
                        ? 'rounded-br-sm'
                        : 'rounded-bl-sm'
                      : ''
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                  
                  {/* 時刻 */}
                  <div className={`mt-1 text-xs ${
                    isCurrentUser 
                      ? 'text-blue-200' 
                      : message.isAiGenerated
                      ? 'text-purple-600'
                      : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.createdAt)}
                    {message.isDeleted && (
                      <span className="ml-2 italic">（削除済み）</span>
                    )}
                  </div>
                </div>
              </div>

              {/* アバター（自分以外の最初のメッセージのみ表示） */}
              {!isCurrentUser && isFirstMessage && (
                <div className="order-1 mr-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {participant?.displayName?.charAt(0) || '?'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* タイピングインジケーター */}
      {typingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="max-w-xs lg:max-w-md">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-600 ml-2">
                  {typingUsers.map(uid => {
                    const participant = getParticipantInfo(uid);
                    return participant?.displayName || 'Someone';
                  }).join(', ')} が入力中...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 自動スクロール用の要素 */}
      <div ref={messagesEndRef} />
    </div>
  );
};