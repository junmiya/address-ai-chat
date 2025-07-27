/**
 * Firebase Emulator データ投入スクリプト
 * ローカル開発用のテストデータを自動投入
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, connectFirestoreEmulator, connectAuthEmulator } = require('firebase/firestore');
const seedData = require('../firebase-seed-data.json');

// Firebase設定（エミュレータ用）
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:demo-app-id'
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// エミュレータに接続
connectAuthEmulator(auth, 'http://localhost:9099');
connectFirestoreEmulator(db, 'localhost', 8080);

async function seedDatabase() {
  console.log('🌱 Firebase Emulator にテストデータを投入開始...');
  
  try {
    // ユーザー作成とデータ投入
    console.log('👤 ユーザーデータを作成中...');
    for (const [userId, userData] of Object.entries(seedData.users)) {
      try {
        // Firebase Auth にユーザー作成
        await createUserWithEmailAndPassword(auth, userData.email, 'password123');
        console.log(`✅ ユーザー作成成功: ${userData.email}`);
        
        // Firestore にユーザープロフィール作成
        await setDoc(doc(db, 'users', userId), {
          ...userData,
          createdAt: new Date(userData.createdAt),
          lastLoginAt: new Date(userData.lastLoginAt)
        });
        console.log(`✅ プロフィール作成成功: ${userData.displayName}`);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  ユーザー既存: ${userData.email}`);
          // プロフィールのみ更新
          await setDoc(doc(db, 'users', userId), {
            ...userData,
            createdAt: new Date(userData.createdAt),
            lastLoginAt: new Date(userData.lastLoginAt)
          });
        } else {
          console.error(`❌ ユーザー作成エラー: ${userData.email}`, error.message);
        }
      }
    }
    
    // ルームデータ投入
    console.log('🏠 ルームデータを作成中...');
    for (const [roomId, roomData] of Object.entries(seedData.rooms)) {
      await setDoc(doc(db, 'rooms', roomId), {
        ...roomData,
        createdAt: new Date(roomData.createdAt)
      });
      console.log(`✅ ルーム作成成功: ${roomData.title}`);
    }
    
    // メッセージデータ投入
    console.log('💬 メッセージデータを作成中...');
    for (const [msgId, msgData] of Object.entries(seedData.messages)) {
      await setDoc(doc(db, 'messages', msgId), {
        ...msgData,
        createdAt: new Date(msgData.createdAt)
      });
      console.log(`✅ メッセージ作成成功: ${msgData.text.substring(0, 30)}...`);
    }
    
    // AI要約データ投入
    console.log('🤖 AI要約データを作成中...');
    for (const [summaryId, summaryData] of Object.entries(seedData.aiSummaries)) {
      await setDoc(doc(db, 'aiSummaries', summaryId), {
        ...summaryData,
        createdAt: new Date(summaryData.createdAt)
      });
      console.log(`✅ AI要約作成成功: ${summaryData.content.substring(0, 30)}...`);
    }
    
    // 課金データ投入
    console.log('💳 課金データを作成中...');
    for (const [userId, billingData] of Object.entries(seedData.userBilling)) {
      await setDoc(doc(db, 'userBilling', userId), {
        ...billingData,
        billingCycle: new Date(billingData.billingCycle)
      });
      console.log(`✅ 課金データ作成成功: ${userId} (${billingData.plan})`);
    }
    
    console.log('🎉 テストデータの投入が完了しました！');
    console.log('\n📋 作成されたテストアカウント:');
    console.log('Email: test1@example.com | Password: password123 | Name: 山田太郎');
    console.log('Email: test2@example.com | Password: password123 | Name: 佐藤花子'); 
    console.log('Email: test3@example.com | Password: password123 | Name: 田中次郎');
    console.log('\n🌐 Firebase Emulator UI: http://localhost:4000');
    
  } catch (error) {
    console.error('❌ データ投入中にエラーが発生しました:', error);
  }
}

// スクリプト実行
seedDatabase()
  .then(() => {
    console.log('✨ データ投入スクリプトが正常に完了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 データ投入スクリプトでエラーが発生しました:', error);
    process.exit(1);
  });