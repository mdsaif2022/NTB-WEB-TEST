import React, { useState, useEffect } from 'react';
import { realtimeDb } from '@/lib/firebaseConfig';
import { ref, get, set, remove } from 'firebase/database';

const FirebaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testFirebaseConnection = async () => {
    setConnectionStatus('checking');
    setTestResults([]);
    addTestResult('Starting Firebase connection test...');

    if (!realtimeDb) {
      setConnectionStatus('error');
      setErrorMessage('Firebase Realtime Database not initialized');
      addTestResult('❌ Firebase Realtime Database not initialized');
      return;
    }

    try {
      // Test 1: Basic connection
      addTestResult('Testing basic connection...');
      const testRef = ref(realtimeDb, 'test/connection');
      await set(testRef, { timestamp: new Date().toISOString(), test: 'connection' });
      addTestResult('✅ Basic write test passed');

      // Test 2: Read test
      addTestResult('Testing read operation...');
      const snapshot = await get(testRef);
      if (snapshot.exists()) {
        addTestResult('✅ Read test passed');
      } else {
        addTestResult('❌ Read test failed - no data found');
      }

      // Test 3: Delete test
      addTestResult('Testing delete operation...');
      await remove(testRef);
      addTestResult('✅ Delete test passed');

      // Test 4: Bookings path test
      addTestResult('Testing bookings path access...');
      const bookingsRef = ref(realtimeDb, 'bookings');
      const bookingsSnapshot = await get(bookingsRef);
      addTestResult(`✅ Bookings path accessible (${bookingsSnapshot.exists() ? 'has data' : 'empty'})`);

      setConnectionStatus('connected');
      addTestResult('🎉 All Firebase tests passed!');
    } catch (error: any) {
      setConnectionStatus('error');
      setErrorMessage(error.message);
      addTestResult(`❌ Firebase test failed: ${error.message}`);
      addTestResult(`Error code: ${error.code || 'unknown'}`);
    }
  };

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Firebase Connection Test</h3>
      
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'checking' ? 'bg-yellow-500' :
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {connectionStatus === 'checking' ? 'Checking...' :
             connectionStatus === 'connected' ? 'Connected' : 'Error'}
          </span>
        </div>
        {errorMessage && (
          <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
        )}
      </div>

      <div className="space-y-1">
        {testResults.map((result, index) => (
          <div key={index} className="text-sm font-mono">
            {result}
          </div>
        ))}
      </div>

      <button
        onClick={testFirebaseConnection}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Retest Connection
      </button>
    </div>
  );
};

export default FirebaseConnectionTest;