import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    firebaseUser,
    isLoading,
    isInitialized,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    initializeAuth,
    setError,
  } = useAuthStore();
  
  // Initialize auth state listener on first use
  useEffect(() => {
    const unsubscribe = initializeAuth();
    
    // Cleanup listener on unmount
    return unsubscribe;
  }, [initializeAuth]);
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, setError]);
  
  return {
    // Auth state
    user,
    firebaseUser,
    isLoading,
    isInitialized,
    error,
    isAuthenticated: !!user,
    
    // Auth actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    
    // Utility functions
    clearError: () => setError(null),
  };
};