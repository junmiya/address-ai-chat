'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/shared/components';
import { RoomListItem, Room } from '@/types';
import { useChatStore } from '../store/chatStore';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';

interface RoomListProps {
  onRoomSelect?: (room: Room) => void;
  onCreateRoom?: () => void;
  'data-testid'?: string;
}

export const RoomList: React.FC<RoomListProps> = ({
  onRoomSelect,
  onCreateRoom,
  'data-testid': testId,
}) => {
  const { user } = useMockAuth();
  const { loadRoomList, joinRoom, joinPublicRoom, isLoading, error } = useChatStore();
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ルームリストを読み込み
  const loadRooms = useCallback(async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      const roomList = await loadRoomList(user.uid);
      setRooms(roomList);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user, loadRoomList]);

  useEffect(() => {
    loadRooms();
  }, [user, loadRooms]);

  const handleRoomClick = async (room: RoomListItem) => {
    try {
      await joinRoom(room.roomId);
      
      // joinRoom後にcurrentRoomが設定されるので、それを取得
      const currentRoom = useChatStore.getState().currentRoom;
      
      if (currentRoom && onRoomSelect) {
        onRoomSelect(currentRoom);
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleJoinPublicRoom = async (room: RoomListItem) => {
    if (!user) return;
    
    try {
      await joinPublicRoom(room.roomId, user.uid);
      // ルームリストを更新
      await loadRooms();
    } catch (error) {
      console.error('Failed to join public room:', error);
    }
  };

  const formatLastMessage = (text: string | undefined, maxLength = 30) => {
    if (!text) return 'メッセージがありません';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const formatLastMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}分前`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}時間前`;
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg" data-testid={testId}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">チャットルーム</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadRooms}
              disabled={refreshing}
              className="text-xs"
            >
              {refreshing ? '更新中...' : '更新'}
            </Button>
            {onCreateRoom && (
              <Button
                size="sm"
                onClick={onCreateRoom}
                className="text-xs"
                data-testid="create-room-button"
              >
                + 新規作成
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">チャットルームがありません</h4>
            <p className="text-sm text-gray-500 mb-4">
              新しいチャットルームを作成して会話を始めましょう
            </p>
            {onCreateRoom && (
              <Button size="sm" onClick={onCreateRoom}>
                最初のルームを作成
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 参加済みルーム */}
            {rooms.filter(room => room.isParticipant).length > 0 && (
              <div data-testid="joined-rooms-section">
                <h4 className="text-sm font-medium text-gray-700 mb-2">参加中のルーム</h4>
                <div className="space-y-2">
                  {rooms.filter(room => room.isParticipant).map((room) => (
                    <div
                      key={room.roomId}
                      onClick={() => handleRoomClick(room)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      data-testid={`joined-room-${room.title}`}
                    >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {room.title}
                      </h4>
                      <div className="flex space-x-1">
                        {/* 公開/非公開アイコン */}
                        {room.visibility === 'private' ? (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        
                        {/* チャット形式アイコン */}
                        {room.chatType === '1v1' ? (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">1v1</span>
                        ) : (
                          <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">1vN</span>
                        )}
                        
                        {/* オーナーバッジ */}
                        {room.isOwner && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Owner</span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {formatLastMessage(room.lastMessageText)}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{room.participantCount}名参加</span>
                      {room.lastMessageAt && (
                        <span>{formatLastMessageTime(room.lastMessageAt)}</span>
                      )}
                    </div>
                  </div>
                  
                  {room.hasUnreadMessages && (
                    <div className="ml-2">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
                  </div>
                </div>
              )}

            {/* 参加可能な公開ルーム */}
            {rooms.filter(room => !room.isParticipant && room.visibility === 'public').length > 0 && (
              <div data-testid="public-rooms-section">
                <h4 className="text-sm font-medium text-gray-700 mb-2">参加可能な公開ルーム</h4>
                <div className="space-y-2">
                  {rooms.filter(room => !room.isParticipant && room.visibility === 'public').map((room) => (
                    <div
                      key={room.roomId}
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                      data-testid={`public-room-${room.title}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {room.title}
                            </h4>
                            <div className="flex space-x-1">
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {room.chatType === '1v1' ? (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">1v1</span>
                              ) : (
                                <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">1vN</span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {formatLastMessage(room.lastMessageText)}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{room.participantCount}名参加</span>
                          </div>
                        </div>
                        
                        <div className="ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinPublicRoom(room);
                            }}
                            className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            data-testid={`join-room-${room.title}`}
                          >
                            参加
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};