'use client';

import React, { useEffect } from 'react';
import { useDirectoryStore } from '../store/directoryStore';
import { DirectoryUser } from '@/types';
import { useMockAuth } from '@/features/auth/components/MockAuthProvider';
import { highlightSearchText, getMatchedFields } from '../utils/searchHighlight';

// マッチしたフィールドのラベルを取得するヘルパー関数
const getMatchedFieldLabels = (fields: string[]): string[] => {
  const labelMap: Record<string, string> = {
    name: '名前',
    community: 'コミュニティ',
    group: 'グループ',
    organization: '組織',
    region: '地域',
    ageGroup: '年代',
  };
  
  return fields.map(field => labelMap[field] || field);
};

interface UserDirectoryProps {
  onChatStart?: (roomId: string) => void;
}

export const UserDirectory: React.FC<UserDirectoryProps> = ({ onChatStart }) => {
  const { user: currentUser } = useMockAuth();
  const {
    hierarchy,
    searchQuery,
    isLoading,
    error,
    expandedCommunities,
    expandedGroups,
    loadUsers,
    toggleCommunity,
    toggleGroup,
    expandAll,
    collapseAll,
    createChatWithUser,
  } = useDirectoryStore();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleStartChat = async (targetUser: DirectoryUser, chatType: '1v1' | '1vN') => {
    console.log('=== CHAT START DEBUG ===');
    console.log('Current user:', currentUser);
    console.log('Target user:', targetUser);
    console.log('Chat type:', chatType);

    if (!currentUser) {
      console.error('Current user not found');
      alert('ログインユーザーが見つかりません。再度ログインしてください。');
      return;
    }

    try {
      console.log('Creating chat with user...');
      const roomId = await createChatWithUser({
        targetUserUid: targetUser.uid,
        initiatorUid: currentUser.uid,
        chatType,
      });

      console.log('Chat created successfully, roomId:', roomId);
      onChatStart?.(roomId);
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert(`チャット作成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  const communities = Object.keys(hierarchy.communities);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">ユーザーディレクトリ</h2>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              すべて展開
            </button>
            <span className="text-xs text-gray-400">|</span>
            <button
              onClick={collapseAll}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              すべて閉じる
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {communities.length} コミュニティ
        </div>
      </div>

      {/* Directory Tree */}
      <div className="flex-1 overflow-y-auto">
        {communities.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            ユーザーが見つかりません
          </div>
        ) : (
          <div className="p-2">
            {communities.map(community => (
              <CommunitySection
                key={community}
                community={community}
                groups={hierarchy.communities[community].groups}
                isExpanded={expandedCommunities.has(community)}
                expandedGroups={expandedGroups}
                onToggleCommunity={() => toggleCommunity(community)}
                onToggleGroup={(group) => toggleGroup(community, group)}
                onStartChat={handleStartChat}
                currentUserUid={currentUser?.uid}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface CommunitySectionProps {
  community: string;
  groups: { [group: string]: DirectoryUser[] };
  isExpanded: boolean;
  expandedGroups: Set<string>;
  onToggleCommunity: () => void;
  onToggleGroup: (group: string) => void;
  onStartChat: (user: DirectoryUser, chatType: '1v1' | '1vN') => void;
  currentUserUid: string | undefined;
  searchQuery?: string;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({
  community,
  groups,
  isExpanded,
  expandedGroups,
  onToggleCommunity,
  onToggleGroup,
  onStartChat,
  currentUserUid,
  searchQuery = '',
}) => {
  const groupNames = Object.keys(groups);
  const totalUsers = groupNames.reduce((sum, group) => sum + groups[group].length, 0);

  return (
    <div className="mb-2">
      {/* Community Header */}
      <button
        onClick={onToggleCommunity}
        className="w-full flex items-center p-2 text-left bg-white rounded-md border border-gray-200 hover:bg-gray-50"
      >
        <span className="mr-2 text-gray-400">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="font-medium text-gray-900">
          {highlightSearchText(community, searchQuery)}
        </span>
        <span className="ml-auto text-sm text-gray-500">
          {totalUsers}名
        </span>
      </button>

      {/* Groups */}
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {groupNames.map(group => (
            <GroupSection
              key={group}
              group={group}
              users={groups[group]}
              isExpanded={expandedGroups.has(`${community}:${group}`)}
              onToggleGroup={() => onToggleGroup(group)}
              onStartChat={onStartChat}
              currentUserUid={currentUserUid}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface GroupSectionProps {
  group: string;
  users: DirectoryUser[];
  isExpanded: boolean;
  onToggleGroup: () => void;
  onStartChat: (user: DirectoryUser, chatType: '1v1' | '1vN') => void;
  currentUserUid: string | undefined;
  searchQuery?: string;
}

const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  users,
  isExpanded,
  onToggleGroup,
  onStartChat,
  currentUserUid,
  searchQuery = '',
}) => {
  return (
    <div>
      {/* Group Header */}
      <button
        onClick={onToggleGroup}
        className="w-full flex items-center p-2 text-left bg-gray-50 rounded border border-gray-100 hover:bg-gray-100"
      >
        <span className="mr-2 text-gray-400 text-sm">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="text-sm font-medium text-gray-800">
          {highlightSearchText(group, searchQuery)}
        </span>
        <span className="ml-auto text-xs text-gray-500">
          {users.length}名
        </span>
      </button>

      {/* Users */}
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {users.map(user => (
            <UserRow
              key={user.uid}
              user={user}
              onStartChat={onStartChat}
              isCurrentUser={user.uid === currentUserUid}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface UserRowProps {
  user: DirectoryUser;
  onStartChat: (user: DirectoryUser, chatType: '1v1' | '1vN') => void;
  isCurrentUser: boolean;
  searchQuery?: string;
}

const UserRow: React.FC<UserRowProps> = ({ user, onStartChat, isCurrentUser, searchQuery = '' }) => {
  if (isCurrentUser) {
    return (
      <div className="flex items-center p-2 bg-blue-50 rounded border border-blue-100">
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-900">
            {highlightSearchText(user.name, searchQuery, 'bg-blue-300 text-blue-900')}
          </div>
          <div className="text-xs text-blue-600">あなた</div>
        </div>
      </div>
    );
  }

  const matchedFields = getMatchedFields(user, searchQuery);

  return (
    <div className="flex items-center p-2 bg-white rounded border border-gray-100 hover:border-gray-200">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">
          {highlightSearchText(user.name, searchQuery)}
        </div>
        {(user.organization || user.region) && (
          <div className="text-xs text-gray-500">
            {[
              user.organization ? highlightSearchText(user.organization, searchQuery) : null,
              user.region ? highlightSearchText(user.region, searchQuery) : null,
            ].filter(Boolean).map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && ' · '}
                {item}
              </React.Fragment>
            ))}
          </div>
        )}
        
        {/* 検索マッチフィールドの表示 */}
        {searchQuery && matchedFields.length > 0 && (
          <div className="text-xs text-blue-600 mt-1">
            マッチ: {getMatchedFieldLabels(matchedFields).join(', ')}
          </div>
        )}
      </div>
      
      <div className="flex gap-1 ml-2">
        {/* 1対1ボタン */}
        <button
          onClick={() => onStartChat(user, '1v1')}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          title="1対1チャットを開始"
        >
          1対1
        </button>
        
        {/* 1対複数ボタン */}
        <button
          onClick={() => onStartChat(user, '1vN')}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          title="1対複数チャットを開始"
        >
          1対複数
        </button>
      </div>
    </div>
  );
};