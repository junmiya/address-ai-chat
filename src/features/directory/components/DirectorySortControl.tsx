'use client';

import React from 'react';
import { DirectorySortKey } from '@/types';
import { useDirectoryStore } from '../store/directoryStore';

const SORT_LABELS: Record<DirectorySortKey, string> = {
  community: 'コミュニティ',
  group: 'グループ',
  name: '名前',
  registeredAt: '登録日',
};

export const DirectorySortControl: React.FC = () => {
  const { sortKeys, setSortKeys } = useDirectoryStore();

  const availableKeys: DirectorySortKey[] = ['community', 'group', 'name', 'registeredAt'];

  const handleSortKeyChange = (index: number, newKey: DirectorySortKey) => {
    const newSortKeys = [...sortKeys];
    newSortKeys[index] = newKey;
    setSortKeys(newSortKeys);
  };

  const addSortKey = () => {
    const unusedKeys = availableKeys.filter(key => !sortKeys.includes(key));
    if (unusedKeys.length > 0) {
      setSortKeys([...sortKeys, unusedKeys[0]]);
    }
  };

  const removeSortKey = (index: number) => {
    if (sortKeys.length > 1) {
      const newSortKeys = sortKeys.filter((_, i) => i !== index);
      setSortKeys(newSortKeys);
    }
  };

  const resetToDefault = () => {
    setSortKeys(['community', 'group', 'name']);
  };

  return (
    <div className="p-3 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">並び替え</h3>
        <button
          onClick={resetToDefault}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          デフォルトに戻す
        </button>
      </div>

      <div className="space-y-2">
        {sortKeys.map((key, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-4">
              {index + 1}.
            </span>
            
            <select
              value={key}
              onChange={(e) => handleSortKeyChange(index, e.target.value as DirectorySortKey)}
              className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {availableKeys.map(availableKey => (
                <option 
                  key={availableKey} 
                  value={availableKey}
                  disabled={sortKeys.includes(availableKey) && availableKey !== key}
                >
                  {SORT_LABELS[availableKey]}
                </option>
              ))}
            </select>

            {sortKeys.length > 1 && (
              <button
                onClick={() => removeSortKey(index)}
                className="text-red-500 hover:text-red-700 text-xs w-5"
                title="削除"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {sortKeys.length < availableKeys.length && (
          <button
            onClick={addSortKey}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>+</span>
            <span>並び替えキーを追加</span>
          </button>
        )}
      </div>

      {/* Current Sort Display */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-600">
          現在の並び順: {sortKeys.map(key => SORT_LABELS[key]).join(' → ')}
        </div>
      </div>
    </div>
  );
};