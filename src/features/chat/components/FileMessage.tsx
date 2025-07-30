'use client';

import React, { useState } from 'react';
import { firebaseStorageService } from '@/lib/firebase/storage';

interface FileData {
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface FileMessageProps {
  fileData: FileData;
  type: 'image' | 'file';
  isOwn?: boolean;
}

export const FileMessage: React.FC<FileMessageProps> = ({ 
  fileData, 
  type, 
  isOwn = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    if (fileData.url.startsWith('data:')) {
      // Base64データの場合（モック）
      const link = document.createElement('a');
      link.href = fileData.url;
      link.download = fileData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 実際のURLの場合
      window.open(fileData.url, '_blank');
    }
  };

  const formatFileSize = (bytes: number): string => {
    return firebaseStorageService.formatFileSize(bytes);
  };

  const getFileIcon = (fileType: string): string => {
    return firebaseStorageService.getFileIcon(fileType);
  };

  if (type === 'image') {
    return (
      <div className="max-w-sm">
        {!imageError ? (
          <div className="relative">
            <img
              src={fileData.url}
              alt={fileData.filename}
              className={`rounded-lg border max-w-full h-auto cursor-pointer transition-opacity ${
                imageLoaded ? 'opacity-100' : 'opacity-50'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              onClick={handleDownload}
              style={{ maxHeight: '300px' }}
            />
            
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {/* ファイル情報オーバーレイ */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
              <div className="text-xs truncate">
                {fileData.filename}
              </div>
              <div className="text-xs text-gray-300">
                {formatFileSize(fileData.size)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
            <div className="text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              画像を読み込めませんでした
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {fileData.filename} ({formatFileSize(fileData.size)})
            </div>
            <button
              onClick={handleDownload}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              ダウンロード
            </button>
          </div>
        )}
      </div>
    );
  }

  // ファイルメッセージ
  return (
    <div 
      className={`border rounded-lg p-3 max-w-sm cursor-pointer hover:bg-gray-50 transition-colors ${
        isOwn ? 'border-blue-200' : 'border-gray-200'
      }`}
      onClick={handleDownload}
    >
      <div className="flex items-center space-x-3">
        {/* ファイルアイコン */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
            {getFileIcon(fileData.type)}
          </div>
        </div>
        
        {/* ファイル情報 */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {fileData.filename}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(fileData.size)}
          </div>
          <div className="text-xs text-gray-400">
            {fileData.type}
          </div>
        </div>
        
        {/* ダウンロードアイコン */}
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};