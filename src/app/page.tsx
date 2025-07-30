'use client';

import Link from 'next/link';
import { Button } from '@/shared/components';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          {/* メインタイトル */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl">
                  Address
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI Chat</span>
                </h1>
                <div className="flex items-center justify-center mt-2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    🤖 AI支援 + 📚 アドレス帳 + 💬 リアルタイムチャット
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              <strong className="text-blue-600">アドレス帳風UI</strong>から簡単にユーザーを見つけて、
              <strong className="text-purple-600">AI代理応答機能</strong>付きの
              <strong className="text-indigo-600">リアルタイムチャット</strong>を開始。
              <br />
              検索・フィルタリング機能で大量のユーザーも瞬時に発見。
            </p>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                ログイン
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                新規登録
              </Button>
            </Link>
          </div>
          
          {/* 主要機能の紹介 */}
          <div className="mt-16 w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              🚀 主要機能
            </h2>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-16">
              {/* アドレス帳UI */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">📚 アドレス帳風UI</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <strong>3階層ディレクトリ</strong>: コミュニティ → グループ → 名前</li>
                  <li>• <strong>高速検索</strong>: 名前・組織・地域で瞬時検索</li>
                  <li>• <strong>並び替え</strong>: 複数条件での並び替え</li>
                  <li>• <strong>ワンクリック開始</strong>: 「1対1」「1対複数」ボタン</li>
                </ul>
              </div>

              {/* AI代理応答 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">🤖 AI代理応答</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <strong>自動応答</strong>: ルームオーナーの代理でAIが応答</li>
                  <li>• <strong>キーワード検知</strong>: 重要な話題を自動検知</li>
                  <li>• <strong>多様なAIモデル</strong>: GPT-4o, Gemini対応</li>
                  <li>• <strong>カスタム設定</strong>: 応答パターンを調整可能</li>
                </ul>
              </div>

              {/* リアルタイム機能 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">⚡ リアルタイム</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <strong>即時配信</strong>: Socket.io による高速メッセージング</li>
                  <li>• <strong>タイピング表示</strong>: 入力状況をリアルタイム表示</li>
                  <li>• <strong>オンライン状態</strong>: ユーザーの接続状況を表示</li>
                  <li>• <strong>既読管理</strong>: メッセージの既読・未読状態</li>
                </ul>
              </div>
            </div>

            {/* 使い方の流れ */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-16">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                💡 使い方の流れ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">1</div>
                  <h4 className="font-semibold text-gray-900 mb-2">ログイン</h4>
                  <p className="text-sm text-gray-600">アカウントでログイン</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">2</div>
                  <h4 className="font-semibold text-gray-900 mb-2">ユーザー検索</h4>
                  <p className="text-sm text-gray-600">アドレス帳から相手を発見</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">3</div>
                  <h4 className="font-semibold text-gray-900 mb-2">チャット開始</h4>
                  <p className="text-sm text-gray-600">「1対1」ボタンでチャット開始</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">4</div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI支援</h4>
                  <p className="text-sm text-gray-600">AIが代理応答・要約を実行</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">🧪 テスト用アカウント</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Email:</strong> test1@example.com | <strong>Password:</strong> password123</p>
                <p><strong>Email:</strong> test2@example.com | <strong>Password:</strong> password123</p>
                <p className="mt-2 text-blue-600">または新規アカウントを作成してテストできます</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Phase 2: 認証システム実装完了 | 
              Next.js 15 + Mock認証 + TypeScript + Zustand
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}