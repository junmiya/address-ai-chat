import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  ChatState, 
  Room, 
  Message, 
  User, 
  CreateRoomData, 
  MessageInputData,
  RoomListItem,
  ModerationAction
} from '@/types';
import { socketService } from '@/lib/socket';
import { Timestamp } from 'firebase/firestore';

interface ChatActions {
  // Room Management
  createRoom: (roomData: CreateRoomData, userId: string) => Promise<Room>;
  joinRoom: (roomId: string) => Promise<void>;
  joinPublicRoom: (roomId: string, userId: string) => Promise<void>;
  leaveRoom: () => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => Promise<void>;
  
  // Message Management
  sendMessage: (messageData: MessageInputData) => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  clearMessages: () => void;
  
  // User Management
  loadParticipants: (roomId: string) => Promise<void>;
  addParticipant: (user: User) => void;
  removeParticipant: (userId: string) => void;
  
  // Typing Status
  setTyping: (userId: string, isTyping: boolean) => void;
  startTyping: (roomId: string, userId: string) => void;
  stopTyping: (roomId: string, userId: string) => void;
  
  // Connection Management
  connectSocket: (userId: string) => Promise<void>;
  disconnectSocket: () => void;
  setConnectionStatus: (isConnected: boolean) => void;
  
  // State Management
  setCurrentRoom: (room: Room | null) => void;
  getCurrentRoom: () => Room | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Room List Management
  loadRoomList: (userId: string) => Promise<RoomListItem[]>;
  refreshRoomList: (userId: string) => Promise<RoomListItem[]>;
  
  // Moderation Actions
  updateRoomNotice: (roomId: string, notice: string, userId: string) => Promise<void>;
  kickUser: (roomId: string, targetUserId: string, reason: string | undefined, performedBy: string) => Promise<void>;
  closeRoom: (roomId: string, reason: string | undefined, performedBy: string) => Promise<void>;
  reopenRoom: (roomId: string, performedBy: string) => Promise<void>;
  clearAllMessages: (roomId: string, performedBy: string) => Promise<void>;
}

type ChatStore = ChatState & ChatActions;

// localStorage管理関数
const STORAGE_KEY = 'chat-app-mock-rooms';
const STORAGE_MESSAGES_KEY = 'chat-app-mock-messages';

const getStoredRooms = (): Room[] => {
  if (typeof window === 'undefined') return DEFAULT_ROOMS; // SSR対応
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedRooms = JSON.parse(stored);
      // Timestamp型の復元（Date文字列からTimestampオブジェクトに変換）
      return parsedRooms.map((room: any) => ({
        ...room,
        createdAt: new Date(room.createdAt) as unknown as Timestamp,
      }));
    }
  } catch (error) {
    console.error('Failed to load rooms from localStorage:', error);
  }
  return DEFAULT_ROOMS;
};

const saveRoomsToStorage = (rooms: Room[]): void => {
  if (typeof window === 'undefined') return; // SSR対応
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch (error) {
    console.error('Failed to save rooms to localStorage:', error);
  }
};

const getStoredMessages = (): Record<string, Message[]> => {
  if (typeof window === 'undefined') return DEFAULT_MESSAGES; // SSR対応
  
  try {
    const stored = localStorage.getItem(STORAGE_MESSAGES_KEY);
    if (stored) {
      const parsedMessages = JSON.parse(stored);
      // Timestamp型の復元
      const restoredMessages: Record<string, Message[]> = {};
      Object.keys(parsedMessages).forEach(roomId => {
        restoredMessages[roomId] = parsedMessages[roomId].map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt) as unknown as Timestamp,
          ...(msg.deletedAt && { deletedAt: new Date(msg.deletedAt) as unknown as Timestamp }),
        }));
      });
      return restoredMessages;
    }
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
  }
  return DEFAULT_MESSAGES;
};

const saveMessagesToStorage = (messages: Record<string, Message[]>): void => {
  if (typeof window === 'undefined') return; // SSR対応
  
  try {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

// デフォルトデータ（初期データ）
const DEFAULT_ROOMS: Room[] = [
  {
    roomId: 'room-1',
    ownerUid: 'mock-user-1',
    title: 'プロジェクト相談',
    notice: '新しいプロジェクトについて相談しましょう。',
    visibility: 'public',
    chatType: '1v1',
    participants: ['mock-user-1', 'mock-user-2'],
    aiProxyEnabled: true,
    aiProxyConfig: {
      timeoutSecs: 30,
      keywords: ['緊急', '至急', '重要'],
      model: 'gpt-4o-mini',
    },
    createdAt: new Date('2024-01-10T09:00:00Z') as unknown as Timestamp,
    isActive: true,
    isClosed: false,
  },
  {
    roomId: 'room-2',
    ownerUid: 'mock-user-2',
    title: '技術的な質問・相談',
    notice: '技術的な疑問や新しい技術について自由に質問・議論する場です。',
    visibility: 'public',
    chatType: '1vN',
    participants: ['mock-user-2', 'mock-user-1'],
    aiProxyEnabled: true,
    aiProxyConfig: {
      timeoutSecs: 45,
      keywords: ['質問', 'エラー', 'バグ'],
      model: 'gemini-1.5',
    },
    createdAt: new Date('2024-01-12T16:15:00Z') as unknown as Timestamp,
    isActive: true,
    isClosed: false,
  },
];

const DEFAULT_MESSAGES: Record<string, Message[]> = {
  'room-1': [
    {
      msgId: 'msg-1',
      roomId: 'room-1',
      senderUid: 'mock-user-1',
      text: 'おはようございます！新しいプロジェクトについて相談があります。',
      createdAt: new Date('2024-01-15T09:00:00Z') as unknown as Timestamp,
      isDeleted: false,
      isAiGenerated: false,
    },
    {
      msgId: 'msg-2',
      roomId: 'room-1',
      senderUid: 'mock-user-2',
      text: 'おはようございます！どのような内容でしょうか？',
      createdAt: new Date('2024-01-15T09:05:00Z') as unknown as Timestamp,
      isDeleted: false,
      isAiGenerated: false,
    },
    {
      msgId: 'msg-3',
      roomId: 'room-1',
      senderUid: 'mock-user-1',
      text: '新しいチャットアプリケーションの開発を検討しています。AI機能も含めて。',
      createdAt: new Date('2024-01-15T09:10:00Z') as unknown as Timestamp,
      isDeleted: false,
      isAiGenerated: false,
    },
  ],
  'room-2': [
    {
      msgId: 'msg-4',
      roomId: 'room-2',
      senderUid: 'mock-user-2',
      text: 'Reactの状態管理について質問があります。ZustandとReduxどちらが良いでしょうか？',
      createdAt: new Date('2024-01-15T11:00:00Z') as unknown as Timestamp,
      isDeleted: false,
      isAiGenerated: false,
    },
  ],
};

// モデレーション履歴（開発用）
const MOCK_MODERATION_ACTIONS: ModerationAction[] = [];

// 動的データ（localStorage連携）
let MOCK_ROOMS = getStoredRooms();
let MOCK_MESSAGES = getStoredMessages();

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial State
  currentRoom: null,
  messages: [],
  participants: [],
  typingUsers: [],
  isConnected: false,
  isLoading: false,
  error: null,

  // Room Management
  createRoom: async (roomData: CreateRoomData, userId: string) => {
    const { setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // 新しいルームを作成（モック実装）
      const roomToCreate: Omit<Room, 'notice'> & { notice?: string | undefined } = {
        roomId: uuidv4(),
        ownerUid: userId,
        title: roomData.title,
        visibility: roomData.visibility,
        chatType: roomData.chatType,
        participants: [userId],
        aiProxyEnabled: roomData.aiProxyEnabled,
        aiProxyConfig: roomData.aiProxyConfig,
        createdAt: new Date() as unknown as Timestamp,
        isActive: true,
      };
      
      if (roomData.notice) {
        roomToCreate.notice = roomData.notice;
      }
      
      const newRoom = roomToCreate as Room;
      
      // モックデータに追加
      MOCK_ROOMS.push(newRoom);
      
      // localStorageに保存
      saveRoomsToStorage(MOCK_ROOMS);
      
      console.log('Room created successfully:', newRoom.roomId);
      return newRoom;
      
    } catch (error) {
      console.error('Failed to create room:', error);
      setError(error instanceof Error ? error.message : 'ルーム作成に失敗しました');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  joinRoom: async (roomId: string) => {
    const { setLoading, setError, setCurrentRoom, loadMessages, loadParticipants } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // localStorageから最新データを読み込み
      MOCK_ROOMS = getStoredRooms();
      MOCK_MESSAGES = getStoredMessages();
      
      // ルーム情報を取得（モック実装）
      const room = MOCK_ROOMS.find(r => r.roomId === roomId);
      if (!room) {
        throw new Error('Room not found');
      }
      
      // Socket.ioでルームに参加
      if (socketService.isConnected()) {
        socketService.joinRoom(roomId);
      }
      
      // 現在のルームを設定
      setCurrentRoom(room);
      
      // メッセージと参加者を読み込み
      await Promise.all([
        loadMessages(roomId),
        loadParticipants(roomId),
      ]);
      
      console.log('Joined room successfully:', roomId);
      
    } catch (error) {
      console.error('Failed to join room:', error);
      setError(error instanceof Error ? error.message : 'ルーム参加に失敗しました');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  leaveRoom: () => {
    const { currentRoom } = get();
    
    if (currentRoom) {
      // Socket.ioでルームから退出
      if (socketService.isConnected()) {
        socketService.leaveRoom(currentRoom.roomId);
      }
      
      // 状態をクリア
      set({
        currentRoom: null,
        messages: [],
        participants: [],
        typingUsers: [],
      });
      
      console.log('Left room:', currentRoom.roomId);
    }
  },

  updateRoom: async (roomId: string, updates: Partial<Room>) => {
    const { setError, currentRoom, setCurrentRoom } = get();
    
    try {
      setError(null);
      
      // モックルーム更新
      const roomIndex = MOCK_ROOMS.findIndex(r => r.roomId === roomId);
      if (roomIndex !== -1) {
        MOCK_ROOMS[roomIndex] = { ...MOCK_ROOMS[roomIndex], ...updates };
        
        // localStorageに保存
        saveRoomsToStorage(MOCK_ROOMS);
        
        // 現在のルームを更新
        if (currentRoom?.roomId === roomId) {
          setCurrentRoom(MOCK_ROOMS[roomIndex]);
        }
      }
      
      console.log('Room updated:', roomId);
      
    } catch (error) {
      console.error('Failed to update room:', error);
      setError(error instanceof Error ? error.message : 'ルーム更新に失敗しました');
      throw error;
    }
  },

  joinPublicRoom: async (roomId: string, userId: string) => {
    const { setError } = get();
    
    try {
      setError(null);
      
      // ルームを検索
      const roomIndex = MOCK_ROOMS.findIndex(r => r.roomId === roomId);
      if (roomIndex === -1) {
        throw new Error('Room not found');
      }
      
      const room = MOCK_ROOMS[roomIndex];
      
      // 公開ルームかチェック
      if (room.visibility !== 'public') {
        throw new Error('このルームは非公開です');
      }
      
      // 既に参加しているかチェック
      if (room.participants.includes(userId)) {
        console.log('User already participant in room:', roomId);
        return;
      }
      
      // 参加者リストに追加
      MOCK_ROOMS[roomIndex] = {
        ...room,
        participants: [...room.participants, userId]
      };
      
      // localStorageに保存
      saveRoomsToStorage(MOCK_ROOMS);
      
      // Socket.ioで参加を通知
      if (socketService.isConnected()) {
        socketService.joinRoom(roomId);
      }
      
      console.log('User joined public room:', userId, 'to room:', roomId);
      
    } catch (error) {
      console.error('Failed to join public room:', error);
      setError(error instanceof Error ? error.message : '公開ルーム参加に失敗しました');
      throw error;
    }
  },

  // Message Management
  sendMessage: async (messageData: MessageInputData) => {
    const { setError, messages } = get();
    
    try {
      setError(null);
      
      // 新しいメッセージを作成
      const newMessage: Message = {
        msgId: uuidv4(),
        roomId: messageData.roomId,
        senderUid: messageData.senderUid,
        text: messageData.text,
        createdAt: new Date() as unknown as Timestamp,
        isDeleted: false,
        isAiGenerated: false,
      };
      
      // Socket.ioでメッセージ送信
      if (socketService.isConnected()) {
        socketService.sendMessage({
          roomId: messageData.roomId,
          senderUid: messageData.senderUid,
          text: messageData.text,
        });
        
        // モックモードの場合は即座にローカル状態を更新
        if (socketService.isMockMode()) {
          const updatedMessages = [...messages, newMessage];
          set({ messages: updatedMessages });
          console.log('[Mock Mode] Message added to local state:', newMessage.msgId, 'Total messages:', updatedMessages.length);
          
          // モックデータも更新
          if (!MOCK_MESSAGES[messageData.roomId]) {
            MOCK_MESSAGES[messageData.roomId] = [];
          }
          MOCK_MESSAGES[messageData.roomId].push(newMessage);
          
          // localStorageに保存
          saveMessagesToStorage(MOCK_MESSAGES);
          
          console.log('[Mock Mode] Message added to MOCK_MESSAGES:', MOCK_MESSAGES[messageData.roomId].length, 'messages');
        }
        // 実モードでは、message_receivedイベントで状態更新されるため、ここでは何もしない
      } else {
        // Socket.io接続がない場合のみローカル状態を更新
        const updatedMessages = [...messages, newMessage];
        set({ messages: updatedMessages });
        
        // モックデータも更新
        if (!MOCK_MESSAGES[messageData.roomId]) {
          MOCK_MESSAGES[messageData.roomId] = [];
        }
        MOCK_MESSAGES[messageData.roomId].push(newMessage);
        
        // localStorageに保存
        saveMessagesToStorage(MOCK_MESSAGES);
      }
      
      console.log('Message sent:', newMessage.msgId);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'メッセージ送信に失敗しました');
      throw error;
    }
  },

  loadMessages: async (roomId: string) => {
    const { setError, messages } = get();
    
    try {
      setError(null);
      
      // 既にメッセージが読み込まれている場合はスキップ（重複防止）
      const existingRoomMessages = messages.filter(msg => msg.roomId === roomId);
      if (existingRoomMessages.length > 0) {
        console.log('Messages already loaded for room:', roomId, existingRoomMessages.length);
        return;
      }
      
      // モックメッセージを読み込み（初回のみ）
      const roomMessages = MOCK_MESSAGES[roomId] || [];
      set({ messages: roomMessages });
      
      console.log('Messages loaded for room:', roomId, roomMessages.length);
      
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError(error instanceof Error ? error.message : 'メッセージ読み込みに失敗しました');
      throw error;
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  // User Management
  loadParticipants: async (roomId: string) => {
    const { setError } = get();
    
    try {
      setError(null);
      
      // モック参加者データ（実際はFirestoreから取得）
      const mockParticipants: User[] = [
        {
          uid: 'mock-user-1',
          email: 'test1@example.com',
          displayName: '山田太郎',
          region: '東京都',
          organization: 'テスト株式会社',
          ageGroup: 'age_30s',
          gender: 'male',
          createdAt: new Date('2024-01-01') as unknown as Timestamp,
          lastLoginAt: new Date() as unknown as Timestamp,
        },
        {
          uid: 'mock-user-2',
          email: 'test2@example.com',
          displayName: '佐藤花子',
          region: '大阪府',
          organization: 'サンプル会社',
          ageGroup: 'age_20s',
          gender: 'female',
          createdAt: new Date('2024-01-02') as unknown as Timestamp,
          lastLoginAt: new Date() as unknown as Timestamp,
        },
      ];
      
      set({ participants: mockParticipants });
      console.log('Participants loaded for room:', roomId);
      
    } catch (error) {
      console.error('Failed to load participants:', error);
      setError(error instanceof Error ? error.message : '参加者読み込みに失敗しました');
      throw error;
    }
  },

  addParticipant: (user: User) => {
    const { participants } = get();
    if (!participants.find(p => p.uid === user.uid)) {
      set({ participants: [...participants, user] });
    }
  },

  removeParticipant: (userId: string) => {
    const { participants } = get();
    set({ participants: participants.filter(p => p.uid !== userId) });
  },

  // Typing Status
  setTyping: (userId: string, isTyping: boolean) => {
    const { typingUsers } = get();
    
    if (isTyping && !typingUsers.includes(userId)) {
      set({ typingUsers: [...typingUsers, userId] });
    } else if (!isTyping) {
      set({ typingUsers: typingUsers.filter(id => id !== userId) });
    }
  },

  startTyping: (roomId: string, userId: string) => {
    if (socketService.isConnected()) {
      socketService.startTyping(roomId, userId);
    }
  },

  stopTyping: (roomId: string, userId: string) => {
    if (socketService.isConnected()) {
      socketService.stopTyping(roomId, userId);
    }
  },

  // Connection Management
  connectSocket: async (userId: string) => {
    const { setConnectionStatus, setError, isConnected } = get();
    
    // 既に接続済みの場合は何もしない
    if (isConnected) {
      console.log('Socket already connected');
      return;
    }
    
    try {
      setError(null);
      await socketService.connect(userId);
      setConnectionStatus(true);
      
      // モックモードでない場合のみイベントリスナーを設定
      if (!socketService.isMockMode()) {
        // Socket.ioイベントリスナーを設定
        socketService.on('message_received', (message: Message) => {
          const { messages } = get();
          set({ messages: [...messages, message] });
        });
        
        socketService.on('user_joined', (_roomId: string, user: User) => {
          get().addParticipant(user);
        });
        
        socketService.on('user_left', (_roomId: string, userId: string) => {
          get().removeParticipant(userId);
        });
        
        socketService.on('typing_status', (_roomId: string, userId: string, isTyping: boolean) => {
          get().setTyping(userId, isTyping);
        });
      }
      
      console.log('Socket connected successfully', socketService.isMockMode() ? '(Mock Mode)' : '');
      
    } catch (error) {
      console.error('Failed to connect socket:', error);
      setError(error instanceof Error ? error.message : 'Socket接続に失敗しました');
      setConnectionStatus(false);
    }
  },

  disconnectSocket: () => {
    socketService.disconnect();
    set({ isConnected: false });
  },

  setConnectionStatus: (isConnected: boolean) => {
    set({ isConnected });
  },

  // State Management
  setCurrentRoom: (room: Room | null) => {
    set({ currentRoom: room });
  },

  getCurrentRoom: () => {
    return get().currentRoom;
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // Room List Management
  loadRoomList: async (userId: string) => {
    const { setError } = get();
    
    try {
      setError(null);
      
      // localStorageから最新データを読み込み
      MOCK_ROOMS = getStoredRooms();
      MOCK_MESSAGES = getStoredMessages();
      
      // 全ルームから表示対象を決定
      const roomList: RoomListItem[] = MOCK_ROOMS
        .filter(room => {
          // 以下のルームを表示:
          // 1. 自分が参加しているルーム
          // 2. 公開ルーム（参加していなくても表示）
          return room.participants.includes(userId) || room.visibility === 'public';
        })
        .map(room => ({
          roomId: room.roomId,
          title: room.title,
          visibility: room.visibility,
          chatType: room.chatType,
          participantCount: room.participants.length,
          lastMessageAt: MOCK_MESSAGES[room.roomId]?.slice(-1)[0]?.createdAt,
          lastMessageText: MOCK_MESSAGES[room.roomId]?.slice(-1)[0]?.text,
          isOwner: room.ownerUid === userId,
          isParticipant: room.participants.includes(userId),
          hasUnreadMessages: false, // 実装時にはちゃんとした未読管理
        }));
      
      console.log('Room list loaded:', roomList.length, 'rooms for user:', userId);
      return roomList;
      
    } catch (error) {
      console.error('Failed to load room list:', error);
      setError(error instanceof Error ? error.message : 'ルームリスト読み込みに失敗しました');
      return [];
    }
  },

  refreshRoomList: async (userId: string) => {
    return get().loadRoomList(userId);
  },

  // Moderation Actions
  updateRoomNotice: async (roomId: string, notice: string, userId: string) => {
    const { setError, currentRoom, setCurrentRoom } = get();
    
    try {
      setError(null);
      
      // ルーム情報を更新（モック実装）
      const roomIndex = MOCK_ROOMS.findIndex(r => r.roomId === roomId);
      if (roomIndex !== -1) {
        const oldNotice = MOCK_ROOMS[roomIndex].notice;
        MOCK_ROOMS[roomIndex] = { ...MOCK_ROOMS[roomIndex], notice };
        
        // localStorageに保存
        saveRoomsToStorage(MOCK_ROOMS);
        
        // モデレーション履歴に記録
        const action: ModerationAction = {
          actionId: uuidv4(),
          roomId,
          type: 'update_notice',
          oldValue: oldNotice || '',
          newValue: notice,
          performedBy: userId,
          performedAt: new Date() as unknown as Timestamp,
        };
        MOCK_MODERATION_ACTIONS.push(action);
        
        // 現在のルームが対象ルームの場合、状態を更新
        if (currentRoom?.roomId === roomId) {
          setCurrentRoom({ ...currentRoom, notice });
        }
        
        console.log('Room notice updated:', roomId, notice);
      }
    } catch (error) {
      console.error('Failed to update room notice:', error);
      setError(error instanceof Error ? error.message : 'お知らせの更新に失敗しました');
      throw error;
    }
  },

  kickUser: async (roomId: string, targetUserId: string, reason: string | undefined, performedBy: string) => {
    const { setError, removeParticipant } = get();
    
    try {
      setError(null);
      
      // 参加者リストから削除（モック実装）
      const roomIndex = MOCK_ROOMS.findIndex(r => r.roomId === roomId);
      if (roomIndex !== -1) {
        MOCK_ROOMS[roomIndex].participants = MOCK_ROOMS[roomIndex].participants.filter(
          uid => uid !== targetUserId
        );
        
        // localStorageに保存
        saveRoomsToStorage(MOCK_ROOMS);
        
        // Socket.ioでユーザー退出を通知
        if (socketService.isConnected()) {
          socketService.emit('kick_user', { roomId, targetUserId, reason });
        }
        
        // ローカル状態から削除
        removeParticipant(targetUserId);
        
        // モデレーション履歴に記録
        const action: ModerationAction = {
          actionId: uuidv4(),
          roomId,
          type: 'kick_user',
          targetUserId,
          ...(reason && { reason }),
          performedBy,
          performedAt: new Date() as unknown as Timestamp,
        };
        MOCK_MODERATION_ACTIONS.push(action);
        
        console.log('User kicked:', targetUserId, 'from room:', roomId);
      }
    } catch (error) {
      console.error('Failed to kick user:', error);
      setError(error instanceof Error ? error.message : 'ユーザーの退出処理に失敗しました');
      throw error;
    }
  },

  closeRoom: async (roomId: string, reason: string | undefined, performedBy: string) => {
    const { setError, currentRoom, setCurrentRoom } = get();
    
    try {
      setError(null);
      
      // ルームを閉鎖状態に変更（モック実装）
      const roomIndex = MOCK_ROOMS.findIndex(r => r.roomId === roomId);
      if (roomIndex !== -1) {
        MOCK_ROOMS[roomIndex] = { ...MOCK_ROOMS[roomIndex], isClosed: true };
        
        // localStorageに保存
        saveRoomsToStorage(MOCK_ROOMS);
        
        // Socket.ioでルーム閉鎖を通知
        if (socketService.isConnected()) {
          socketService.emit('close_room', { roomId, reason });
        }
        
        // 現在のルームが対象ルームの場合、状態を更新
        if (currentRoom?.roomId === roomId) {
          setCurrentRoom({ ...currentRoom, isClosed: true });
        }
        
        // モデレーション履歴に記録
        const action: ModerationAction = {
          actionId: uuidv4(),
          roomId,
          type: 'close_room',
          ...(reason && { reason }),
          performedBy,
          performedAt: new Date() as unknown as Timestamp,
        };
        MOCK_MODERATION_ACTIONS.push(action);
        
        console.log('Room closed:', roomId);
      }
    } catch (error) {
      console.error('Failed to close room:', error);
      setError(error instanceof Error ? error.message : 'ルームの閉鎖に失敗しました');
      throw error;
    }
  },

  reopenRoom: async (roomId: string, performedBy: string) => {
    const { setError, currentRoom, setCurrentRoom } = get();
    
    try {
      setError(null);
      
      // ルームを再開状態に変更（モック実装）
      const roomIndex = MOCK_ROOMS.findIndex(r => r.roomId === roomId);
      if (roomIndex !== -1) {
        MOCK_ROOMS[roomIndex] = { ...MOCK_ROOMS[roomIndex], isClosed: false };
        
        // localStorageに保存
        saveRoomsToStorage(MOCK_ROOMS);
        
        // Socket.ioでルーム再開を通知
        if (socketService.isConnected()) {
          socketService.emit('reopen_room', { roomId });
        }
        
        // 現在のルームが対象ルームの場合、状態を更新
        if (currentRoom?.roomId === roomId) {
          setCurrentRoom({ ...currentRoom, isClosed: false });
        }
        
        // モデレーション履歴に記録
        const action: ModerationAction = {
          actionId: uuidv4(),
          roomId,
          type: 'reopen_room',
          performedBy,
          performedAt: new Date() as unknown as Timestamp,
        };
        MOCK_MODERATION_ACTIONS.push(action);
        
        console.log('Room reopened:', roomId);
      }
    } catch (error) {
      console.error('Failed to reopen room:', error);
      setError(error instanceof Error ? error.message : 'ルームの再開に失敗しました');
      throw error;
    }
  },

  clearAllMessages: async (roomId: string, performedBy: string) => {
    const { setError, messages } = get();
    
    try {
      setError(null);
      
      // 全メッセージをソフトデリート（モック実装）
      if (MOCK_MESSAGES[roomId]) {
        MOCK_MESSAGES[roomId] = MOCK_MESSAGES[roomId].map(message => ({
          ...message,
          isDeleted: true,
          deletedAt: new Date() as unknown as Timestamp,
        }));
        
        // localStorageに保存
        saveMessagesToStorage(MOCK_MESSAGES);
      }
      
      // Socket.ioでメッセージクリアを通知
      if (socketService.isConnected()) {
        socketService.emit('clear_messages', { roomId });
      }
      
      // ローカル状態からメッセージを削除
      const updatedMessages = messages.map(message => 
        message.roomId === roomId 
          ? { ...message, isDeleted: true, deletedAt: new Date() as unknown as Timestamp }
          : message
      );
      set({ messages: updatedMessages });
      
      // モデレーション履歴に記録
      const action: ModerationAction = {
        actionId: uuidv4(),
        roomId,
        type: 'clear_messages',
        performedBy,
        performedAt: new Date() as unknown as Timestamp,
      };
      MOCK_MODERATION_ACTIONS.push(action);
      
      console.log('All messages cleared in room:', roomId);
    } catch (error) {
      console.error('Failed to clear messages:', error);
      setError(error instanceof Error ? error.message : 'メッセージの削除に失敗しました');
      throw error;
    }
  },
}));