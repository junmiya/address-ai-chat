'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/components';
import { Room, MessageInputData } from '@/types';
import { useChatStore } from '../store/chatStore';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { socketService } from '@/lib/socket/socketService';
import { RoomSettingsModal } from './moderation';
import { 
  canAccessRoomSettings, 
  canSendMessage, 
  canLeaveRoom
} from '../utils/permissions';
import { useToast, ToastContainer } from './shared/Toast';
import { EmergencyButton } from '@/features/emergency/components/EmergencyButton';
import { CallStatusDisplay } from '@/features/emergency/components/CallStatusDisplay';
import { StatusToggle } from '@/features/owner-status/components/StatusToggle';
import { useOwnerStatusStore } from '@/features/owner-status/store/statusStore';
import { emergencyCallService } from '@/lib/emergency/emergencyService';
import { defaultAIEngine } from '@/lib/ai/simpleAI';
import { EmergencyCall } from '@/types';
import { SimpleTransceiver } from '@/features/voice-transceiver/components/SimpleTransceiver';
import { LiveConversation } from '@/features/ai-butler/components/LiveConversation';
import { OwnerNotificationPanel } from '@/features/ai-butler/components/OwnerNotificationPanel';
import { OwnerNotification } from '@/lib/ai/butlerAI';

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

  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // 新機能の状態管理
  const [activeEmergencyCall, setActiveEmergencyCall] = useState<EmergencyCall | null>(null);
  const [showOwnerSettings, setShowOwnerSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [butlerEnabled, setButlerEnabled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [ownerNotifications, setOwnerNotifications] = useState<OwnerNotification[]>([]);
  
  const { toasts, hideToast, showSuccess, showError, showWarning } = useToast();
  
  // オーナーステータス管理
  const {
    getOwnerStatus,
    updateOwnerStatus,
    getAIProxySettings,
    updateAIProxySettings,
    updateLastActivity,
    loadFromStorage: loadOwnerStatus
  } = useOwnerStatusStore();

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

  // 初期化
  useEffect(() => {
    loadOwnerStatus();
    
    // 緊急呼び出し状況をチェック
    const activeCall = emergencyCallService.getActiveCall(room.roomId);
    setActiveEmergencyCall(activeCall);
  }, [room.roomId, loadOwnerStatus]);

  // Socket.io接続の初期化（エラーを無視）
  useEffect(() => {
    if (user && isOnline && !isConnected) {
      connectSocket(user).catch((error) => {
        console.warn('Socket.io connection failed, but continuing with basic chat functionality:', error);
        // Socket.io接続エラーは無視して基本的なチャット機能を利用
      });
    }
  }, [user, isOnline, isConnected, connectSocket]);

  // オーナーの場合、最終アクティビティを更新
  useEffect(() => {
    if (user && user.uid === room.ownerUid) {
      updateLastActivity(room.roomId, user.uid);
    }
  }, [user, room, updateLastActivity]);

  // メッセージ送信
  const handleSendMessage = async (messageData: MessageInputData) => {
    if (!user || !canSendMessage(user, room)) {
      console.warn('Permission denied: cannot send message');
      return;
    }
    
    // 通常のメッセージ送信
    await sendMessage(messageData);
    
    // オーナーの最終アクティビティを更新
    if (user.uid === room.ownerUid) {
      updateLastActivity(room.roomId, user.uid);
    }
    
    // AI応答をチェック
    if (user.uid !== room.ownerUid) {
      await handleAIResponse(messageData.text, user);
    }
  };

  // AI応答処理
  const handleAIResponse = async (message: string, sender: User) => {
    try {
      const ownerStatus = getOwnerStatus(room.roomId);
      const aiSettings = getAIProxySettings(room.roomId);
      
      // ルームにオーナーステータスとAI設定を統合
      const enhancedRoom = {
        ...room,
        ownerStatus,
        aiProxySettings: aiSettings
      };
      
      const aiResponse = await defaultAIEngine.processMessage(message, enhancedRoom, sender);
      
      if (aiResponse) {
        // AIメッセージを送信
        const aiMessageData: MessageInputData = {
          text: aiResponse.content,
          roomId: room.roomId,
          senderUid: 'AI'
        };
        
        await sendMessage(aiMessageData);
        
        // 緊急通知が必要な場合
        if (aiResponse.shouldNotifyOwner && aiResponse.isEmergency) {
          showWarning('緊急メッセージが検知されました', 'オーナーに通知を送信しています');
        }
      }
    } catch (error) {
      console.error('AI response error:', error);
    }
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

  // オーナーステータス変更
  const handleOwnerStatusChange = (status: 'online' | 'away' | 'busy' | 'emergency_only', message?: string) => {
    if (!user || user.uid !== room.ownerUid) return;
    
    updateOwnerStatus(room.roomId, status, message);
    showSuccess(`ステータスを「${status}」に変更しました`);
  };

  // 緊急呼び出し処理
  const handleEmergencyCall = (emergencyCall: EmergencyCall) => {
    setActiveEmergencyCall(emergencyCall);
    showWarning('緊急呼び出しが作成されました', 'オーナーに通知を送信しています');
  };

  // 緊急呼び出し応答
  const handleEmergencyResponse = async (response: 'answered' | 'ignored', ownerResponse?: string) => {
    if (!activeEmergencyCall) return;
    
    const success = await emergencyCallService.respondToCall(
      activeEmergencyCall.id,
      response,
      ownerResponse
    );
    
    if (success) {
      setActiveEmergencyCall(null);
      if (response === 'answered') {
        showSuccess('緊急呼び出しに応答しました');
      } else {
        showWarning('緊急呼び出しを無視しました');
      }
    }
  };

  // AI執事からの通知処理
  const handleButlerNotification = (notification: OwnerNotification) => {
    setOwnerNotifications(prev => [notification, ...prev]);
    
    // 緊急度に応じた通知
    if (notification.urgency === 'emergency') {
      showError('緊急通知', `${notification.guestInfo.name}さんから緊急の問い合わせがあります`);
    } else if (notification.urgency === 'high') {
      showWarning('重要通知', `${notification.guestInfo.name}さんから問い合わせがあります`);
    } else {
      showSuccess('新しい問い合わせ', `${notification.guestInfo.name}さんから問い合わせがあります`);
    }
  };

  // 通知の既読処理
  const handleMarkNotificationAsRead = (notificationId: string) => {
    setOwnerNotifications(prev => 
      prev.filter(n => n.conversationId !== notificationId)
    );
    showSuccess('通知を既読にしました');
  };

  // 通知への返信処理
  const handleRespondToNotification = (notificationId: string, response: string) => {
    // 実際の返信処理を実装（メール送信、チャット投稿など）
    console.log(`Responding to ${notificationId}:`, response);
    showSuccess('返信を送信しました');
  };

  // 通知の削除処理
  const handleDismissNotification = (notificationId: string) => {
    setOwnerNotifications(prev => 
      prev.filter(n => n.conversationId !== notificationId)
    );
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
                
                {/* オーナーステータス表示 */}
                {(() => {
                  const ownerStatus = getOwnerStatus(room.roomId);
                  if (!ownerStatus) return null;
                  
                  const statusConfig = {
                    online: { label: '🟢 オンライン', color: 'bg-green-100 text-green-800' },
                    away: { label: '🟡 離席中', color: 'bg-yellow-100 text-yellow-800' },
                    busy: { label: '🔴 取り込み中', color: 'bg-red-100 text-red-800' },
                    emergency_only: { label: '⚠️ 緊急時のみ', color: 'bg-purple-100 text-purple-800' }
                  };
                  
                  const config = statusConfig[ownerStatus.status];
                  return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  );
                })()}
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
                  ? '接続中'
                  : 'オフライン'
                }
              </span>
            </div>
            
            {/* 音声機能トグルボタン */}
            <Button
              variant={voiceEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="text-xs"
            >
              {voiceEnabled ? '🎤 音声ON' : '🎙️ 音声OFF'}
            </Button>

            {/* AI執事機能トグルボタン（ゲストのみ） */}
            {user && user.uid !== room.ownerUid && (
              <Button
                variant={butlerEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setButlerEnabled(!butlerEnabled)}
                className="text-xs"
              >
                {butlerEnabled ? '🤖 執事ON' : '🤖 執事OFF'}
              </Button>
            )}

            {/* 通知パネルボタン（オーナーのみ） */}
            {user && user.uid === room.ownerUid && (
              <Button
                variant={showNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-xs relative"
              >
                📋 通知
                {ownerNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {ownerNotifications.length}
                  </span>
                )}
              </Button>
            )}
            
            {/* オーナー用ステータス設定ボタン */}
            {user && user.uid === room.ownerUid && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOwnerSettings(!showOwnerSettings)}
                className="text-xs"
              >
                📊 ステータス
              </Button>
            )}
            
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

      {/* オーナーステータス設定パネル */}
      {showOwnerSettings && user && user.uid === room.ownerUid && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <StatusToggle
            currentStatus={getOwnerStatus(room.roomId)}
            onStatusChange={handleOwnerStatusChange}
            disabled={false}
          />
        </div>
      )}

      {/* 緊急呼び出し状況表示 */}
      {activeEmergencyCall && (
        <div className="border-t border-gray-200 p-4 bg-orange-50">
          <CallStatusDisplay
            emergencyCall={activeEmergencyCall}
            isOwner={user?.uid === room.ownerUid}
            onRespond={handleEmergencyResponse}
          />
        </div>
      )}

      {/* 音声トランシーバー */}
      {voiceEnabled && (
        <div className="border-t border-gray-200 p-4">
          <SimpleTransceiver 
            roomId={room.roomId} 
            className="mb-4"
          />
        </div>
      )}

      {/* AI執事との会話（ゲストのみ） */}
      {butlerEnabled && user && user.uid !== room.ownerUid && (
        <div className="border-t border-gray-200">
          <LiveConversation
            room={room}
            user={user}
            onComplete={handleButlerNotification}
            onError={(error) => showError('AI執事エラー', error.message)}
            className="h-96"
          />
        </div>
      )}

      {/* オーナー通知パネル（オーナーのみ） */}
      {showNotifications && user && user.uid === room.ownerUid && (
        <div className="border-t border-gray-200">
          <OwnerNotificationPanel
            notifications={ownerNotifications}
            onMarkAsRead={handleMarkNotificationAsRead}
            onRespond={handleRespondToNotification}
            onDismiss={handleDismissNotification}
            className="h-96"
          />
        </div>
      )}

      {/* 緊急ボタン（入室者向け） */}
      {user && user.uid !== room.ownerUid && !activeEmergencyCall && (
        <div className="border-t border-gray-200 p-4">
          <EmergencyButton
            room={room}
            currentUser={user}
            onEmergencyCall={handleEmergencyCall}
            disabled={!isConnected || !isOnline}
            activeCall={activeEmergencyCall}
          />
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