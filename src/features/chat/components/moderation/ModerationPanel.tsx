'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components';
import { Room, User } from '@/types';
import { ConfirmationDialog } from './ConfirmationDialog';

interface ModerationPanelProps {
  room: Room;
  participants: User[];
  onKickUser: (userId: string, reason?: string) => Promise<void>;
  onCloseRoom: (reason?: string) => Promise<void>;
  onReopenRoom: () => Promise<void>;
  onClearMessages: () => Promise<void>;
  disabled?: boolean;
}

type ConfirmationAction = 
  | { type: 'kick_user'; userId: string; userName: string }
  | { type: 'close_room' }
  | { type: 'reopen_room' }
  | { type: 'clear_messages' };

export const ModerationPanel: React.FC<ModerationPanelProps> = ({
  room,
  participants,
  onKickUser,
  onCloseRoom,
  onReopenRoom,
  onClearMessages,
  disabled = false,
}) => {
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction | null>(null);
  const [, setActionReason] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // オーナー以外の参加者のみ表示
  const moderatableUsers = participants.filter(user => user.uid !== room.ownerUid);

  const handleKickUserClick = (user: User) => {
    setConfirmationAction({
      type: 'kick_user',
      userId: user.uid,
      userName: user.displayName,
    });
  };

  const handleCloseRoomClick = () => {
    setConfirmationAction({ type: 'close_room' });
  };

  const handleReopenRoomClick = () => {
    setConfirmationAction({ type: 'reopen_room' });
  };

  const handleClearMessagesClick = () => {
    setConfirmationAction({ type: 'clear_messages' });
  };

  const handleConfirm = async (reason?: string) => {
    if (!confirmationAction) return;

    try {
      setIsExecuting(true);

      switch (confirmationAction.type) {
        case 'kick_user':
          await onKickUser(confirmationAction.userId, reason);
          break;
        case 'close_room':
          await onCloseRoom(reason);
          break;
        case 'reopen_room':
          await onReopenRoom();
          break;
        case 'clear_messages':
          await onClearMessages();
          break;
      }

      setConfirmationAction(null);
      setActionReason('');
    } catch (error) {
      console.error('Moderation action failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancel = () => {
    setConfirmationAction(null);
    setActionReason('');
  };

  const getConfirmationConfig = () => {
    if (!confirmationAction) return null;

    switch (confirmationAction.type) {
      case 'kick_user':
        return {
          title: 'ユーザーを退出させる',
          message: `${confirmationAction.userName}さんをこのルームから退出させますか？`,
          detail: 'このユーザーは即座にルームから退出され、再度招待されるまでルームにアクセスできなくなります。',
          confirmText: '退出させる',
          confirmVariant: 'danger' as const,
          requireReason: true,
          reasonPlaceholder: '退出理由を入力してください（任意）',
        };
      case 'close_room':
        return {
          title: 'ルームを閉鎖する',
          message: 'このルームを閉鎖しますか？',
          detail: 'ルームが閉鎖されると、新しいメッセージの投稿ができなくなります。既存のメッセージは閲覧可能です。',
          confirmText: 'ルームを閉鎖',
          confirmVariant: 'danger' as const,
          requireReason: false,
          reasonPlaceholder: '閉鎖理由を入力してください（任意）',
        };
      case 'reopen_room':
        return {
          title: 'ルームを再開する',
          message: 'このルームを再開しますか？',
          detail: 'ルームが再開されると、参加者は再度メッセージを投稿できるようになります。',
          confirmText: 'ルームを再開',
          confirmVariant: 'primary' as const,
          requireReason: false,
        };
      case 'clear_messages':
        return {
          title: 'すべてのメッセージを削除する',
          message: 'このルームのすべてのメッセージを削除しますか？',
          detail: '削除されたメッセージは復元できません。この操作は取り消すことができません。',
          confirmText: 'すべて削除',
          confirmVariant: 'danger' as const,
          requireReason: false,
          reasonPlaceholder: '削除理由を入力してください（任意）',
        };
      default:
        return null;
    }
  };

  const confirmationConfig = getConfirmationConfig();

  return (
    <div className="space-y-6">
      {/* 参加者管理 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          参加者管理
        </h3>
        
        {moderatableUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              管理可能な参加者がいません
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {moderatableUsers.map((user) => (
              <div
                key={user.uid}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {user.displayName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleKickUserClick(user)}
                  disabled={disabled}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  退出させる
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ルーム管理 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ルーム管理
        </h3>
        
        <div className="space-y-3">
          {/* ルーム閉鎖/再開 */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {room.isClosed ? 'ルーム再開' : 'ルーム閉鎖'}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {room.isClosed 
                    ? 'ルームを再開して新しいメッセージの投稿を許可します'
                    : '新しいメッセージの投稿を停止します（閲覧は可能）'
                  }
                </p>
              </div>
              
              <Button
                variant={room.isClosed ? "primary" : "outline"}
                size="sm"
                onClick={room.isClosed ? handleReopenRoomClick : handleCloseRoomClick}
                disabled={disabled}
                className={room.isClosed ? "" : "text-yellow-600 border-yellow-200 hover:bg-yellow-50"}
              >
                {room.isClosed ? 'ルーム再開' : 'ルーム閉鎖'}
              </Button>
            </div>
          </div>

          {/* メッセージ削除 */}
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-red-900">
                  全メッセージ削除
                </h4>
                <p className="text-xs text-red-700 mt-1">
                  ルーム内のすべてのメッセージを削除します（復元不可）
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearMessagesClick}
                disabled={disabled}
                className="text-red-600 border-red-200 hover:bg-red-100"
              >
                すべて削除
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              モデレーション機能について
            </h4>
            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
              <li>• これらの操作は取り消すことができません</li>
              <li>• すべての操作は履歴として記録されます</li>
              <li>• 参加者には操作の通知が送信されます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 確認ダイアログ */}
      {confirmationAction && confirmationConfig && (
        <ConfirmationDialog
          isOpen={true}
          title={confirmationConfig.title}
          message={confirmationConfig.message}
          detail={confirmationConfig.detail}
          confirmText={confirmationConfig.confirmText}
          confirmVariant={confirmationConfig.confirmVariant}
          requireReason={confirmationConfig.requireReason}
          reasonPlaceholder={confirmationConfig.reasonPlaceholder || ''}
          isLoading={isExecuting}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};