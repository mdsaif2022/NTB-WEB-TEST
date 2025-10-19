import React, { useState } from 'react';
import { realtimeDb } from '@/lib/firebaseConfig';
import { ref, get, set, remove } from 'firebase/database';
import { useAuth } from '@/contexts/FirebaseAuthContext';

const FirebaseRulesChecker: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const { currentUser } = useAuth();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testRules = async () => {
    if (!currentUser) {
      addResult('❌ No authenticated user');
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    addResult('🔍 Testing Firebase rules...');

    try {
      // Test tours write
      addResult('Testing tours write access...');
      const toursRef = ref(realtimeDb, 'tours/test-rules-check');
      await set(toursRef, { test: true, userId: currentUser.uid });
      addResult('✅ Tours write: SUCCESS');
      
      // Test tours read
      addResult('Testing tours read access...');
      const snapshot = await get(toursRef);
      addResult('✅ Tours read: SUCCESS');
      
      // Clean up
      await remove(toursRef);
      addResult('✅ Tours delete: SUCCESS');

      // Test bookings
      addResult('Testing bookings access...');
      const bookingsRef = ref(realtimeDb, 'bookings/test-rules-check');
      await set(bookingsRef, { test: true, userId: currentUser.uid });
      addResult('✅ Bookings write: SUCCESS');
      await remove(bookingsRef);
      addResult('✅ Bookings delete: SUCCESS');

      addResult('🎉 All rule tests passed! Your Firebase rules are working correctly.');

    } catch (error: any) {
      addResult(`❌ Rule test failed: ${error.message}`);
      addResult(`Error code: ${error.code}`);
      
      if (error.code === 'PERMISSION_DENIED') {
        addResult('💡 PERMISSION_DENIED means your Firebase rules are blocking access');
        addResult('💡 Make sure you have applied the simplified rules');
        addResult('💡 Check Firebase Console → Realtime Database → Rules');
      }
    }

    setIsTesting(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-semibold mb-4">Firebase Rules Checker</h3>
      
      <button
        onClick={testRules}
        disabled={isTesting}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Test Firebase Rules'}
      </button>

      <div className="mt-4 space-y-1">
        {testResults.map((result, index) => (
          <div key={index} className="text-sm font-mono">
            {result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirebaseRulesChecker;
