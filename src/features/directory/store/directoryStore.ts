import { create } from 'zustand';
import { DirectoryUser, DirectorySortKey, DirectoryHierarchy, ChatInitiationData } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface DirectoryState {
  users: DirectoryUser[];
  filteredUsers: DirectoryUser[];
  hierarchy: DirectoryHierarchy;
  sortKeys: DirectorySortKey[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  expandedCommunities: Set<string>;
  expandedGroups: Set<string>;
}

interface DirectoryActions {
  // Data Management
  loadUsers: () => Promise<void>;
  setSortKeys: (keys: DirectorySortKey[]) => void;
  
  // Search Management
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // UI State Management
  toggleCommunity: (community: string) => void;
  toggleGroup: (community: string, group: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  
  // Chat Initiation
  createChatWithUser: (data: ChatInitiationData) => Promise<string>; // returns roomId
  
  // Internal
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  buildHierarchy: (users: DirectoryUser[]) => DirectoryHierarchy;
  sortUsers: (users: DirectoryUser[], sortKeys: DirectorySortKey[]) => DirectoryUser[];
  filterUsers: (users: DirectoryUser[], query: string) => DirectoryUser[];
}

type DirectoryStore = DirectoryState & DirectoryActions;

// モックデータ（開発用）
const MOCK_DIRECTORY_USERS: DirectoryUser[] = [
  {
    uid: 'mock-user-1',
    name: '山田太郎',
    community: '技術コミュニティ',
    group: 'フロントエンド',
    registeredAt: new Date('2024-01-15') as unknown as Timestamp,
    region: '東京都',
    organization: 'テスト株式会社',
    ageGroup: '30s',
    gender: 'male',
  },
  {
    uid: 'mock-user-2',
    name: '佐藤花子',
    community: 'デザインコミュニティ',
    group: 'UI/UX',
    registeredAt: new Date('2024-01-20') as unknown as Timestamp,
    region: '大阪府',
    organization: 'サンプル会社',
    ageGroup: '20s',
    gender: 'female',
  },
  {
    uid: 'user-3',
    name: '山田次郎',
    community: '技術コミュニティ',
    group: 'バックエンド',
    registeredAt: new Date('2024-01-10') as unknown as Timestamp,
    region: '福岡県',
    organization: 'サーバー株式会社',
    ageGroup: '40s',
    gender: 'male',
  },
  {
    uid: 'user-4',
    name: '鈴木美咲',
    community: 'デザインコミュニティ',
    group: 'UI/UX',
    registeredAt: new Date('2024-01-25') as unknown as Timestamp,
    region: '神奈川県',
    organization: 'クリエイティブ株式会社',
    ageGroup: '30s',
    gender: 'female',
  },
  {
    uid: 'user-5',
    name: '高橋健一',
    community: 'デザインコミュニティ',
    group: 'グラフィック',
    registeredAt: new Date('2024-01-12') as unknown as Timestamp,
    region: '愛知県',
    organization: 'アート株式会社',
    ageGroup: '50s',
    gender: 'male',
  },
  {
    uid: 'user-6',
    name: '渡辺あかり',
    community: 'ビジネスコミュニティ',
    group: 'マーケティング',
    registeredAt: new Date('2024-01-18') as unknown as Timestamp,
    region: '北海道',
    organization: 'プロモーション株式会社',
    ageGroup: '20s',
    gender: 'female',
  },
];

export const useDirectoryStore = create<DirectoryStore>((set, get) => ({
  // Initial State
  users: [],
  filteredUsers: [],
  hierarchy: { communities: {} },
  sortKeys: ['community', 'group', 'name'],
  searchQuery: '',
  isLoading: false,
  error: null,
  expandedCommunities: new Set(),
  expandedGroups: new Set(),

  // Data Management
  loadUsers: async () => {
    const { setLoading, setError, buildHierarchy, sortUsers, filterUsers, sortKeys, searchQuery } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // 実際の実装ではFirestoreから取得
      // const users = await fetchUsersFromFirestore();
      
      // モック実装
      await new Promise(resolve => setTimeout(resolve, 500)); // APIコール模擬
      const sortedUsers = sortUsers(MOCK_DIRECTORY_USERS, sortKeys);
      const filteredUsers = filterUsers(sortedUsers, searchQuery);
      const hierarchy = buildHierarchy(filteredUsers);
      
      set({
        users: sortedUsers,
        filteredUsers,
        hierarchy,
      });
      
      console.log('Directory users loaded:', sortedUsers.length);
      
    } catch (error) {
      console.error('Failed to load directory users:', error);
      setError(error instanceof Error ? error.message : 'ユーザー読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  },

  setSortKeys: (keys: DirectorySortKey[]) => {
    const { users, buildHierarchy, sortUsers, filterUsers, searchQuery } = get();
    const sortedUsers = sortUsers(users, keys);
    const filteredUsers = filterUsers(sortedUsers, searchQuery);
    const hierarchy = buildHierarchy(filteredUsers);
    
    set({
      sortKeys: keys,
      users: sortedUsers,
      filteredUsers,
      hierarchy,
    });
  },

  // Search Management
  setSearchQuery: (query: string) => {
    const { users, buildHierarchy, filterUsers } = get();
    const filteredUsers = filterUsers(users, query);
    const hierarchy = buildHierarchy(filteredUsers);
    
    set({
      searchQuery: query,
      filteredUsers,
      hierarchy,
    });
  },

  clearSearch: () => {
    const { users, buildHierarchy } = get();
    const hierarchy = buildHierarchy(users);
    
    set({
      searchQuery: '',
      filteredUsers: users,
      hierarchy,
    });
  },

  // UI State Management
  toggleCommunity: (community: string) => {
    const { expandedCommunities } = get();
    const newExpanded = new Set(expandedCommunities);
    
    if (newExpanded.has(community)) {
      newExpanded.delete(community);
    } else {
      newExpanded.add(community);
    }
    
    set({ expandedCommunities: newExpanded });
  },

  toggleGroup: (community: string, group: string) => {
    const { expandedGroups } = get();
    const groupKey = `${community}:${group}`;
    const newExpanded = new Set(expandedGroups);
    
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    
    set({ expandedGroups: newExpanded });
  },

  expandAll: () => {
    const { hierarchy } = get();
    const communities = Object.keys(hierarchy.communities);
    const groups = new Set<string>();
    
    communities.forEach(community => {
      Object.keys(hierarchy.communities[community].groups).forEach(group => {
        groups.add(`${community}:${group}`);
      });
    });
    
    set({
      expandedCommunities: new Set(communities),
      expandedGroups: groups,
    });
  },

  collapseAll: () => {
    set({
      expandedCommunities: new Set(),
      expandedGroups: new Set(),
    });
  },

  // Chat Initiation
  createChatWithUser: async (data: ChatInitiationData) => {
    const { setError } = get();
    
    try {
      setError(null);
      
      // chatStoreの関数を動的インポートして呼び出し
      const { useChatStore } = await import('@/features/chat/store/chatStore');
      const { createChatWithUser } = useChatStore.getState();
      
      const room = await createChatWithUser(
        data.targetUserUid,
        data.initiatorUid,
        data.chatType
      );
      
      console.log('Chat created with user:', {
        targetUser: data.targetUserUid,
        initiator: data.initiatorUid,
        chatType: data.chatType,
        roomId: room.roomId,
      });
      
      return room.roomId;
      
    } catch (error) {
      console.error('Failed to create chat with user:', error);
      setError(error instanceof Error ? error.message : 'チャット作成に失敗しました');
      throw error;
    }
  },

  // Internal
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  buildHierarchy: (users: DirectoryUser[]): DirectoryHierarchy => {
    const hierarchy: DirectoryHierarchy = { communities: {} };
    
    users.forEach(user => {
      if (!hierarchy.communities[user.community]) {
        hierarchy.communities[user.community] = { groups: {} };
      }
      
      if (!hierarchy.communities[user.community].groups[user.group]) {
        hierarchy.communities[user.community].groups[user.group] = [];
      }
      
      hierarchy.communities[user.community].groups[user.group].push(user);
    });
    
    return hierarchy;
  },

  sortUsers: (users: DirectoryUser[], sortKeys: DirectorySortKey[]): DirectoryUser[] => {
    return [...users].sort((a, b) => {
      for (const key of sortKeys) {
        let aValue: string | number;
        let bValue: string | number;
        
        if (key === 'registeredAt') {
          aValue = a.registeredAt.toMillis();
          bValue = b.registeredAt.toMillis();
        } else {
          aValue = a[key] || '';
          bValue = b[key] || '';
        }
        
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
      }
      return 0;
    });
  },

  filterUsers: (users: DirectoryUser[], query: string): DirectoryUser[] => {
    if (!query.trim()) {
      return users;
    }
    
    const lowercaseQuery = query.toLowerCase().trim();
    
    return users.filter(user => {
      // 名前での検索
      if (user.name.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // コミュニティでの検索
      if (user.community.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // グループでの検索
      if (user.group.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // 組織での検索
      if (user.organization?.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // 地域での検索
      if (user.region?.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // 年代での検索
      if (user.ageGroup?.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      return false;
    });
  },
}));