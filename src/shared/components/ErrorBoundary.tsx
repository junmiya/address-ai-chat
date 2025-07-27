'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | undefined;
  errorInfo?: React.ErrorInfo | undefined;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 無限ループを防ぐため、1回だけログ出力
    if (!this.state.hasError) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      
      // Firebase関連のエラーかチェック
      if (error.message.includes('Firebase') || error.message.includes('network')) {
        console.error('Firebase/Network error detected:', {
          error: error.message,
          emulatorMode: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR,
          authHost: process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
          firestoreHost: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST,
        });
      }
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, resetError }) => {
  const isFirebaseError = error.message.includes('Firebase') || error.message.includes('network');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              アプリケーションエラーが発生しました
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {isFirebaseError 
              ? 'Firebase接続エラーが発生しました。' 
              : 'アプリケーションで予期しないエラーが発生しました。'
            }
          </p>
          
          {isFirebaseError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">解決方法:</h4>
              <ol className="text-xs text-yellow-700 space-y-1">
                <li>1. Firebase Emulatorが起動しているか確認</li>
                <li>2. <code className="bg-yellow-100 px-1 rounded">npm run emulators</code> を実行</li>
                <li>3. ブラウザを更新してもう一度試行</li>
                <li>4. 問題が続く場合は <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false</code> に設定</li>
              </ol>
            </div>
          )}
          
          <details className="mb-3">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              エラー詳細を表示
            </summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={resetError}
            className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
          >
            ページ更新
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            環境: {process.env.NODE_ENV} | 
            Emulator: {process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR || 'false'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;