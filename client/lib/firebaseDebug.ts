// Firebase Debug Utilities
import { realtimeDb } from './firebaseConfig';
import { ref, set, get, remove } from 'firebase/database';

export const firebaseDebug = {
  // Check Firebase connection
  checkConnection() {
    console.log('🔍 Firebase Debug Check:');
    console.log('========================');
    console.log('Realtime Database:', realtimeDb ? '✅ Available' : '❌ Not available');
    
    if (realtimeDb) {
      console.log('Database URL:', realtimeDb.app.options.databaseURL);
      console.log('Project ID:', realtimeDb.app.options.projectId);
      console.log('App Name:', realtimeDb.app.name);
    }
    
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================');
    
    return realtimeDb !== null;
  },

  // Test basic Firebase operations
  async testBasicOperations() {
    console.log('🧪 Testing Basic Firebase Operations:');
    console.log('====================================');
    
    if (!realtimeDb) {
      console.error('❌ Firebase Realtime Database not available');
      return false;
    }

    try {
      // Test 1: Write operation
      console.log('📝 Test 1: Write operation...');
      const testRef = ref(realtimeDb, 'debug/test');
      const testData = {
        message: 'Firebase test successful',
        timestamp: new Date().toISOString()
      };
      
      await set(testRef, testData);
      console.log('✅ Write operation successful');
      
      // Test 2: Read operation
      console.log('📖 Test 2: Read operation...');
      const snapshot = await get(testRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('✅ Read operation successful:', data);
      } else {
        console.error('❌ Read operation failed: No data found');
        return false;
      }
      
      // Test 3: Update operation
      console.log('🔄 Test 3: Update operation...');
      const updatedData = {
        ...testData,
        updated: true,
        updateTimestamp: new Date().toISOString()
      };
      
      await set(testRef, updatedData);
      console.log('✅ Update operation successful');
      
      // Test 4: Delete operation
      console.log('🗑️ Test 4: Delete operation...');
      await remove(testRef);
      console.log('✅ Delete operation successful');
      
      console.log('🎉 All basic operations successful!');
      return true;
      
    } catch (error: any) {
      console.error('❌ Firebase operations test failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error));
      return false;
    }
  },

  // Test admin-specific operations
  async testAdminOperations() {
    console.log('👨‍💼 Testing Admin Operations:');
    console.log('==============================');
    
    if (!realtimeDb) {
      console.error('❌ Firebase Realtime Database not available');
      return false;
    }

    try {
      // Test blog operations
      console.log('📝 Testing blog operations...');
      const blogRef = ref(realtimeDb, 'blogs/debug-test');
      const blogData = {
        id: 'debug-test',
        title: 'Debug Test Blog',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await set(blogRef, blogData);
      console.log('✅ Blog created');
      
      // Test blog approval
      await set(blogRef, { ...blogData, status: 'approved' });
      console.log('✅ Blog approved');
      
      // Test blog rejection
      await set(blogRef, { ...blogData, status: 'rejected', rejectionReason: 'Debug test' });
      console.log('✅ Blog rejected');
      
      await remove(blogRef);
      console.log('✅ Blog test cleaned up');
      
      // Test tour operations
      console.log('🏞️ Testing tour operations...');
      const tourRef = ref(realtimeDb, 'tours/debug-test');
      const tourData = {
        id: 'debug-test',
        name: 'Debug Test Tour',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      await set(tourRef, tourData);
      console.log('✅ Tour created');
      
      await set(tourRef, { ...tourData, status: 'inactive' });
      console.log('✅ Tour updated');
      
      await remove(tourRef);
      console.log('✅ Tour test cleaned up');
      
      // Test booking operations
      console.log('📅 Testing booking operations...');
      const bookingRef = ref(realtimeDb, 'bookings/debug-test');
      const bookingData = {
        id: 'debug-test',
        user: { name: 'Debug User', email: 'debug@test.com' },
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await set(bookingRef, bookingData);
      console.log('✅ Booking created');
      
      await set(bookingRef, { ...bookingData, status: 'confirmed' });
      console.log('✅ Booking approved');
      
      await remove(bookingRef);
      console.log('✅ Booking test cleaned up');
      
      console.log('🎉 All admin operations successful!');
      return true;
      
    } catch (error: any) {
      console.error('❌ Admin operations test failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error));
      return false;
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Running All Firebase Tests:');
    console.log('==============================');
    
    const connectionOk = this.checkConnection();
    if (!connectionOk) {
      console.error('❌ Firebase connection failed, skipping tests');
      return false;
    }
    
    const basicOpsOk = await this.testBasicOperations();
    if (!basicOpsOk) {
      console.error('❌ Basic operations failed, skipping admin tests');
      return false;
    }
    
    const adminOpsOk = await this.testAdminOperations();
    if (!adminOpsOk) {
      console.error('❌ Admin operations failed');
      return false;
    }
    
    console.log('🎉 All tests passed successfully!');
    return true;
  }
};

// Auto-run tests when imported
if (typeof window !== 'undefined') {
  console.log('🔍 Firebase Debug Module Loaded');
  console.log('Run firebaseDebug.runAllTests() to test Firebase operations');
}
