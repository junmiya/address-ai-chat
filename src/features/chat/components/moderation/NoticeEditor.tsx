'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components';
import { Room } from '@/types';

interface NoticeEditorProps {
  room: Room;
  onUpdateNotice: (notice: string) => Promise<void>;
  disabled?: boolean;
}

export const NoticeEditor: React.FC<NoticeEditorProps> = ({
  room,
  onUpdateNotice,
  disabled = false,
}) => {
  const [notice, setNotice] = useState(room.notice || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const maxLength = 500;

  useEffect(() => {
    setNotice(room.notice || '');
    setHasChanges(false);
  }, [room.notice]);

  useEffect(() => {
    setHasChanges(notice !== (room.notice || ''));
  }, [notice, room.notice]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setNotice(room.notice || '');
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateNotice(notice);
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update notice:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setNotice(value);
    }
  };

  const remainingChars = maxLength - notice.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ルームお知らせ・掲示板
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          ルームの目的やルール、重要な情報を参加者に伝えるためのメッセージです。
          チャット画面のヘッダー部分に常時表示されます。
        </p>
      </div>

      {/* プレビュー表示 */}
      {!isEditing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              現在のお知らせ
            </label>
            {!disabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="text-xs"
              >
                編集
              </Button>
            )}
          </div>
          
          <div className="min-h-[100px] p-3 bg-blue-50 border border-blue-200 rounded-md">
            {notice ? (
              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                {notice}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">
                お知らせが設定されていません
              </p>
            )}
          </div>
        </div>
      )}

      {/* 編集モード */}
      {isEditing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              お知らせを編集
            </label>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${
                remainingChars < 50 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {remainingChars}文字残り
              </span>
            </div>
          </div>
          
          <textarea
            value={notice}
            onChange={handleChange}
            placeholder="ルームの目的やルール、重要なお知らせを入力してください..."
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={disabled || isSaving}
          />
          
          {/* プレビュー */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              プレビュー
            </label>
            <div className="min-h-[60px] p-3 bg-blue-50 border border-blue-200 rounded-md">
              {notice ? (
                <p className="text-sm text-blue-800 whitespace-pre-wrap">
                  {notice}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  プレビューが表示されます
                </p>
              )}
            </div>
          </div>
          
          {/* 操作ボタン */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              isLoading={isSaving}
            >
              {hasChanges ? '変更を保存' : '保存'}
            </Button>
          </div>
        </div>
      )}

      {/* ヒント */}
      {!isEditing && (
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            お知らせ活用例
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• ルームの目的や使用方法の説明</li>
            <li>• 参加時のルールやマナーの案内</li>
            <li>• 重要な連絡事項や締切情報</li>
            <li>• AI代理応答の設定や注意事項</li>
          </ul>
        </div>
      )}
    </div>
  );
};