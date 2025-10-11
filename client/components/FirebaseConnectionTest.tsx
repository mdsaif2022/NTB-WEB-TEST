import React, { useState, useEffect } from 'react';
import { realtimeDb } from '@/lib/firebaseConfig';
import { ref, set, get, remove, push } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FirebaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testConnection = async () => {
    addLog('🔍 Testing Firebase Realtime Database connection...');
    
    if (!realtimeDb) {
      addLog('❌ Firebase Realtime Database not initialized');
      setConnectionStatus('failed');
      return;
    }

    try {
      addLog('✅ Firebase Realtime Database is initialized');
      addLog(`📡 Database URL: ${realtimeDb.app.options.databaseURL}`);
      
      // Test basic read/write operation
      const testRef = ref(realtimeDb, 'connectionTest');
      const testData = {
        timestamp: new Date().toISOString(),
        message: 'Connection test successful'
      };
      
      addLog('📝 Writing test data...');
      await set(testRef, testData);
      addLog('✅ Test data written successfully');
      
      addLog('📖 Reading test data...');
      const snapshot = await get(testRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        addLog(`✅ Test data read successfully: ${JSON.stringify(data)}`);
      } else {
        addLog('❌ Test data not found after write');
      }
      
      addLog('🗑️ Cleaning up test data...');
      await remove(testRef);
      addLog('✅ Test data cleaned up');
      
      setConnectionStatus('connected');
      addLog('🎉 Firebase connection test completed successfully!');
      
    } catch (error: any) {
      addLog(`❌ Firebase connection test failed: ${error.message}`);
      addLog(`❌ Error code: ${error.code || 'Unknown'}`);
      addLog(`❌ Error details: ${JSON.stringify(error)}`);
      setConnectionStatus('failed');
    }
  };

  const testAdminOperations = async () => {
    setIsRunningTest(true);
    addLog('🔍 Testing admin operations...');
    
    if (!realtimeDb) {
      addLog('❌ Firebase Realtime Database not available');
      setIsRunningTest(false);
      return;
    }

    try {
      // Test blog operations
      addLog('📝 Testing blog operations...');
      const blogRef = ref(realtimeDb, 'blogs/test-blog');
      const blogData = {
        id: 'test-blog',
        title: 'Test Blog Post',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await set(blogRef, blogData);
      addLog('✅ Blog created successfully');
      
      // Test blog approval
      await set(blogRef, { ...blogData, status: 'approved' });
      addLog('✅ Blog approved successfully');
      
      // Test blog rejection
      await set(blogRef, { ...blogData, status: 'rejected', rejectionReason: 'Test rejection' });
      addLog('✅ Blog rejected successfully');
      
      // Clean up
      await remove(blogRef);
      addLog('✅ Blog test data cleaned up');
      
      // Test tour operations
      addLog('🏞️ Testing tour operations...');
      const tourRef = ref(realtimeDb, 'tours/test-tour');
      const tourData = {
        id: 'test-tour',
        name: 'Test Tour',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      await set(tourRef, tourData);
      addLog('✅ Tour created successfully');
      
      // Test tour update
      await set(tourRef, { ...tourData, status: 'inactive' });
      addLog('✅ Tour updated successfully');
      
      // Clean up
      await remove(tourRef);
      addLog('✅ Tour test data cleaned up');
      
      // Test booking operations
      addLog('📅 Testing booking operations...');
      const bookingRef = ref(realtimeDb, 'bookings/test-booking');
      const bookingData = {
        id: 'test-booking',
        user: { name: 'Test User', email: 'test@example.com' },
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await set(bookingRef, bookingData);
      addLog('✅ Booking created successfully');
      
      // Test booking approval
      await set(bookingRef, { ...bookingData, status: 'confirmed' });
      addLog('✅ Booking approved successfully');
      
      // Clean up
      await remove(bookingRef);
      addLog('✅ Booking test data cleaned up');
      
      addLog('🎉 All admin operations tested successfully!');
      
    } catch (error: any) {
      addLog(`❌ Admin operations test failed: ${error.message}`);
      addLog(`❌ Error code: ${error.code || 'Unknown'}`);
      addLog(`❌ Error details: ${JSON.stringify(error)}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-emerald-800">Firebase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Connection Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 
              connectionStatus === 'failed' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'failed' ? 'Failed' : 'Checking...'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testConnection} variant="outline" size="sm">
              Test Connection
            </Button>
            <Button 
              onClick={testAdminOperations} 
              variant="outline" 
              size="sm" 
              disabled={isRunningTest || connectionStatus !== 'connected'}
            >
              {isRunningTest ? 'Testing...' : 'Test Admin Operations'}
            </Button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Logs:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono text-gray-700">
                {result}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseConnectionTest;
