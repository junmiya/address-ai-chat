'use client';

import React, { useState } from 'react';
import { SimpleTransceiver } from '@/features/voice-transceiver/components/SimpleTransceiver';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';
import { Button } from '@/shared/components';

export const VoiceTestPage: React.FC = () => {
  const { user, signIn, isLoading } = useMockAuth();
  const [testRoomId, setTestRoomId] = useState('test-voice-room-001');
  const [email, setEmail] = useState('test1@example.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">音声トランシーバーテスト</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="test1@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="password123"
              />
            </div>
            
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">テストアカウント</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• test1@example.com / password123</li>
              <li>• test2@example.com / password123</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎙️ 音声トランシーバーテスト</h1>
              <p className="text-gray-600 mt-1">
                ログイン中: <span className="font-medium">{user.displayName}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                ルームID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{testRoomId}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                リロード
              </Button>
            </div>
          </div>
        </div>

        {/* 使い方ガイド */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 テスト手順</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">1. 複数タブでテスト</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">1</span>
                  このページを新しいタブで開く（Ctrl+T → このURLをコピペ）
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">2</span>
                  各タブで異なるアカウントでログイン
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">3</span>
                  「音声ルームに参加」ボタンをクリック
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">4</span>
                  マイクの許可を与える
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">5</span>
                  PTTボタンを長押しして話してみる
                </li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">2. 複数デバイスでテスト</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">1</span>
                  スマホでこのページにアクセス
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">2</span>
                  test2@example.com でログイン
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">3</span>
                  音声ルームに参加
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">4</span>
                  PC↔スマホで音声通話を確認
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ 注意事項</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• マイクの許可が必要です（ブラウザに許可してください）</li>
              <li>• Chrome、Firefox、Safari で動作確認済み</li>
              <li>• PTTボタンまたはSpaceキー長押しで話せます</li>
              <li>• 同時に話すと音声が混在します（トランシーバーの特性）</li>
              <li>• ネットワーク環境により音質が変わります</li>
            </ul>
          </div>
        </div>

        {/* メイン音声トランシーバー */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SimpleTransceiver roomId={testRoomId} />
        </div>

        {/* 開発者情報 */}
        <div className="mt-6 bg-gray-800 text-white rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">🔧 開発者情報</h3>
          <div className="text-xs space-y-1 font-mono">
            <div>Room ID: {testRoomId}</div>
            <div>User ID: {user.uid}</div>
            <div>User Name: {user.displayName}</div>
            <div>Browser: {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').pop() : 'Unknown'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};