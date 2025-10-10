// Firebase Realtime Database Test
import { realtimeDb } from './firebaseConfig';
import { ref, set, get } from 'firebase/database';

export const testFirebaseConnection = async () => {
  console.log('Testing Firebase Realtime Database connection...');
  
  if (!realtimeDb) {
    console.error('Firebase Realtime Database not initialized');
    return false;
  }

  try {
    // Test write operation
    const testRef = ref(realtimeDb, 'test/connection');
    await set(testRef, {
      timestamp: new Date().toISOString(),
      message: 'Firebase connection test'
    });
    console.log('✅ Firebase write test successful');

    // Test read operation
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('✅ Firebase read test successful:', snapshot.val());
      
      // Clean up test data
      await set(testRef, null);
      console.log('✅ Firebase cleanup successful');
      
      return true;
    } else {
      console.error('❌ Firebase read test failed - no data');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
};

// Auto-test on import
if (typeof window !== 'undefined') {
  testFirebaseConnection();
}
