'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/shared/components';
import { useMockAuth } from './MockAuthProvider';
import { LoginFormData } from '@/types';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToReset?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onSwitchToReset,
}) => {
  const router = useRouter();
  const { signIn, isLoading, error } = useMockAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<LoginFormData>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof LoginFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {};
    
    if (!formData.email) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'メールアドレスの形式が正しくありません';
    }
    
    if (!formData.password) {
      errors.password = 'パスワードを入力してください';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await signIn(formData.email, formData.password);
      
      // Success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      // Error is handled by the mock auth provider
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          ログイン
        </h2>
        <p className="mt-2 text-sm text-gray-600 text-center">
          アカウントにサインインしてください
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
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          placeholder="example@email.com"
          data-testid="email"
          required
        />
        
        <Input
          label="パスワード"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          placeholder="パスワードを入力"
          data-testid="password"
          required
        />
        
        <Button
          type="submit"
          className="w-full"
          data-testid="login-button"
          isLoading={isLoading}
          disabled={isLoading}
        >
          ログイン
        </Button>
      </form>
      
      <div className="text-center space-y-2">
        {onSwitchToReset && (
          <button
            type="button"
            onClick={onSwitchToReset}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            パスワードを忘れた場合
          </button>
        )}
        
        {onSwitchToRegister && (
          <div className="text-sm text-gray-600">
            アカウントをお持ちでない場合{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              新規登録
            </button>
          </div>
        )}
      </div>
    </div>
  );
};