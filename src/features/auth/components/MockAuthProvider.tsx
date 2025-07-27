'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface MockAuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: Partial<User> & { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const MockAuthContext = createContext<MockAuthContextType | null>(null);

interface MockAuthProviderProps {
  children: React.ReactNode;
}

// モックユーザーデータ
const MOCK_USERS: User[] = [
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

export function MockAuthProvider({ children }: MockAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初期化処理：localStorageから既存のセッションを復元
    const savedUser = localStorage.getItem('mockAuthUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('mockAuthUser');
      }
    }
    setIsInitialized(true);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 遅延を追加してリアルな認証体験を提供
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // パスワード検証（固定パスワード）
      if (password !== 'password123') {
        throw new Error('auth/wrong-password');
      }

      // ユーザー検索
      const foundUser = MOCK_USERS.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('auth/user-not-found');
      }

      // ログイン成功
      const loggedInUser = {
        ...foundUser,
        lastLoginAt: new Date() as unknown as Timestamp,
      };
      
      setUser(loggedInUser);
      localStorage.setItem('mockAuthUser', JSON.stringify(loggedInUser));
      
      console.log('Mock sign in successful:', loggedInUser.email);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'auth/unknown';
      setError(getMockErrorMessage(errorMessage));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: Partial<User> & { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // パスワード検証
      if (userData.password.length < 6) {
        throw new Error('auth/weak-password');
      }

      // 既存ユーザー検証
      const existingUser = MOCK_USERS.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('auth/email-already-in-use');
      }

      // 新規ユーザー作成
      const newUser: User = {
        uid: `mock-user-${Date.now()}`,
        email: userData.email,
        displayName: userData.displayName || 'New User',
        region: userData.region,
        organization: userData.organization,
        ageGroup: userData.ageGroup,
        gender: userData.gender,
        createdAt: new Date() as unknown as Timestamp,
        lastLoginAt: new Date() as unknown as Timestamp,
      };

      // モックデータベースに追加（メモリ内のみ）
      MOCK_USERS.push(newUser);
      
      setUser(newUser);
      localStorage.setItem('mockAuthUser', JSON.stringify(newUser));
      
      console.log('Mock sign up successful:', newUser.email);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'auth/unknown';
      setError(getMockErrorMessage(errorMessage));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('mockAuthUser');
      setError(null);
      
      console.log('Mock sign out successful');
      
    } catch (error) {
      console.error('Mock sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: MockAuthContextType = {
    user,
    isLoading,
    isInitialized,
    signIn,
    signUp,
    signOut,
    error,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }
  return context;
}

function getMockErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'アカウントが見つかりません';
    case 'auth/wrong-password':
      return 'パスワードが間違っています';
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています';
    case 'auth/weak-password':
      return 'パスワードが弱すぎます（6文字以上で入力してください）';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    default:
      return '認証エラーが発生しました（モック認証）';
  }
}