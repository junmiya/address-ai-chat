import React from 'react';

/**
 * テキスト内の検索クエリに一致する部分をハイライト表示するReactコンポーネントを返す
 */
export const highlightSearchText = (
  text: string,
  query: string,
  highlightClassName: string = 'bg-yellow-200 font-medium'
): React.ReactNode => {
  if (!query.trim()) {
    return text;
  }

  const lowercaseQuery = query.toLowerCase().trim();
  const lowercaseText = text.toLowerCase();
  
  // クエリが含まれていない場合はそのまま返す
  if (!lowercaseText.includes(lowercaseQuery)) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let index = lowercaseText.indexOf(lowercaseQuery);

  while (index !== -1) {
    // マッチする前の部分を追加
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    // マッチした部分をハイライト表示
    const matchedText = text.slice(index, index + lowercaseQuery.length);
    parts.push(
      <span key={`highlight-${index}`} className={highlightClassName}>
        {matchedText}
      </span>
    );

    lastIndex = index + lowercaseQuery.length;
    index = lowercaseText.indexOf(lowercaseQuery, lastIndex);
  }

  // 残りの部分を追加
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};

/**
 * 複数のフィールドから検索にマッチしたフィールド名を取得
 */
export const getMatchedFields = (
  user: {
    name: string;
    community: string;
    group: string;
    organization?: string;
    region?: string;
    ageGroup?: string;
  },
  query: string
): string[] => {
  if (!query.trim()) {
    return [];
  }

  const lowercaseQuery = query.toLowerCase().trim();
  const matchedFields: string[] = [];

  if (user.name.toLowerCase().includes(lowercaseQuery)) {
    matchedFields.push('name');
  }
  
  if (user.community.toLowerCase().includes(lowercaseQuery)) {
    matchedFields.push('community');
  }
  
  if (user.group.toLowerCase().includes(lowercaseQuery)) {
    matchedFields.push('group');
  }
  
  if (user.organization?.toLowerCase().includes(lowercaseQuery)) {
    matchedFields.push('organization');
  }
  
  if (user.region?.toLowerCase().includes(lowercaseQuery)) {
    matchedFields.push('region');
  }
  
  if (user.ageGroup?.toLowerCase().includes(lowercaseQuery)) {
    matchedFields.push('ageGroup');
  }

  return matchedFields;
};