'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components';
import { EmergencyCall, User, Room } from '@/types';
import { emergencyCallService } from '@/lib/emergency/emergencyService';

interface EmergencyButtonProps {
  room: Room;
  currentUser: User;
  onEmergencyCall?: (call: EmergencyCall) => void;
  disabled?: boolean;
  activeCall?: EmergencyCall | null;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  room,
  currentUser,
  onEmergencyCall,
  disabled = false,
  activeCall
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('normal');

  // オーナー自身の場合は表示しない
  if (currentUser.uid === room.ownerUid) {
    return null;
  }

  // 既にアクティブな呼び出しがある場合の表示
  if (activeCall) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-orange-800">
              緊急呼び出し中
            </h4>
            <p className="text-xs text-orange-600 mt-1">
              {activeCall.callerName}さんが{new Date(activeCall.timestamp).toLocaleTimeString('ja-JP')}に呼び出し中です
            </p>
            {activeCall.message && (
              <p className="text-xs text-orange-700 mt-1 italic">
                「{activeCall.message}」
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleEmergencyClick = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await emergencyCallService.createEmergencyCall(
        currentUser,
        room,
        {
          message: emergencyMessage.trim(),
          priority,
          timeout: priority === 'critical' ? 2 * 60 * 1000 : 5 * 60 * 1000 // クリティカルは2分、その他は5分
        }
      );

      if (result.success && result.emergencyCall) {
        onEmergencyCall?.(result.emergencyCall);
        setIsModalOpen(false);
        setEmergencyMessage('');
        setPriority('normal');
        
        // 成功通知
        alert('緊急呼び出しを送信しました。オーナーに通知されます。');
      } else {
        alert(result.error || '緊急呼び出しの送信に失敗しました。');
      }
    } catch (error) {
      console.error('Emergency call failed:', error);
      alert('緊急呼び出しの送信でエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEmergencyMessage('');
    setPriority('normal');
  };

  return (
    <>
      {/* 緊急ボタン */}
      <div className="mb-4">
        <Button
          onClick={handleEmergencyClick}
          disabled={disabled}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg border-2 border-red-700 transition-all duration-200 hover:shadow-xl"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">🚨</span>
            <span>緊急呼び出し</span>
            <span className="text-lg">🚨</span>
          </div>
        </Button>
        <p className="text-xs text-gray-500 text-center mt-1">
          オーナーに緊急で連絡したい場合にクリック
        </p>
      </div>

      {/* 緊急呼び出しモーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* ヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <span>🚨</span>
                  <span>緊急呼び出し</span>
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 内容 */}
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>{room.title}</strong>のオーナーに緊急で連絡します。
                  オーナーにはブラウザ通知とメールで緊急呼び出しが届きます。
                </p>

                {/* 優先度選択 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    緊急度
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'normal', label: '🟡 通常', desc: '5分以内の応答' },
                      { value: 'high', label: '🟠 高', desc: '可能な限り早く' },
                      { value: 'critical', label: '🔴 最高', desc: '即座に応答が必要' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priority"
                          value={option.value}
                          checked={priority === option.value}
                          onChange={(e) => setPriority(e.target.value as typeof priority)}
                          className="mr-2"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm">
                          {option.label} - {option.desc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* メッセージ入力 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    緊急の内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={emergencyMessage}
                    onChange={(e) => setEmergencyMessage(e.target.value)}
                    placeholder="何が起きているか、なぜ緊急なのかを具体的に記入してください"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={4}
                    maxLength={500}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {emergencyMessage.length}/500文字
                    </span>
                    <span className="text-xs text-red-600">
                      具体的な状況を記入してください
                    </span>
                  </div>
                </div>

                {/* 注意事項 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    ⚠️ 注意事項
                  </h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• 本当に緊急の場合のみご利用ください</li>
                    <li>• オーナーがオフラインの場合、応答に時間がかかる可能性があります</li>
                    <li>• 重複した呼び出しは送信できません</li>
                    <li>• 呼び出し履歴は記録されます</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !emergencyMessage.trim()}
                isLoading={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? '送信中...' : '🚨 緊急呼び出し'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};