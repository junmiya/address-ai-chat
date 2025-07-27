'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components';
import { Room, User } from '@/types';
import { NoticeEditor } from './NoticeEditor';
import { ModerationPanel } from './ModerationPanel';

interface RoomSettingsModalProps {
  room: Room;
  participants: User[];
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNotice: (notice: string) => Promise<void>;
  onKickUser: (userId: string, reason?: string) => Promise<void>;
  onCloseRoom: (reason?: string) => Promise<void>;
  onReopenRoom: () => Promise<void>;
  onClearMessages: () => Promise<void>;
}

type TabType = 'notice' | 'moderation';

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  room,
  participants,
  currentUserId,
  isOpen,
  onClose,
  onUpdateNotice,
  onKickUser,
  onCloseRoom,
  onReopenRoom,
  onClearMessages,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('notice');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isOwner = room.ownerUid === currentUserId;

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleNoticeUpdate = async (notice: string) => {
    try {
      setIsLoading(true);
      await onUpdateNotice(notice);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKickUser = async (userId: string, reason?: string) => {
    try {
      setIsLoading(true);
      await onKickUser(userId, reason);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseRoom = async (reason?: string) => {
    try {
      setIsLoading(true);
      await onCloseRoom(reason);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReopenRoom = async () => {
    try {
      setIsLoading(true);
      await onReopenRoom();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMessages = async () => {
    try {
      setIsLoading(true);
      await onClearMessages();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              ルーム設定 - {room.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* ルーム状態表示 */}
          <div className="mt-2 flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              room.visibility === 'public' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {room.visibility === 'public' ? '公開' : '非公開'}
            </span>
            
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {room.chatType === '1v1' ? '1対1' : '1対複数'}
            </span>
            
            {room.isClosed && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                閉鎖中
              </span>
            )}
            
            {room.aiProxyEnabled && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                AI代理応答
              </span>
            )}
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => handleTabClick('notice')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'notice'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              お知らせ・掲示板
            </button>
            
            {isOwner && (
              <button
                onClick={() => handleTabClick('moderation')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'moderation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                モデレーション
              </button>
            )}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'notice' && (
            <NoticeEditor
              room={room}
              onUpdateNotice={handleNoticeUpdate}
              disabled={!isOwner || isLoading}
            />
          )}
          
          {activeTab === 'moderation' && isOwner && (
            <ModerationPanel
              room={room}
              participants={participants}
              onKickUser={handleKickUser}
              onCloseRoom={handleCloseRoom}
              onReopenRoom={handleReopenRoom}
              onClearMessages={handleClearMessages}
              disabled={isLoading}
            />
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};