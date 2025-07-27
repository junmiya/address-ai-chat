'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';
import { useChatStore } from '@/features/chat/store/chatStore';
import { 
  RoomList, 
  CreateRoomForm, 
  ChatRoom 
} from '@/features/chat/components';
import { Room, CreateRoomData } from '@/types';

type ViewMode = 'rooms' | 'create' | 'chat';

export default function ChatPage() {
  const router = useRouter();
  const { user, isInitialized } = useMockAuth();
  const { createRoom, currentRoom, setCurrentRoom } = useChatStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('rooms');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [user, isInitialized, router]);

  // ルーム作成
  const handleCreateRoom = async (roomData: CreateRoomData): Promise<void> => {
    if (!user) return;
    
    try {
      setIsCreatingRoom(true);
      const newRoom = await createRoom(roomData, user.uid);
      setCurrentRoom(newRoom);
      setViewMode('chat');
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error; // エラーを再投げしてCreateRoomFormでキャッチできるようにする
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // ルーム選択
  const handleRoomSelect = (room: Room) => {
    setCurrentRoom(room);
    setViewMode('chat');
  };

  // ルーム退出
  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setViewMode('rooms');
  };

  // 認証確認中の表示
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 未ログインの場合は何も表示しない（useEffectでリダイレクト）
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">
                AI代理応答チャット
              </h1>
              
              {/* ナビゲーション */}
              {viewMode !== 'rooms' && (
                <nav className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('rooms')}
                  >
                    ← ルーム一覧
                  </Button>
                </nav>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.displayName}
              </span>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                ダッシュボード
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {viewMode === 'rooms' && (
            <div className="space-y-6">
              {/* ウェルカムメッセージ */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  ようこそ、{user.displayName}さん！
                </h2>
                <p className="text-gray-600 mb-4">
                  AI代理応答機能付きチャットアプリケーションです。
                  新しいルームを作成するか、既存のルームに参加して会話を始めましょう。
                </p>
                
                {/* 機能説明 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">リアルタイムチャット</h3>
                      <p className="text-sm text-gray-600">
                        Socket.ioによる高速なリアルタイム通信
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">AI代理応答</h3>
                      <p className="text-sm text-gray-600">
                        キーワード検出による自動応答・要約機能
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ルーム一覧 */}
              <RoomList
                onRoomSelect={handleRoomSelect}
                onCreateRoom={() => setViewMode('create')}
                data-testid="room-list"
              />
            </div>
          )}

          {viewMode === 'create' && (
            <CreateRoomForm
              onRoomCreated={handleCreateRoom}
              onCancel={() => setViewMode('rooms')}
              isLoading={isCreatingRoom}
            />
          )}

          {viewMode === 'chat' && currentRoom && (
            <div className="bg-white shadow rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
              <ChatRoom
                room={currentRoom}
                onLeaveRoom={handleLeaveRoom}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}