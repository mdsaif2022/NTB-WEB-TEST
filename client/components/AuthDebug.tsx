import React from 'react';
import { useAuth } from '@/contexts/FirebaseAuthContext';

const AuthDebug: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-4">Authentication Debug</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Current User:</strong> {currentUser ? '✅ Logged In' : '❌ Not Logged In'}
        </div>
        
        {currentUser && (
          <>
            <div>
              <strong>Email:</strong> {currentUser.email}
            </div>
            <div>
              <strong>UID:</strong> {currentUser.uid}
            </div>
            <div>
              <strong>Email Verified:</strong> {currentUser.emailVerified ? '✅ Yes' : '❌ No'}
            </div>
          </>
        )}
        
        <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
          <strong>Instructions:</strong>
          <br />1. Make sure you're logged in to the admin panel
          <br />2. Check if your email is verified
          <br />3. Copy your UID for Firebase rules setup
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
