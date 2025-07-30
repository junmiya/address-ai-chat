'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';
import { useChatStore } from '@/features/chat/store/chatStore';
import { UserDirectory, DirectorySortControl, DirectorySearchBar } from '@/features/directory/components';
import { ChatRoom } from '@/features/chat/components';

type ViewMode = 'directory' | 'chat';

export default function ChatPage() {
  const router = useRouter();
  const { user, isInitialized } = useMockAuth();
  const { currentRoom, setCurrentRoom, joinRoom } = useChatStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('directory');

  // 認証チェック
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [user, isInitialized, router]);

  // チャット開始（ディレクトリから）
  const handleChatStart = async (roomId: string) => {
    try {
      await joinRoom(roomId);
      setViewMode('chat');
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  // ルーム退出
  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setViewMode('directory');
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Address AI Chat
              </h1>
              
              {/* ナビゲーション */}
              {viewMode === 'chat' && (
                <nav className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('directory')}
                  >
                    ← ディレクトリ
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
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                ダッシュボード
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'directory' && (
          <>
            {/* 左サイドバー: ユーザーディレクトリ */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
              {/* 検索バー */}
              <div className="p-4 border-b border-gray-200">
                <DirectorySearchBar />
              </div>
              
              {/* 並び替えコントロール */}
              <DirectorySortControl />
              
              {/* ユーザーディレクトリ */}
              <div className="flex-1 overflow-hidden">
                <UserDirectory onChatStart={handleChatStart} />
              </div>
            </div>

            {/* 右側: 使い方ガイド */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    ようこそ、{user.displayName}さん！
                  </h2>
                  <p className="text-gray-600 mb-6">
                    アドレス帳からユーザーを選択してチャットを開始できます。
                    左側のディレクトリからユーザーを探し、「1対1」または「1対複数」ボタンをクリックしてください。
                  </p>
                  
                  {/* 機能説明 */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">3階層ディレクトリ</h3>
                        <p className="text-sm text-gray-600">
                          コミュニティ &gt; グループ &gt; 名前の階層でユーザーを整理
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">チャット開始</h3>
                        <p className="text-sm text-gray-600">
                          1対1または1対複数チャットを簡単に開始
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
                          選択されたユーザーがルームオーナーとなり、AI機能を設定可能
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">💡 使い方のヒント</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• 左側のディレクトリから相手を選択</li>
                      <li>• 「1対1」ボタンで個人チャット開始</li>
                      <li>• 「1対複数」ボタンでグループチャット作成</li>
                      <li>• 選択されたユーザーがルームのオーナーになります</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === 'chat' && currentRoom && (
          <div className="flex-1 flex flex-col">
            <ChatRoom
              room={currentRoom}
              onLeaveRoom={handleLeaveRoom}
            />
          </div>
        )}
      </div>
    </div>
  );
}