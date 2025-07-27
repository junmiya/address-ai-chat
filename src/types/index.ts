import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  region?: string | undefined;
  organization?: string | undefined;
  ageGroup?: 'age_10s' | 'age_20s' | 'age_30s' | 'age_40s' | 'age_50s' | 'age_60s_plus' | undefined;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
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
}

export interface AIProxyConfig {
  timeoutSecs: number;
  keywords: string[];
  model: 'gpt-4o' | 'gpt-4o-mini' | 'gemini-1.5';
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
  isLoading: boolean;
  error: string | null;
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