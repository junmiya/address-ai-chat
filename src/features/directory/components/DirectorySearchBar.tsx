'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDirectoryStore } from '../store/directoryStore';

interface DirectorySearchBarProps {
  className?: string;
}

export const DirectorySearchBar: React.FC<DirectorySearchBarProps> = ({
  className = '',
}) => {
  const { searchQuery, setSearchQuery, clearSearch } = useDirectoryStore();
  const [inputValue, setInputValue] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Store の searchQuery が変更されたら input の値も更新
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);
  };

  const handleClear = () => {
    setInputValue('');
    clearSearch();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 検索アイコン */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* 検索入力フィールド */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="名前、コミュニティ、グループで検索..."
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />

      {/* クリアボタン */}
      {inputValue && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            title="検索をクリア"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 検索結果数の表示 */}
      {searchQuery && (
        <div className="mt-1 text-xs text-gray-500">
          <SearchResultsCount />
        </div>
      )}
    </div>
  );
};

// 検索結果数を表示するサブコンポーネント
const SearchResultsCount: React.FC = () => {
  const { filteredUsers, users } = useDirectoryStore();
  
  const totalUsers = users.length;
  const filteredCount = filteredUsers.length;
  
  if (totalUsers === filteredCount) {
    return <span>{totalUsers}名のユーザー</span>;
  }
  
  return (
    <span>
      {filteredCount}名見つかりました (全{totalUsers}名中)
    </span>
  );
};