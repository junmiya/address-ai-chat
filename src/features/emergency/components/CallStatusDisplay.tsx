'use client';

import React from 'react';
import { EmergencyCall } from '@/types';
import { Button } from '@/shared/components';

interface CallStatusDisplayProps {
  emergencyCall: EmergencyCall;
  isOwner: boolean;
  onRespond?: (response: 'answered' | 'ignored', ownerResponse?: string) => void;
}

export const CallStatusDisplay: React.FC<CallStatusDisplayProps> = ({
  emergencyCall,
  isOwner,
  onRespond
}) => {
  const [ownerResponse, setOwnerResponse] = React.useState('');
  const [showResponseInput, setShowResponseInput] = React.useState(false);

  const getStatusColor = (status: EmergencyCall['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'answered':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'ignored':
        return 'bg-gray-100 border-gray-200 text-gray-800';
      case 'timeout':
        return 'bg-red-100 border-red-200 text-red-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getStatusLabel = (status: EmergencyCall['status']) => {
    switch (status) {
      case 'pending':
        return '🟡 対応待ち';
      case 'answered':
        return '✅ 対応済み';
      case 'ignored':
        return '❌ 無視';
      case 'timeout':
        return '⏰ タイムアウト';
      default:
        return '❓ 不明';
    }
  };

  const handleAnswered = () => {
    if (showResponseInput) {
      onRespond?.('answered', ownerResponse.trim() || undefined);
      setShowResponseInput(false);
      setOwnerResponse('');
    } else {
      setShowResponseInput(true);
    }
  };

  const handleIgnored = () => {
    onRespond?.('ignored');
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP');
  };

  const getElapsedTime = (startTime: Date) => {
    const now = new Date();
    const elapsed = now.getTime() - new Date(startTime).getTime();
    const minutes = Math.floor(elapsed / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒前`;
    } else {
      return `${seconds}秒前`;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(emergencyCall.status)}`}>
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🚨</span>
          <div>
            <h4 className="font-semibold text-sm">
              緊急呼び出し
            </h4>
            <p className="text-xs opacity-75">
              {getStatusLabel(emergencyCall.status)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-75">
            {formatTime(emergencyCall.timestamp)}
          </div>
          {emergencyCall.status === 'pending' && (
            <div className="text-xs font-medium mt-1">
              {getElapsedTime(emergencyCall.timestamp)}
            </div>
          )}
        </div>
      </div>

      {/* 呼び出し者情報 */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs font-medium opacity-75">呼び出し者:</span>
          <span className="text-sm font-medium">{emergencyCall.callerName}</span>
        </div>
        
        {/* メッセージ */}
        <div className="bg-white bg-opacity-50 rounded p-2 text-sm">
          {emergencyCall.message}
        </div>
      </div>

      {/* オーナーの応答（表示のみ） */}
      {emergencyCall.ownerResponse && (
        <div className="mb-3">
          <div className="text-xs font-medium opacity-75 mb-1">オーナーの応答:</div>
          <div className="bg-white bg-opacity-50 rounded p-2 text-sm">
            {emergencyCall.ownerResponse}
          </div>
          {emergencyCall.respondedAt && (
            <div className="text-xs opacity-75 mt-1">
              {formatTime(emergencyCall.respondedAt)}に応答
            </div>
          )}
        </div>
      )}

      {/* オーナー用の応答ボタン */}
      {isOwner && emergencyCall.status === 'pending' && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          {showResponseInput ? (
            <div className="space-y-2">
              <textarea
                value={ownerResponse}
                onChange={(e) => setOwnerResponse(e.target.value)}
                placeholder="応答メッセージ（オプション）"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                rows={2}
                maxLength={200}
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleAnswered}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  ✅ 対応済み
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowResponseInput(false);
                    setOwnerResponse('');
                  }}
                  className="text-xs"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleAnswered}
                className="bg-green-600 hover:bg-green-700 text-white text-xs"
              >
                ✅ 対応する
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleIgnored}
                className="text-xs border-gray-400 text-gray-600 hover:bg-gray-50"
              >
                ❌ 無視
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 呼び出し者向けのステータス表示 */}
      {!isOwner && emergencyCall.callerId === emergencyCall.callerId && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          {emergencyCall.status === 'pending' && (
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <span>オーナーに通知中です。しばらくお待ちください。</span>
            </div>
          )}
          {emergencyCall.status === 'answered' && (
            <div className="text-xs text-green-700">
              ✅ オーナーが対応しました。
            </div>
          )}
          {emergencyCall.status === 'ignored' && (
            <div className="text-xs text-gray-700">
              ❌ 対応されませんでした。別の方法でお試しください。
            </div>
          )}
          {emergencyCall.status === 'timeout' && (
            <div className="text-xs text-red-700">
              ⏰ 応答がありませんでした。オーナーがオフラインの可能性があります。
            </div>
          )}
        </div>
      )}
    </div>
  );
};