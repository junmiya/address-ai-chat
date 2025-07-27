'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/components';
import { Room, MessageInputData } from '@/types';
import { useChatStore } from '../store/chatStore';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { socketService } from '@/lib/socket';
import { RoomSettingsModal } from './moderation';
import { 
  canAccessRoomSettings, 
  canSendMessage, 
  canLeaveRoom
} from '../utils/permissions';
import { useToast, ToastContainer } from './shared/Toast';

interface ChatRoomProps {
  room: Room;
  onLeaveRoom?: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  room,
  onLeaveRoom,
}) => {
  const { user } = useMockAuth();
  const {
    messages,
    participants,
    typingUsers,
    isConnected,
    isLoading,
    error,
    sendMessage,
    leaveRoom,
    startTyping,
    stopTyping,
    connectSocket,
    updateRoomNotice,
    kickUser,
    closeRoom,
    reopenRoom,
    clearAllMessages,
  } = useChatStore();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const { toasts, hideToast, showSuccess, showError, showWarning } = useToast();

  // オンライン状態の監視
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Socket.io接続の初期化
  useEffect(() => {
    if (user && isOnline && !isConnected) {
      connectSocket(user.uid).catch(console.error);
    }
  }, [user, isOnline, isConnected, connectSocket]);

  // メッセージ送信
  const handleSendMessage = async (messageData: MessageInputData) => {
    if (!user || !canSendMessage(user, room)) {
      console.warn('Permission denied: cannot send message');
      // エラーは親コンポーネントで適切に処理される
      return;
    }
    await sendMessage(messageData);
  };

  // タイピング開始
  const handleTypingStart = () => {
    if (user) {
      startTyping(room.roomId, user.uid);
    }
  };

  // タイピング停止
  const handleTypingStop = () => {
    if (user) {
      stopTyping(room.roomId, user.uid);
    }
  };

  // ルーム退出
  const handleLeaveRoom = () => {
    if (!user || !canLeaveRoom(user, room)) {
      console.warn('Permission denied: cannot leave room');
      return;
    }
    leaveRoom();
    onLeaveRoom?.();
  };

  // 設定モーダル
  const handleSettingsClick = () => {
    if (!user || !canAccessRoomSettings(user, room)) {
      console.warn('Permission denied: cannot access room settings');
      return;
    }
    setIsSettingsModalOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsModalOpen(false);
  };

  // モデレーション機能
  const handleUpdateNotice = async (notice: string) => {
    if (!user) return;
    try {
      await updateRoomNotice(room.roomId, notice, user.uid);
      showSuccess('お知らせを更新しました');
    } catch (error) {
      showError('お知らせの更新に失敗しました', error instanceof Error ? error.message : undefined);
    }
  };

  const handleKickUser = async (targetUserId: string, reason?: string) => {
    if (!user) return;
    try {
      await kickUser(room.roomId, targetUserId, reason, user.uid);
      showSuccess('ユーザーを退出させました');
    } catch (error) {
      showError('ユーザーの退出処理に失敗しました', error instanceof Error ? error.message : undefined);
    }
  };

  const handleCloseRoom = async (reason?: string) => {
    if (!user) return;
    try {
      await closeRoom(room.roomId, reason, user.uid);
      showWarning('ルームを閉鎖しました', '新しいメッセージの投稿ができません');
    } catch (error) {
      showError('ルームの閉鎖に失敗しました', error instanceof Error ? error.message : undefined);
    }
  };

  const handleReopenRoom = async () => {
    if (!user) return;
    try {
      await reopenRoom(room.roomId, user.uid);
      showSuccess('ルームを再開しました', 'メッセージの投稿が可能になりました');
    } catch (error) {
      showError('ルームの再開に失敗しました', error instanceof Error ? error.message : undefined);
    }
  };

  const handleClearMessages = async () => {
    if (!user) return;
    try {
      await clearAllMessages(room.roomId, user.uid);
      showWarning('すべてのメッセージを削除しました', 'この操作は取り消せません');
    } catch (error) {
      showError('メッセージの削除に失敗しました', error instanceof Error ? error.message : undefined);
    }
  };

  // 参加者情報の表示
  const getParticipantsList = () => {
    return participants.map(p => p.displayName).join(', ');
  };

  // ルームタイプの表示名
  const getRoomTypeLabel = () => {
    return room.chatType === '1v1' ? '1対1' : '1対複数';
  };

  // 公開/非公開の表示名
  const getVisibilityLabel = () => {
    return room.visibility === 'public' ? '公開' : '非公開';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white" data-testid="chat-room">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900 truncate" data-testid="room-title">
                {room.title}
              </h2>
              
              {/* ステータスバッジ */}
              <div className="flex space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  room.visibility === 'public' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getVisibilityLabel()}
                </span>
                
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getRoomTypeLabel()}
                </span>
                
                {room.aiProxyEnabled && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    AI代理応答
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <span>{participants.length}名参加中</span>
              {participants.length > 0 && (
                <span className="truncate">
                  参加者: {getParticipantsList()}
                </span>
              )}
            </div>
            
            {/* お知らせ */}
            {room.notice && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                {room.notice}
              </div>
            )}
          </div>
          
          {/* ヘッダーボタン */}
          <div className="flex items-center space-x-2">
            {/* 接続状態インジケーター */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected && isOnline 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-600">
                {isConnected && isOnline 
                  ? (socketService.isMockMode() ? 'モック接続中' : '接続中')
                  : 'オフライン'
                }
              </span>
            </div>
            
            {/* 設定ボタン（ルームオーナーのみ） */}
            {user && canAccessRoomSettings(user, room) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSettingsClick}
                className="text-xs"
              >
                設定
              </Button>
            )}
            
            {/* 退出ボタン */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveRoom}
              className="text-xs"
            >
              退出
            </Button>
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
      
      {/* オフライン警告 */}
      {!isOnline && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">
              オフラインです。インターネット接続を確認してください。
            </span>
          </div>
        </div>
      )}
      
      {/* メッセージリスト */}
      <MessageList
        messages={messages}
        participants={participants}
        typingUsers={typingUsers}
        isLoading={isLoading}
      />
      
      {/* ルーム閉鎖警告 */}
      {room.isClosed && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm text-red-800">
              このルームは閉鎖されています。新しいメッセージを送信することはできません。
            </span>
          </div>
        </div>
      )}

      {/* メッセージ入力 */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={!isConnected || !isOnline || !!room.isClosed}
        placeholder={
          room.isClosed
            ? 'ルームが閉鎖されています'
            : !isConnected || !isOnline 
            ? 'オフラインです...' 
            : 'メッセージを入力...'
        }
        roomId={room.roomId}
        senderUid={user.uid}
      />

      {/* ルーム設定モーダル */}
      <RoomSettingsModal
        room={room}
        participants={participants}
        currentUserId={user.uid}
        isOpen={isSettingsModalOpen}
        onClose={handleSettingsClose}
        onUpdateNotice={handleUpdateNotice}
        onKickUser={handleKickUser}
        onCloseRoom={handleCloseRoom}
        onReopenRoom={handleReopenRoom}
        onClearMessages={handleClearMessages}
      />

      {/* トーストメッセージ */}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </div>
  );
};