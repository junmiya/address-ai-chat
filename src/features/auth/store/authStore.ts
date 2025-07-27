import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, LoginFormData, RegisterFormData } from '@/types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  // Auth state management
  setUser: (user: User | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Auth operations
  signIn: (data: LoginFormData) => Promise<void>;
  signUp: (data: RegisterFormData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // User profile operations
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  
  // Auth state listener
  initializeAuth: () => () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  firebaseUser: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  // State setters
  setUser: (user) => set({ user }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  // Sign in with email and password
  signIn: async (data: LoginFormData) => {
    const { setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // デバッグ情報をログ出力
      console.log('Attempting sign in with:', { email: data.email });
      console.log('Firebase Emulator Mode:', process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR);
      console.log('Auth instance:', auth);
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );
      
      // User data will be set by the auth state listener
      console.log('Sign in successful:', userCredential.user.uid);
      
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      
      // ネットワークエラーの詳細処理
      if (error instanceof Error && error.message.includes('network')) {
        console.error('Network error detected. Firebase Emulator may not be running.');
        setError('Firebase Emulatorが起動していません。npm run emulators を実行してください。');
      } else {
        const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : 'auth/unknown';
        setError(getAuthErrorMessage(errorCode));
      }
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Sign up with email and password
  signUp: async (data: RegisterFormData) => {
    const { setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      // Create user profile in Firestore
      const userData: User = {
        uid: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        region: data.region || undefined,
        organization: data.organization || undefined,
        ageGroup: data.ageGroup || undefined,
        gender: data.gender || undefined,
        createdAt: new Date() as unknown as Timestamp,
        lastLoginAt: new Date() as unknown as Timestamp,
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
      
      console.log('Sign up successful:', userCredential.user.uid);
      
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : 'auth/unknown';
      setError(getAuthErrorMessage(errorCode));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Sign out
  signOut: async () => {
    const { setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      await signOut(auth);
      
      // Clear user data
      set({
        user: null,
        firebaseUser: null,
      });
      
      console.log('Sign out successful');
      
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : 'auth/unknown';
      setError(getAuthErrorMessage(errorCode));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      await sendPasswordResetEmail(auth, email);
      
      console.log('Password reset email sent');
      
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : 'auth/unknown';
      setError(getAuthErrorMessage(errorCode));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Update user profile
  updateUserProfile: async (updates: Partial<User>) => {
    const { user, setUser, setLoading, setError } = get();
    
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = { ...user, ...updates };
      
      // Update in Firestore
      await setDoc(doc(db, 'users', user.uid), updatedUser, { merge: true });
      
      // Update local state
      setUser(updatedUser);
      
      console.log('Profile updated successfully');
      
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      setError('Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Initialize auth state listener
  initializeAuth: () => {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined') {
      console.log('Auth initialization skipped on server side');
      return () => {}; // 空の関数を返す
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const { setFirebaseUser, setUser, setLoading, setInitialized } = get();
      
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            
            // Update last login time
            await setDoc(
              doc(db, 'users', firebaseUser.uid),
              { lastLoginAt: new Date() },
              { merge: true }
            );
          } else {
            console.error('User document not found in Firestore');
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          // ネットワークエラーの場合はEmulator接続を試行
          if (error instanceof Error && error.message.includes('network')) {
            console.log('Attempting to reconnect to Firebase Emulator...');
            // Emulator再接続を試行
            const { connectToEmulators } = await import('@/lib/firebase');
            connectToEmulators();
          }
          
          setUser(null);
        }
        
        setFirebaseUser(firebaseUser);
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      
      setLoading(false);
      setInitialized(true);
    });
    
    return unsubscribe;
  },
}));

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
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
    case 'auth/user-disabled':
      return 'このアカウントは無効化されています';
    case 'auth/too-many-requests':
      return 'リクエストが多すぎます。しばらく時間をおいてから再試行してください';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました。Firebase Emulatorが起動しているか確認してください。';
    case 'auth/emulator-config-failed':
      return 'Firebase Emulatorとの接続に失敗しました。エミュレータが起動しているか確認してください。';
    default:
      return `認証エラーが発生しました (${errorCode})`;
  }
}