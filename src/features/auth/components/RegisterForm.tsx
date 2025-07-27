'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select } from '@/shared/components';
import { useMockAuth } from './MockAuthProvider';
import { RegisterFormData } from '@/types';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const ageOptions = [
  { value: 'age_10s', label: '10代' },
  { value: 'age_20s', label: '20代' },
  { value: 'age_30s', label: '30代' },
  { value: 'age_40s', label: '40代' },
  { value: 'age_50s', label: '50代' },
  { value: 'age_60s_plus', label: '60代以上' },
];

const genderOptions = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
  { value: 'prefer_not_to_say', label: '回答しない' },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const router = useRouter();
  const { signUp, isLoading, error } = useMockAuth();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    region: '',
    organization: '',
    ageGroup: undefined,
    gender: undefined,
  });
  
  const [formErrors, setFormErrors] = useState<Partial<RegisterFormData>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value || undefined 
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof RegisterFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Partial<RegisterFormData> = {};
    
    if (!formData.email) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'メールアドレスの形式が正しくありません';
    }
    
    if (!formData.password) {
      errors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      errors.password = 'パスワードは6文字以上で入力してください';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'パスワード（確認）を入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }
    
    if (!formData.displayName) {
      errors.displayName = '表示名を入力してください';
    } else if (formData.displayName.length < 2) {
      errors.displayName = '表示名は2文字以上で入力してください';
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
      await signUp(formData);
      
      // Success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      // Error is handled by the store
      console.error('Registration failed:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          新規登録
        </h2>
        <p className="mt-2 text-sm text-gray-600 text-center">
          アカウントを作成してください
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}
        
        <Input
          label="メールアドレス *"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          placeholder="example@email.com"
          required
        />
        
        <Input
          label="表示名 *"
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          error={formErrors.displayName}
          placeholder="山田太郎"
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="パスワード *"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            placeholder="6文字以上"
            required
          />
          
          <Input
            label="パスワード（確認） *"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            placeholder="パスワードを再入力"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="地域"
            type="text"
            name="region"
            value={formData.region || ''}
            onChange={handleChange}
            error={formErrors.region}
            placeholder="東京都"
          />
          
          <Input
            label="組織・会社"
            type="text"
            name="organization"
            value={formData.organization || ''}
            onChange={handleChange}
            error={formErrors.organization}
            placeholder="株式会社○○"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="年代"
            name="ageGroup"
            value={formData.ageGroup || ''}
            onChange={handleChange}
            options={ageOptions}
            placeholder="選択してください"
          />
          
          <Select
            label="性別"
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            options={genderOptions}
            placeholder="選択してください"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          アカウント作成
        </Button>
      </form>
      
      {onSwitchToLogin && (
        <div className="text-center">
          <div className="text-sm text-gray-600">
            既にアカウントをお持ちの場合{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ログイン
            </button>
          </div>
        </div>
      )}
    </div>
  );
};