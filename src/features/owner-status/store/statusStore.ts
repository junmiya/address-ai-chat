import { create } from 'zustand';
import { OwnerStatus, AIProxySettings } from '@/types';

interface OwnerStatusState {
  ownerStatuses: Map<string, OwnerStatus>; // roomId -> OwnerStatus
  aiProxySettings: Map<string, AIProxySettings>; // roomId -> AIProxySettings
  isLoading: boolean;
  error: string | null;
}

interface OwnerStatusActions {
  // ステータス管理
  setOwnerStatus: (roomId: string, status: OwnerStatus) => void;
  updateOwnerStatus: (roomId: string, status: OwnerStatus['status'], message?: string) => void;
  getOwnerStatus: (roomId: string) => OwnerStatus | null;
  
  // AI代理設定管理
  setAIProxySettings: (roomId: string, settings: AIProxySettings) => void;
  updateAIProxySettings: (roomId: string, updates: Partial<AIProxySettings>) => void;
  getAIProxySettings: (roomId: string) => AIProxySettings | null;
  
  // 自動ステータス更新
  updateLastActivity: (roomId: string, ownerId: string) => void;
  
  // ストレージ管理
  loadFromStorage: () => void;
  saveToStorage: () => void;
  
  // エラー管理
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

type OwnerStatusStore = OwnerStatusState & OwnerStatusActions;

// localStorage管理
const STORAGE_KEY_STATUS = 'owner-status-data';
const STORAGE_KEY_AI_SETTINGS = 'ai-proxy-settings-data';

const loadOwnerStatusFromStorage = (): Map<string, OwnerStatus> => {
  if (typeof window === 'undefined') return new Map();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY_STATUS);
    if (stored) {
      const data = JSON.parse(stored);
      const statusMap = new Map<string, OwnerStatus>();
      
      Object.entries(data).forEach(([roomId, status]: [string, any]) => {
        statusMap.set(roomId, {
          ...status,
          lastActivity: new Date(status.lastActivity),
          autoAwayTime: status.autoAwayTime ? new Date(status.autoAwayTime) : undefined
        });
      });
      
      return statusMap;
    }
  } catch (error) {
    console.error('Failed to load owner status from storage:', error);
  }
  
  return new Map();
};

const loadAISettingsFromStorage = (): Map<string, AIProxySettings> => {
  if (typeof window === 'undefined') return new Map();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY_AI_SETTINGS);
    if (stored) {
      const data = JSON.parse(stored);
      const settingsMap = new Map<string, AIProxySettings>();
      
      Object.entries(data).forEach(([roomId, settings]) => {
        settingsMap.set(roomId, settings as AIProxySettings);
      });
      
      return settingsMap;
    }
  } catch (error) {
    console.error('Failed to load AI settings from storage:', error);
  }
  
  return new Map();
};

const saveOwnerStatusToStorage = (statusMap: Map<string, OwnerStatus>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const data: Record<string, OwnerStatus> = {};
    statusMap.forEach((status, roomId) => {
      data[roomId] = status;
    });
    localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save owner status to storage:', error);
  }
};

const saveAISettingsToStorage = (settingsMap: Map<string, AIProxySettings>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const data: Record<string, AIProxySettings> = {};
    settingsMap.forEach((settings, roomId) => {
      data[roomId] = settings;
    });
    localStorage.setItem(STORAGE_KEY_AI_SETTINGS, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save AI settings to storage:', error);
  }
};

export const useOwnerStatusStore = create<OwnerStatusStore>((set, get) => ({
  // 初期状態
  ownerStatuses: new Map(),
  aiProxySettings: new Map(),
  isLoading: false,
  error: null,

  // ステータス管理
  setOwnerStatus: (roomId: string, status: OwnerStatus) => {
    const { ownerStatuses } = get();
    const newStatuses = new Map(ownerStatuses);
    newStatuses.set(roomId, status);
    
    set({ ownerStatuses: newStatuses });
    saveOwnerStatusToStorage(newStatuses);
  },

  updateOwnerStatus: (roomId: string, status: OwnerStatus['status'], message?: string) => {
    const { ownerStatuses, setOwnerStatus } = get();
    const currentStatus = ownerStatuses.get(roomId);
    
    const updatedStatus: OwnerStatus = {
      status,
      message,
      lastActivity: new Date(),
      roomId,
      ownerId: currentStatus?.ownerId || 'unknown',
      autoAwayTime: undefined // リセット
    };
    
    setOwnerStatus(roomId, updatedStatus);
  },

  getOwnerStatus: (roomId: string) => {
    const { ownerStatuses } = get();
    return ownerStatuses.get(roomId) || null;
  },

  // AI代理設定管理
  setAIProxySettings: (roomId: string, settings: AIProxySettings) => {
    const { aiProxySettings } = get();
    const newSettings = new Map(aiProxySettings);
    newSettings.set(roomId, settings);
    
    set({ aiProxySettings: newSettings });
    saveAISettingsToStorage(newSettings);
  },

  updateAIProxySettings: (roomId: string, updates: Partial<AIProxySettings>) => {
    const { aiProxySettings, setAIProxySettings } = get();
    const currentSettings = aiProxySettings.get(roomId);
    
    if (!currentSettings) {
      // デフォルト設定で初期化
      const defaultSettings: AIProxySettings = {
        enabled: true,
        greetingMessage: 'こんにちは！何かご質問がございましたら、お気軽にお声かけください。',
        awayMessage: '現在離席中です。メッセージを残していただければ、戻り次第確認いたします。',
        busyMessage: '現在取り込み中です。緊急でない場合は、しばらくお待ちください。',
        emergencyMessage: '緊急時のみ対応可能です。緊急の場合は「🚨緊急」ボタンをクリックしてください。',
        autoGreeting: true,
        commandResponse: true,
        ...updates
      };
      setAIProxySettings(roomId, defaultSettings);
    } else {
      const updatedSettings = {
        ...currentSettings,
        ...updates
      };
      setAIProxySettings(roomId, updatedSettings);
    }
  },

  getAIProxySettings: (roomId: string) => {
    const { aiProxySettings } = get();
    return aiProxySettings.get(roomId) || null;
  },

  // 自動ステータス更新
  updateLastActivity: (roomId: string, ownerId: string) => {
    const { ownerStatuses, setOwnerStatus } = get();
    let currentStatus = ownerStatuses.get(roomId);
    
    if (!currentStatus) {
      // 初期ステータス作成
      currentStatus = {
        status: 'online',
        lastActivity: new Date(),
        roomId,
        ownerId
      };
    } else {
      // 最終アクティビティ時間を更新
      currentStatus = {
        ...currentStatus,
        lastActivity: new Date()
      };
    }
    
    setOwnerStatus(roomId, currentStatus);
  },

  // ストレージ管理
  loadFromStorage: () => {
    try {
      const ownerStatuses = loadOwnerStatusFromStorage();
      const aiProxySettings = loadAISettingsFromStorage();
      
      set({ 
        ownerStatuses,
        aiProxySettings,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'データの読み込みに失敗しました' 
      });
    }
  },

  saveToStorage: () => {
    const { ownerStatuses, aiProxySettings } = get();
    try {
      saveOwnerStatusToStorage(ownerStatuses);
      saveAISettingsToStorage(aiProxySettings);
      set({ error: null });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'データの保存に失敗しました' 
      });
    }
  },

  // エラー管理
  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  }
}));