'use client';

import React from 'react';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';
import { Button } from '@/shared/components';

export default function DashboardPage() {
  const { user, signOut, isLoading, isInitialized } = useMockAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
  
  // Show loading state while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated (handled by useAuth hook)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">認証が必要です...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              ダッシュボード
            </h1>
            <Button variant="outline" onClick={handleSignOut}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                ユーザー情報
              </h2>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">表示名</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.displayName}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                
                {user.region && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">地域</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.region}</dd>
                  </div>
                )}
                
                {user.organization && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">組織</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.organization}</dd>
                  </div>
                )}
                
                {user.ageGroup && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">年代</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.ageGroup.replace('age_', '').replace('_plus', '代以上')}
                    </dd>
                  </div>
                )}
                
                {user.gender && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">性別</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.gender === 'male' ? '男性' : 
                       user.gender === 'female' ? '女性' : 
                       user.gender === 'other' ? 'その他' : '回答しない'}
                    </dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">登録日</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.createdAt && new Date(user.createdAt as unknown as Date).toLocaleDateString('ja-JP')}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">最終ログイン</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.lastLoginAt && new Date(user.lastLoginAt as unknown as Date).toLocaleDateString('ja-JP')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  チャット機能
                </h2>
                <Button
                  onClick={() => window.location.href = '/chat'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  チャットを開始
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                AI代理応答機能付きチャットアプリケーションが利用可能です。
              </p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border rounded-lg p-4 text-center hover:border-blue-300 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">1対1公開</h3>
                  <p className="text-sm text-gray-500 mt-1">公開された1対1チャット</p>
                </div>
                
                <div className="border rounded-lg p-4 text-center hover:border-blue-300 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">1対1非公開</h3>
                  <p className="text-sm text-gray-500 mt-1">プライベートな1対1チャット</p>
                </div>
                
                <div className="border rounded-lg p-4 text-center hover:border-blue-300 transition-colors">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">1対複数非公開</h3>
                  <p className="text-sm text-gray-500 mt-1">プライベートグループチャット</p>
                </div>
                
                <div className="border rounded-lg p-4 text-center hover:border-blue-300 transition-colors">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">1対複数公開</h3>
                  <p className="text-sm text-gray-500 mt-1">公開グループチャット</p>
                </div>
              </div>
              
              <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-purple-900">AI代理応答機能</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      指定したキーワード（緊急、至急、重要など）を含むメッセージに一定時間内に返信がない場合、
                      AIが文脈を理解して代理で応答します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}