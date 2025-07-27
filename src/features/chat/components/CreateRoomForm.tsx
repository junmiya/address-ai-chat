'use client';

import React, { useState } from 'react';
import { Button, Input, Select } from '@/shared/components';
import { CreateRoomData } from '@/types';

interface CreateRoomFormProps {
  onRoomCreated?: (roomData: CreateRoomData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const visibilityOptions = [
  { value: 'public', label: '公開' },
  { value: 'private', label: '非公開' },
];

const chatTypeOptions = [
  { value: '1v1', label: '1対1' },
  { value: '1vN', label: '1対複数' },
];

const aiModelOptions = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini（高速・低コスト）' },
  { value: 'gpt-4o', label: 'GPT-4o（高性能）' },
  { value: 'gemini-1.5', label: 'Gemini 1.5（Google）' },
];

export const CreateRoomForm: React.FC<CreateRoomFormProps> = ({
  onRoomCreated,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateRoomData>({
    title: '',
    visibility: 'public',
    chatType: '1v1',
    notice: '',
    aiProxyEnabled: true,
    aiProxyConfig: {
      timeoutSecs: 30,
      keywords: ['緊急', '至急'],
      model: 'gpt-4o-mini',
    },
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateRoomData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof CreateRoomData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name as keyof CreateRoomData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAIConfigChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      aiProxyConfig: {
        ...prev.aiProxyConfig,
        [field]: value,
      },
    }));
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    handleAIConfigChange('keywords', keywords);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateRoomData, string>> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'ルームタイトルを入力してください';
    } else if (formData.title.length < 2) {
      errors.title = 'ルームタイトルは2文字以上で入力してください';
    } else if (formData.title.length > 50) {
      errors.title = 'ルームタイトルは50文字以内で入力してください';
    }
    
    if (formData.notice && formData.notice.length > 500) {
      errors.notice = 'お知らせは500文字以内で入力してください';
    }
    
    if (formData.aiProxyEnabled) {
      if (formData.aiProxyConfig.timeoutSecs < 10 || formData.aiProxyConfig.timeoutSecs > 300) {
        errors.aiProxyConfig = 'タイムアウト時間は10〜300秒の範囲で設定してください';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // 親コンポーネントにルーム作成データを渡す
      if (onRoomCreated) {
        console.log('Room creation data:', formData);
        await onRoomCreated(formData);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            新しいチャットルーム作成
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            AI代理応答機能付きのチャットルームを作成します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="room-form">
          {/* 基本設定 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">基本設定</h3>
            
            <Input
              label="ルームタイトル"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={formErrors.title}
              placeholder="例: プロジェクト相談"
              data-testid="room-title"
              required
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="公開設定"
                value={formData.visibility}
                onChange={(e) => handleSelectChange('visibility', e.target.value)}
                options={visibilityOptions}
                data-testid="room-visibility"
              />
              
              <Select
                label="チャット形式"
                value={formData.chatType}
                onChange={(e) => handleSelectChange('chatType', e.target.value)}
                options={chatTypeOptions}
                data-testid="room-chat-type"
              />
            </div>
            
            <div>
              <label htmlFor="notice" className="block text-sm font-medium text-gray-700">
                お知らせ（オプション）
              </label>
              <textarea
                id="notice"
                name="notice"
                rows={3}
                value={formData.notice}
                onChange={handleChange}
                data-testid="room-notice"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="ルームの説明やルールを入力してください"
              />
              {formErrors.notice && (
                <p className="mt-1 text-sm text-red-600">{formErrors.notice}</p>
              )}
            </div>
          </div>

          {/* AI代理応答設定 */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="aiProxyEnabled"
                name="aiProxyEnabled"
                type="checkbox"
                checked={formData.aiProxyEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, aiProxyEnabled: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="aiProxyEnabled" className="ml-2 block text-lg font-medium text-gray-900">
                AI代理応答機能を有効にする
              </label>
            </div>
            
            {formData.aiProxyEnabled && (
              <div className="pl-6 space-y-4 border-l-2 border-blue-200">
                <Select
                  label="AIモデル"
                  value={formData.aiProxyConfig.model}
                  onChange={(e) => handleAIConfigChange('model', e.target.value)}
                  options={aiModelOptions}
                />
                
                <Input
                  label="タイムアウト時間（秒）"
                  type="number"
                  value={formData.aiProxyConfig.timeoutSecs.toString()}
                  onChange={(e) => handleAIConfigChange('timeoutSecs', parseInt(e.target.value) || 30)}
                  min={10}
                  max={300}
                  placeholder="30"
                />
                
                <Input
                  label="反応キーワード（カンマ区切り）"
                  value={formData.aiProxyConfig.keywords.join(', ')}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  placeholder="緊急, 至急, 重要"
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">AI代理応答について</h4>
                  <p className="text-xs text-blue-700">
                    指定したキーワードが含まれるメッセージに対して、設定した時間内に返信がない場合、
                    AIが代理で応答します。応答は会話の文脈を理解して生成されます。
                  </p>
                </div>
              </div>
            )}
            
            {formErrors.aiProxyConfig && (
              <p className="text-sm text-red-600">{formErrors.aiProxyConfig}</p>
            )}
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                キャンセル
              </Button>
            )}
            
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              data-testid="create-room-submit"
            >
              ルームを作成
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};