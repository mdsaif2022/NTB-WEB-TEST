import React, { useState } from 'react';
import { realtimeDb } from '@/lib/firebaseConfig';
import { ref, set, get, push, remove } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FirebaseDiagnostics: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testBookingWrite = async () => {
    setIsRunning(true);
    addLog('🔍 Testing booking write permissions...');

    if (!realtimeDb) {
      addLog('❌ Firebase Realtime Database not available');
      setIsRunning(false);
      return;
    }

    try {
      // Test basic write
      const testRef = ref(realtimeDb, 'test/booking-write');
      await set(testRef, { 
        test: true, 
        timestamp: new Date().toISOString(),
        message: 'Test booking write permission'
      });
      addLog('✅ Basic write test passed');

      // Test booking write
      const bookingsRef = ref(realtimeDb, 'bookings');
      const newBookingRef = push(bookingsRef);
      const testBooking = {
        id: newBookingRef.key,
        user: { name: 'Test User', email: 'test@example.com', phone: '1234567890' },
        tourId: 999,
        tourName: 'Test Tour',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await set(newBookingRef, testBooking);
      addLog('✅ Booking write test passed');

      // Clean up test data
      await remove(testRef);
      await remove(newBookingRef);
      addLog('✅ Test data cleaned up');

    } catch (error: any) {
      addLog(`❌ Booking write test failed: ${error.message}`);
      addLog(`❌ Error code: ${error.code}`);
      addLog(`❌ Error details: ${JSON.stringify(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testDatabaseConnection = async () => {
    setIsRunning(true);
    addLog('🔍 Testing database connection...');

    if (!realtimeDb) {
      addLog('❌ Firebase Realtime Database not available');
      setIsRunning(false);
      return;
    }

    try {
      const testRef = ref(realtimeDb, 'test/connection');
      await set(testRef, { 
        test: true, 
        timestamp: new Date().toISOString() 
      });
      addLog('✅ Database connection test passed');

      const snapshot = await get(testRef);
      if (snapshot.exists()) {
        addLog('✅ Database read test passed');
      }

      await remove(testRef);
      addLog('✅ Test data cleaned up');

    } catch (error: any) {
      addLog(`❌ Database connection test failed: ${error.message}`);
      addLog(`❌ Error code: ${error.code}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-emerald-800">Firebase Realtime Database Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Database Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              realtimeDb ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {realtimeDb ? 'Connected' : 'Not Available'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testDatabaseConnection} 
              variant="outline" 
              size="sm"
              disabled={isRunning}
            >
              Test Connection
            </Button>
            <Button 
              onClick={testBookingWrite} 
              variant="outline" 
              size="sm"
              disabled={isRunning}
            >
              Test Booking Write
            </Button>
            <Button 
              onClick={clearLogs} 
              variant="outline" 
              size="sm"
            >
              Clear Logs
            </Button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Logs:</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-sm">No tests run yet. Click a test button above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-700">
                  {result}
                </div>
              ))
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Click "Test Connection" to verify basic database access</li>
              <li>2. Click "Test Booking Write" to test booking write permissions</li>
              <li>3. Check the logs for any permission errors</li>
              <li>4. If errors occur, update Firebase Realtime Database rules</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseDiagnostics;
