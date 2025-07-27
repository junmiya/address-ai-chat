import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Emulator接続を遅延実行する関数
export function connectToEmulators() {
  // ブラウザ環境かつEmulatorモードの場合のみ実行
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR !== 'true') {
    console.log('Emulator mode disabled or not in browser environment');
    return;
  }
  
  // グローバル変数で接続状態管理
  const globalRef = globalThis as unknown as {
    _firebaseEmulatorConnected?: boolean;
  };
  
  if (globalRef._firebaseEmulatorConnected) {
    console.log('Firebase emulators already connected');
    return;
  }
  
  try {
    console.log('Firebase Emulator mode detected');
    console.log('Auth Emulator Host:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST);
    console.log('Firestore Emulator Host:', process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST);
    
    // Connect to Auth emulator
    if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
      console.log('Connecting to Auth emulator...');
      connectAuthEmulator(auth, `http://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`, {
        disableWarnings: true
      });
      console.log('Auth emulator connected successfully');
    }
    
    // Connect to Firestore emulator
    if (process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST) {
      console.log('Connecting to Firestore emulator...');
      const [host, port] = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST.split(':');
      connectFirestoreEmulator(db, host, parseInt(port));
      console.log('Firestore emulator connected successfully');
    }
    
    globalRef._firebaseEmulatorConnected = true;
    console.log('All Firebase emulators connected');
    
  } catch (error) {
    console.error('Firebase emulator connection error:', error);
    console.warn('Falling back to production Firebase config');
  }
}

// ブラウザ環境でのみ遅延実行
if (typeof window !== 'undefined') {
  // DOM読み込み後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connectToEmulators);
  } else {
    // すでに読み込み完了している場合は即座に実行
    setTimeout(connectToEmulators, 0);
  }
}

export default app;