'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/shared/components';
import { useAuthStore } from '../store/authStore';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { resetPassword, isLoading, error } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };
  
  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError('メールアドレスを入力してください');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('メールアドレスの形式が正しくありません');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the store
      console.error('Password reset failed:', error);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            メールを送信しました
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {email} にパスワードリセットのリンクを送信しました。
            <br />
            メールをご確認ください。
          </p>
        </div>
        
        {onSwitchToLogin && (
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ログイン画面に戻る
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          パスワードリセット
        </h2>
        <p className="mt-2 text-sm text-gray-600 text-center">
          登録済みのメールアドレスを入力してください
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}
        
        <Input
          label="メールアドレス"
          type="email"
          value={email}
          onChange={handleChange}
          error={emailError}
          placeholder="example@email.com"
          required
        />
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          リセットメールを送信
        </Button>
      </form>
      
      {onSwitchToLogin && (
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ログイン画面に戻る
          </button>
        </div>
      )}
    </div>
  );
};