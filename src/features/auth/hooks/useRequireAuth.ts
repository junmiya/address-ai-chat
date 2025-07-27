import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

interface UseRequireAuthOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
}

export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized 
  } = useAuth();
  
  const router = useRouter();
  
  const {
    redirectTo = '/login',
    redirectIfAuthenticated = false,
  } = options;
  
  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized || isLoading) {
      return;
    }
    
    // Redirect if not authenticated (and we require auth)
    if (!redirectIfAuthenticated && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }
    
    // Redirect if authenticated (and we don't want authenticated users)
    if (redirectIfAuthenticated && isAuthenticated) {
      router.push('/dashboard');
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    isInitialized,
    redirectTo,
    redirectIfAuthenticated,
    router,
  ]);
  
  return {
    isAuthenticated,
    isLoading,
    isInitialized,
    shouldRender: isInitialized && !isLoading,
  };
};