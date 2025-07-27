'use client';

import React, { useState } from 'react';
import { LoginForm, ResetPasswordForm } from '@/features/auth/components';

type AuthMode = 'login' | 'reset';

export default function ResetPage() {
  const [mode, setMode] = useState<AuthMode>('reset');
  
  const renderForm = () => {
    switch (mode) {
      case 'reset':
        return (
          <ResetPasswordForm
            onSwitchToLogin={() => setMode('login')}
          />
        );
      case 'login':
        return (
          <LoginForm
            onSwitchToReset={() => setMode('reset')}
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