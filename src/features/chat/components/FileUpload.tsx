'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/shared/components';
import { firebaseStorageService, FileUploadProgress, FileUploadResult } from '@/lib/firebase/storage';

interface FileUploadProps {
  roomId: string;
  userId: string;
  onFileUploaded: (fileData: FileUploadResult, type: 'image' | 'file') => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  roomId,
  userId,
  onFileUploaded,
  disabled = false
}) => {
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress | null>(null);
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;

    try {
      // プレビュー表示（画像の場合）
      if (firebaseStorageService.isImageFile(file)) {
        const previewUrl = await firebaseStorageService.getFilePreview(file);
        setPreview(previewUrl);
      }

      // ファイルアップロード
      const result = await firebaseStorageService.uploadFile(
        file,
        roomId,
        userId,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // アップロード完了
      const messageType = firebaseStorageService.isImageFile(file) ? 'image' : 'file';
      onFileUploaded(result, messageType);

      // 状態リセット
      setUploadProgress(null);
      setPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('File upload failed:', error);
      setUploadProgress(null);
      setPreview('');
    }
  };

  const handleCancel = () => {
    setUploadProgress(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative">
      {/* ファイル選択ボタン */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={triggerFileInput}
        disabled={disabled || uploadProgress?.isUploading}
        className="p-2"
        title="ファイルを添付"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
          />
        </svg>
      </Button>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.txt,.doc,.docx"
        disabled={disabled}
      />

      {/* アップロード進行状況 */}
      {uploadProgress?.isUploading && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg min-w-[250px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              アップロード中...
            </span>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
              title="キャンセル"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
          
          <div className="text-xs text-gray-500">
            {uploadProgress.progress}% 完了
          </div>

          {/* プレビュー（画像の場合） */}
          {preview && (
            <div className="mt-2">
              <img 
                src={preview} 
                alt="プレビュー" 
                className="max-w-full h-20 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}

      {/* エラー表示 */}
      {uploadProgress?.error && (
        <div className="absolute bottom-full left-0 mb-2 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg min-w-[250px]">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800">
              {uploadProgress.error}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};