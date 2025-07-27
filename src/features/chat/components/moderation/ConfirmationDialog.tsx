'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  detail?: string;
  confirmText: string;
  confirmVariant?: 'primary' | 'danger';
  requireReason?: boolean;
  reasonPlaceholder?: string;
  isLoading?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  detail,
  confirmText,
  confirmVariant = 'primary',
  requireReason = false,
  reasonPlaceholder = '理由を入力してください',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setIsValid(true);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsValid(!requireReason || reason.trim().length > 0);
  }, [reason, requireReason]);

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(reason.trim() || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && isValid) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onKeyDown={handleKeyDown}
      >
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {confirmVariant === 'danger' ? (
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            ) : (
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-900 mb-2">
            {message}
          </p>
          
          {detail && (
            <p className="text-sm text-gray-600 mb-4">
              {detail}
            </p>
          )}

          {/* 理由入力欄 */}
          {(requireReason || reasonPlaceholder) && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {requireReason ? '理由 *' : '理由（任意）'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 resize-none ${
                  !isValid 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={isLoading}
              />
              {!isValid && (
                <p className="mt-1 text-sm text-red-600">
                  理由の入力が必要です
                </p>
              )}
            </div>
          )}

          {/* 取り消し不可の警告 */}
          {confirmVariant === 'danger' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-xs text-red-700">
                  この操作は取り消すことができません。実行前に内容をよく確認してください。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          
          <Button
            variant={confirmVariant === 'danger' ? 'primary' : 'primary'}
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            isLoading={isLoading}
            className={confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {confirmText}
          </Button>
        </div>

        {/* キーボードショートカットのヒント */}
        <div className="px-6 pb-2">
          <p className="text-xs text-gray-500 text-center">
            {isValid && 'Ctrl+Enter: 実行, '}Escape: キャンセル
          </p>
        </div>
      </div>
    </div>
  );
};