import { Timestamp } from 'firebase/firestore';

// User Types  
export interface User {
  uid: string;
  email: string;
  displayName: string;
  name: string; // ディレクトリ表示用の名前
  community: string; // コミュニティ（第1階層）
  group: string; // グループ（第2階層）
  registeredAt: Timestamp; // 登録日時
  region?: string | undefined;
  organization?: string | undefined;
  ageGroup?: '10s' | '20s' | '30s' | '40s' | '50s' | '60s+' | undefined;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  // 新機能追加
  notificationPreferences?: NotificationPreference;
}

// Directory User Types（ディレクトリ表示用）
export interface DirectoryUser {
  uid: string;
  name: string;
  community: string;
  group: string;
  registeredAt: Timestamp;
  region?: string;
  organization?: string;
  ageGroup?: '10s' | '20s' | '30s' | '40s' | '50s' | '60s+';
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

// Directory Sort Keys
export type DirectorySortKey = 'community' | 'group' | 'name' | 'registeredAt';

// Directory Hierarchy
export interface DirectoryHierarchy {
  communities: {
    [community: string]: {
      groups: {
        [group: string]: DirectoryUser[];
      };
    };
  };
}

// Room Types
export interface Room {
  roomId: string;
  ownerUid: string;
  visibility: 'public' | 'private';
  chatType: '1v1' | '1vN';
  title: string;
  notice?: string;
  createdAt: Timestamp;
  isActive: boolean;
  isClosed?: boolean; // ルーム閉鎖状態（新規投稿不可、閲覧のみ）
  participants: string[];
  aiProxyEnabled: boolean;
  aiProxyConfig: AIProxyConfig;
  // 新機能追加
  ownerStatus?: OwnerStatus;
  aiProxySettings?: AIProxySettings;
  emergencyCallsEnabled?: boolean;
}

export interface AIProxyConfig {
  timeoutSecs: number;
  keywords: string[];
  model: 'gpt-4o' | 'gpt-4o-mini' | 'gemini-1.5';
}

// Owner Status Management Types
export interface OwnerStatus {
  status: 'online' | 'away' | 'busy' | 'emergency_only';
  message?: string;
  autoAwayTime?: Date;
  lastActivity: Date;
  roomId: string;
  ownerId: string;
}

export interface AIProxySettings {
  enabled: boolean;
  greetingMessage: string;
  awayMessage: string;
  busyMessage: string;
  emergencyMessage: string;
  autoGreeting: boolean;  // 入室時自動挨拶
  commandResponse: boolean;  // コマンド応答
}

// Emergency Call Types
export interface EmergencyCall {
  id: string;
  callerId: string;
  callerName: string;
  roomId: string;
  roomTitle: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'answered' | 'ignored' | 'timeout';
  ownerResponse?: string;
  respondedAt?: Date;
}

export interface NotificationPreference {
  browser: boolean;
  email: boolean;
  sound: boolean;
  emailAddress?: string;
}

// Message Types
export interface Message {
  msgId: string;
  roomId: string;
  senderUid: string; // 'AI' for AI messages
  text: string;
  createdAt: Timestamp;
  isDeleted?: boolean;
  deletedAt?: Timestamp; // メッセージ削除日時
  isAiGenerated?: boolean;
  readBy?: string[]; // 既読ユーザーのUID配列
  readStatus?: MessageReadStatus[]; // 詳細な既読情報
}

// Message Read Status Types
export interface MessageReadStatus {
  userId: string;
  readAt: Timestamp;
  messageId: string;
}

// AI Summary Types
export interface AISummary {
  sumId: string;
  roomId: string;
  content: string;
  createdAt: Timestamp;
  tokenUsage: number;
}

// Moderation Types
export interface ModerationAction {
  actionId: string;
  roomId: string;
  type: 'kick_user' | 'close_room' | 'reopen_room' | 'clear_messages' | 'update_notice';
  targetUserId?: string; // kick_user用
  oldValue?: string; // update_notice用（変更前の値）
  newValue?: string; // update_notice用（変更後の値）
  reason?: string;
  performedBy: string;
  performedAt: Timestamp;
}

// Billing Types
export interface UserBilling {
  uid: string;
  plan: 'free' | 'subscription' | 'payg';
  tokensUsedThisMonth: number;
  tokensLimit: number;
  billingCycle: Timestamp;
}

// Chat Mode Types
export type ChatMode = 'one_to_one_public' | 'one_to_one_private' | 'one_to_many_private' | 'one_to_many_public';

export interface ChatModeInfo {
  id: ChatMode;
  label: string;
  default?: boolean;
}

// AI Model Types
export interface AIModelInfo {
  id: string;
  cost: 'low' | 'medium' | 'high';
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  region?: string;
  organization?: string;
  ageGroup?: User['ageGroup'];
  gender?: User['gender'];
}

export interface RoomFormData {
  title: string;
  visibility: Room['visibility'];
  chatType: Room['chatType'];
  notice?: string;
  region?: string;
  organization?: string;
  ageGroup?: User['ageGroup'];
  gender?: User['gender'];
}

// Socket.io Event Types
export interface SocketEvents {
  // Client to Server
  'join_room': (roomId: string) => void;
  'leave_room': (roomId: string) => void;
  'send_message': (message: Omit<Message, 'msgId' | 'createdAt'>) => void;
  'typing_start': (roomId: string, userId: string) => void;
  'typing_stop': (roomId: string, userId: string) => void;
  
  // Server to Client
  'message_received': (message: Message) => void;
  'user_joined': (roomId: string, user: User) => void;
  'user_left': (roomId: string, userId: string) => void;
  'typing_status': (roomId: string, userId: string, isTyping: boolean) => void;
  'room_updated': (room: Room) => void;
  'error': (error: string) => void;
}

// Chat State Types
export interface ChatState {
  currentRoom: Room | null;
  messages: Message[];
  participants: User[];
  typingUsers: string[];
  isConnected: boolean;
  isSocketConnected: boolean;
  isLoading: boolean;
  error: string | null;
  socketError: string | null;
  realtimeMessages: Message[];
}

// Message Input Types
export interface MessageInputData {
  text: string;
  roomId: string;
  senderUid: string;
}

// Room Creation Types
export interface CreateRoomData {
  title: string;
  visibility: Room['visibility'];
  chatType: Room['chatType'];
  notice?: string;
  aiProxyEnabled: boolean;
  aiProxyConfig: AIProxyConfig;
}

// Room List Types
export interface RoomListItem {
  roomId: string;
  title: string;
  visibility: Room['visibility'];
  chatType: Room['chatType'];
  participantCount: number;
  lastMessageAt?: Timestamp;
  lastMessageText?: string;
  isOwner: boolean;
  isParticipant: boolean;
  hasUnreadMessages: boolean;
}

// Chat Initiation Types（ディレクトリからのチャット開始）
export interface ChatInitiationData {
  targetUserUid: string; // 選択されたユーザー（ルームオーナーになる）
  initiatorUid: string; // チャットを開始したユーザー
  chatType: '1v1' | '1vN';
}

export interface CreateChatWithUserData {
  targetUserUid: string;
  initiatorUid: string;
  chatType: '1v1' | '1vN';
  visibility: 'private'; // ディレクトリからは常にprivate
}