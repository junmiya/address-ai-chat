'use client';

import React, { useState } from 'react';
import { OwnerStatus } from '@/types';
import { Button } from '@/shared/components';

interface StatusToggleProps {
  currentStatus?: OwnerStatus;
  onStatusChange: (status: OwnerStatus['status'], message?: string) => void;
  disabled?: boolean;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OwnerStatus['status']>(
    currentStatus?.status || 'online'
  );
  const [customMessage, setCustomMessage] = useState(currentStatus?.message || '');
  const [showMessageInput, setShowMessageInput] = useState(false);

  const statusOptions = [
    {
      status: 'online' as const,
      label: '🟢 オンライン',
      description: '通常通り対応可能です',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      status: 'away' as const,
      label: '🟡 離席中',
      description: 'しばらく席を外しています',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      status: 'busy' as const,
      label: '🔴 取り込み中',
      description: '重要な作業中です',
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    {
      status: 'emergency_only' as const,
      label: '⚠️ 緊急時のみ',
      description: '緊急時以外は対応できません',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  ];

  const handleStatusSelect = (status: OwnerStatus['status']) => {
    setSelectedStatus(status);
    if (status === 'online') {
      // オンラインの場合は即座に変更
      onStatusChange(status);
      setShowMessageInput(false);
      setCustomMessage('');
    } else {
      // その他の場合はメッセージ入力を表示
      setShowMessageInput(true);
    }
  };

  const handleSaveStatus = () => {
    onStatusChange(selectedStatus, customMessage.trim() || undefined);
    setShowMessageInput(false);
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus?.status || 'online');
    setCustomMessage(currentStatus?.message || '');
    setShowMessageInput(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 ステータス設定
      </h3>

      {/* 現在のステータス表示 */}
      {currentStatus && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">現在のステータス:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusOptions.find(opt => opt.status === currentStatus.status)?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {statusOptions.find(opt => opt.status === currentStatus.status)?.label || 'Unknown'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              最終更新: {new Date(currentStatus.lastActivity).toLocaleTimeString('ja-JP')}
            </span>
          </div>
          {currentStatus.message && (
            <p className="mt-2 text-sm text-gray-600">
              💬 {currentStatus.message}
            </p>
          )}
        </div>
      )}

      {/* ステータス選択 */}
      <div className="space-y-2 mb-4">
        <label className="block text-sm font-medium text-gray-700">
          ステータスを選択
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.status}
              onClick={() => handleStatusSelect(option.status)}
              disabled={disabled}
              className={`p-3 text-left border rounded-lg transition-colors ${
                selectedStatus === option.status
                  ? option.color + ' border-current'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-600 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* カスタムメッセージ入力 */}
      {showMessageInput && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 メッセージ（オプション）
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="ステータスの詳細を入力してください..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            rows={3}
            maxLength={200}
            disabled={disabled}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {customMessage.length}/200文字
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={disabled}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                onClick={handleSaveStatus}
                disabled={disabled}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const autoAwayTime = new Date();
              autoAwayTime.setMinutes(autoAwayTime.getMinutes() + 30);
              onStatusChange('away', '30分後に戻ります');
            }}
            disabled={disabled}
            className="text-xs"
          >
            🕐 30分離席
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const autoAwayTime = new Date();
              autoAwayTime.setHours(autoAwayTime.getHours() + 1);
              onStatusChange('away', '1時間後に戻ります');
            }}
            disabled={disabled}
            className="text-xs"
          >
            🕑 1時間離席
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange('busy', '会議中')}
            disabled={disabled}
            className="text-xs"
          >
            📞 会議中
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange('busy', '集中作業中')}
            disabled={disabled}
            className="text-xs"
          >
            💻 集中作業中
          </Button>
        </div>
      </div>
    </div>
  );
};