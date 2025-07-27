import { User, Room } from '@/types';

/**
 * ユーザーがルームを管理（モデレート）できるかチェック
 */
export const canModerateRoom = (user: User, room: Room): boolean => {
  return user.uid === room.ownerUid;
};

/**
 * ユーザーがルームのお知らせを編集できるかチェック
 */
export const canEditRoomNotice = (user: User, room: Room): boolean => {
  return user.uid === room.ownerUid;
};

/**
 * ユーザーが特定のユーザーをキックできるかチェック
 */
export const canKickUser = (
  currentUser: User, 
  targetUser: User, 
  room: Room
): boolean => {
  // オーナーのみがキック可能
  if (currentUser.uid !== room.ownerUid) {
    return false;
  }
  
  // 自分自身はキックできない
  if (currentUser.uid === targetUser.uid) {
    return false;
  }
  
  // オーナーは他のオーナーはキックできない（通常はオーナーは1人だが安全のため）
  if (targetUser.uid === room.ownerUid) {
    return false;
  }
  
  return true;
};

/**
 * ユーザーがルームを閉鎖/再開できるかチェック
 */
export const canToggleRoomStatus = (user: User, room: Room): boolean => {
  return user.uid === room.ownerUid;
};

/**
 * ユーザーがメッセージを削除できるかチェック
 */
export const canClearMessages = (user: User, room: Room): boolean => {
  return user.uid === room.ownerUid;
};

/**
 * ユーザーがルーム設定にアクセスできるかチェック
 */
export const canAccessRoomSettings = (user: User, room: Room): boolean => {
  return user.uid === room.ownerUid;
};

/**
 * ユーザーがメッセージを送信できるかチェック
 */
export const canSendMessage = (user: User, room: Room): boolean => {
  // ルームが閉鎖されている場合は送信不可
  if (room.isClosed) {
    return false;
  }
  
  // 参加者でない場合は送信不可
  if (!room.participants.includes(user.uid)) {
    return false;
  }
  
  return true;
};

/**
 * ユーザーがルームを退出できるかチェック
 */
export const canLeaveRoom = (user: User, room: Room): boolean => {
  // 参加者でない場合は退出不可（論理的な整合性のため）
  if (!room.participants.includes(user.uid)) {
    return false;
  }
  
  return true;
};

/**
 * ルームのオーナーかどうかチェック
 */
export const isRoomOwner = (user: User, room: Room): boolean => {
  return user.uid === room.ownerUid;
};

/**
 * ルームの参加者かどうかチェック
 */
export const isParticipant = (user: User, room: Room): boolean => {
  return room.participants.includes(user.uid);
};

/**
 * 権限エラーメッセージの生成
 */
export const getPermissionErrorMessage = (action: string): string => {
  const messages: Record<string, string> = {
    moderate: 'この操作を実行する権限がありません。ルームオーナーのみが実行できます。',
    kick: 'ユーザーを退出させる権限がありません。',
    close: 'ルームを閉鎖する権限がありません。',
    clear: 'メッセージを削除する権限がありません。',
    notice: 'お知らせを編集する権限がありません。',
    send: 'メッセージを送信できません。ルームが閉鎖されているか、参加者ではない可能性があります。',
    settings: 'ルーム設定にアクセスする権限がありません。',
  };
  
  return messages[action] || '操作する権限がありません。';
};