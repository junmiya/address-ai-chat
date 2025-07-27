'use client';

import React, { useState } from 'react';
import { LoginForm, RegisterForm, ResetPasswordForm } from '@/features/auth/components';

type AuthMode = 'login' | 'register' | 'reset';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  
  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
            onSwitchToReset={() => setMode('reset')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setMode('login')}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm
            onSwitchToLogin={() => setMode('login')}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          {renderForm()}
        </div>
      </div>
    </div>
  );
}