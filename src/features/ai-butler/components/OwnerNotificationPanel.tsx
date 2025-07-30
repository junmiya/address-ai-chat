'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components';
import { OwnerNotification } from '@/lib/ai/butlerAI';

interface OwnerNotificationPanelProps {
  notifications: OwnerNotification[];
  onMarkAsRead?: (notificationId: string) => void;
  onRespond?: (notificationId: string, response: string) => void;
  onDismiss?: (notificationId: string) => void;
  className?: string;
}

interface NotificationItemProps {
  notification: OwnerNotification;
  onMarkAsRead: ((id: string) => void) | undefined;
  onRespond: ((id: string, response: string) => void) | undefined;
  onDismiss: ((id: string) => void) | undefined;
}

const UrgencyBadge: React.FC<{ urgency: 'low' | 'medium' | 'high' | 'emergency' }> = ({ urgency }) => {
  const config = {
    emergency: { label: '🚨 緊急', color: 'bg-red-100 text-red-800 border-red-200' },
    high: { label: '🔴 重要', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    medium: { label: '🟡 普通', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    low: { label: '🟢 低', color: 'bg-green-100 text-green-800 border-green-200' }
  };

  const { label, color } = config[urgency];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRespond,
  onDismiss
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${remainingSeconds}秒`;
  };

  const handleRespond = () => {
    if (responseText.trim() && onRespond) {
      onRespond(notification.conversationId, responseText);
      setResponseText('');
      setShowResponseForm(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <UrgencyBadge urgency={notification.urgency} />
            <span className="text-sm text-gray-500">
              {notification.timestamp.toLocaleString()}
            </span>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            {notification.guestInfo.name}さんからの問い合わせ
          </h4>
          
          <p className="text-gray-700">
            {notification.summary}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '詳細を閉じる' : '詳細を見る'}
          </Button>
          
          {onDismiss && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDismiss(notification.conversationId)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* 基本情報 */}
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-500">通話時間:</span>
          <span className="ml-2 font-medium">{formatDuration(notification.callDuration)}</span>
        </div>
        <div>
          <span className="text-gray-500">意図:</span>
          <span className="ml-2 font-medium">{notification.analysis.intent}</span>
        </div>
      </div>

      {/* 詳細情報（展開時） */}
      {isExpanded && (
        <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
          {/* 分析情報 */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">会話分析</h5>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">感情:</span>
                  <span className="ml-2">{notification.analysis.sentiment}</span>
                </div>
                <div>
                  <span className="text-gray-600">信頼度:</span>
                  <span className="ml-2">{Math.round(notification.analysis.confidence * 100)}%</span>
                </div>
              </div>
              
              {notification.analysis.topics.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">トピック:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {notification.analysis.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {notification.analysis.suggestedResponse && (
                <div>
                  <span className="text-gray-600 text-sm">推奨回答:</span>
                  <p className="mt-1 text-sm text-gray-700 italic">
                    「{notification.analysis.suggestedResponse}」
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 会話記録 */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">会話記録</h5>
            <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {notification.transcript}
              </pre>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
            {!showResponseForm ? (
              <>
                <Button
                  onClick={() => setShowResponseForm(true)}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  💬 返信する
                </Button>
                
                {onMarkAsRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.conversationId)}
                  >
                    ✓ 確認済みにする
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // 電話をかける処理（モック）
                    window.open(`tel:${notification.guestInfo.userId}`, '_self');
                  }}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  📞 電話をかける
                </Button>
              </>
            ) : (
              <div className="w-full space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="返信メッセージを入力してください..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleRespond}
                    disabled={!responseText.trim()}
                    size="sm"
                  >
                    送信
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowResponseForm(false);
                      setResponseText('');
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const OwnerNotificationPanel: React.FC<OwnerNotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onRespond,
  onDismiss,
  className
}) => {
  const [filter, setFilter] = useState<'all' | 'emergency' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'urgency'>('timestamp');

  // フィルタリングとソート
  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'all') return true;
      return notification.urgency === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'urgency') {
        const urgencyOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  const urgencyCounts = notifications.reduce((acc, notification) => {
    acc[notification.urgency] = (acc[notification.urgency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`bg-gray-50 ${className}`}>
      {/* ヘッダー */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            📋 オーナー通知パネル
          </h2>
          <div className="text-sm text-gray-600">
            {notifications.length}件の通知
          </div>
        </div>

        {/* フィルターとソート */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">フィルター:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべて ({notifications.length})</option>
              <option value="emergency">🚨 緊急 ({urgencyCounts.emergency || 0})</option>
              <option value="high">🔴 重要 ({urgencyCounts.high || 0})</option>
              <option value="medium">🟡 普通 ({urgencyCounts.medium || 0})</option>
              <option value="low">🟢 低 ({urgencyCounts.low || 0})</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">並び順:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="timestamp">時間順</option>
              <option value="urgency">緊急度順</option>
            </select>
          </div>
        </div>
      </div>

      {/* 通知リスト */}
      <div className="p-4 space-y-4 max-h-screen overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <p className="text-gray-500">
              {filter === 'all' ? '通知はありません' : `${filter}の通知はありません`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.conversationId}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onRespond={onRespond}
              onDismiss={onDismiss}
            />
          ))
        )}
      </div>
    </div>
  );
};