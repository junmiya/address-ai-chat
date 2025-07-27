'use client';

import React, { useState } from 'react';
import { LoginForm, RegisterForm } from '@/features/auth/components';

type AuthMode = 'login' | 'register';

export default function RegisterPage() {
  const [mode, setMode] = useState<AuthMode>('register');
  
  const renderForm = () => {
    switch (mode) {
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setMode('login')}
          />
        );
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
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