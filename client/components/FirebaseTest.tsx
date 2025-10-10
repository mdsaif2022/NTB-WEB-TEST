import React, { useState, useEffect } from 'react';
import { realtimeDb } from '@/lib/firebaseConfig';
import { ref, set, get, push, onValue, off } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { firebaseDiagnostics, DiagnosticResult } from '@/lib/firebaseDiagnostics';

const FirebaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testConnection = async () => {
    addLog('Testing Firebase Realtime Database connection...');
    
    if (!realtimeDb) {
      addLog('❌ Firebase Realtime Database not initialized');
      setIsConnected(false);
      return;
    }

    try {
      // Test write operation
      const testRef = ref(realtimeDb, 'test/connection');
      await set(testRef, {
        timestamp: new Date().toISOString(),
        message: 'Firebase connection test'
      });
      addLog('✅ Firebase write test successful');

      // Test read operation
      const snapshot = await get(testRef);
      if (snapshot.exists()) {
        addLog('✅ Firebase read test successful');
        addLog(`Data: ${JSON.stringify(snapshot.val())}`);
        
        // Clean up test data
        await set(testRef, null);
        addLog('✅ Firebase cleanup successful');
        
        setIsConnected(true);
      } else {
        addLog('❌ Firebase read test failed - no data');
        setIsConnected(false);
      }
    } catch (error: any) {
      addLog(`❌ Firebase connection test failed: ${error.message}`);
      addLog(`Error code: ${error.code}`);
      setIsConnected(false);
    }
  };

  const testBookingWrite = async () => {
    addLog('Testing booking write operation...');
    
    if (!realtimeDb) {
      addLog('❌ Firebase not available');
      return;
    }

    try {
      const bookingsRef = ref(realtimeDb, 'bookings');
      const newBookingRef = push(bookingsRef);
      
      const testBooking = {
        id: newBookingRef.key,
        user: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+880 1700-000000'
        },
        tourId: 1,
        tourName: 'Test Tour',
        from: 'Dhaka',
        to: 'Test Destination',
        date: '2024-01-01',
        persons: 1,
        selectedSeats: ['A1'],
        notes: 'Test booking from Firebase test component',
        amount: 1000,
        status: 'pending',
        transactionId: 'TEST123',
        bookingDate: new Date().toISOString()
      };

      await set(newBookingRef, testBooking);
      addLog('✅ Test booking written successfully');
      addLog(`Booking ID: ${newBookingRef.key}`);
    } catch (error: any) {
      addLog(`❌ Booking write failed: ${error.message}`);
      addLog(`Error code: ${error.code}`);
    }
  };

  const testBlogWrite = async () => {
    addLog('Testing blog write operation...');
    
    if (!realtimeDb) {
      addLog('❌ Firebase not available');
      return;
    }

    try {
      const blogsRef = ref(realtimeDb, 'blogs');
      const newBlogRef = push(blogsRef);
      
      const testBlog = {
        id: newBlogRef.key,
        title: 'Test Blog Post',
        author: {
          name: 'Test Author',
          email: 'author@example.com',
          avatar: null
        },
        content: 'This is a test blog post content.',
        excerpt: 'Test blog post excerpt',
        status: 'pending',
        submissionDate: new Date().toISOString().split('T')[0],
        category: 'Test',
        readTime: '1 min read',
        likes: 0,
        comments: 0,
        views: 0,
        images: [],
        tags: ['test']
      };

      await set(newBlogRef, testBlog);
      addLog('✅ Test blog written successfully');
      addLog(`Blog ID: ${newBlogRef.key}`);
    } catch (error: any) {
      addLog(`❌ Blog write failed: ${error.message}`);
      addLog(`Error code: ${error.code}`);
    }
  };

  const loadBookings = async () => {
    addLog('Loading bookings from Firebase...');
    
    if (!realtimeDb) {
      addLog('❌ Firebase not available');
      return;
    }

    try {
      const bookingsRef = ref(realtimeDb, 'bookings');
      const snapshot = await get(bookingsRef);
      
      if (snapshot.exists()) {
        const bookingsData = snapshot.val();
        const bookingsList = Object.values(bookingsData);
        setBookings(bookingsList);
        addLog(`✅ Loaded ${bookingsList.length} bookings`);
      } else {
        addLog('No bookings found in database');
        setBookings([]);
      }
    } catch (error: any) {
      addLog(`❌ Failed to load bookings: ${error.message}`);
    }
  };

  const loadBlogs = async () => {
    addLog('Loading blogs from Firebase...');
    
    if (!realtimeDb) {
      addLog('❌ Firebase not available');
      return;
    }

    try {
      const blogsRef = ref(realtimeDb, 'blogs');
      const snapshot = await get(blogsRef);
      
      if (snapshot.exists()) {
        const blogsData = snapshot.val();
        const blogsList = Object.values(blogsData);
        setBlogs(blogsList);
        addLog(`✅ Loaded ${blogsList.length} blogs`);
      } else {
        addLog('No blogs found in database');
        setBlogs([]);
      }
    } catch (error: any) {
      addLog(`❌ Failed to load blogs: ${error.message}`);
    }
  };

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    addLog('🔍 Running comprehensive Firebase diagnostics...');
    
    try {
      const results = await firebaseDiagnostics.runAllTests();
      setDiagnosticResults(results);
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      addLog(`✅ Diagnostics completed: ${successCount}/${totalCount} tests passed`);
      
      results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        addLog(`${icon} ${result.test}: ${result.message}`);
        if (result.details) {
          addLog(`   Details: ${JSON.stringify(result.details)}`);
        }
      });
    } catch (error: any) {
      addLog(`❌ Diagnostics failed: ${error.message}`);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const testBookingOperations = async () => {
    addLog('🔍 Testing booking operations...');
    
    try {
      const results = await firebaseDiagnostics.testBookingOperations();
      setDiagnosticResults(results);
      
      results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        addLog(`${icon} ${result.test}: ${result.message}`);
      });
    } catch (error: any) {
      addLog(`❌ Booking operations test failed: ${error.message}`);
    }
  };

  const testBlogOperations = async () => {
    addLog('🔍 Testing blog operations...');
    
    try {
      const results = await firebaseDiagnostics.testBlogOperations();
      setDiagnosticResults(results);
      
      results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        addLog(`${icon} ${result.test}: ${result.message}`);
      });
    } catch (error: any) {
      addLog(`❌ Blog operations test failed: ${error.message}`);
    }
  };

  const setupRealtimeListeners = () => {
    addLog('Setting up real-time listeners...');
    
    if (!realtimeDb) {
      addLog('❌ Firebase not available');
      return;
    }

    try {
      // Listen to bookings changes
      const bookingsRef = ref(realtimeDb, 'bookings');
      const unsubscribeBookings = onValue(bookingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const bookingsData = snapshot.val();
          const bookingsList = Object.values(bookingsData);
          setBookings(bookingsList);
          addLog(`🔄 Real-time update: ${bookingsList.length} bookings`);
        } else {
          setBookings([]);
          addLog('🔄 Real-time update: No bookings');
        }
      });

      // Listen to blogs changes
      const blogsRef = ref(realtimeDb, 'blogs');
      const unsubscribeBlogs = onValue(blogsRef, (snapshot) => {
        if (snapshot.exists()) {
          const blogsData = snapshot.val();
          const blogsList = Object.values(blogsData);
          setBlogs(blogsList);
          addLog(`🔄 Real-time update: ${blogsList.length} blogs`);
        } else {
          setBlogs([]);
          addLog('🔄 Real-time update: No blogs');
        }
      });

      addLog('✅ Real-time listeners set up successfully');

      // Cleanup function
      return () => {
        off(bookingsRef, 'value', unsubscribeBookings);
        off(blogsRef, 'value', unsubscribeBlogs);
        addLog('🧹 Real-time listeners cleaned up');
      };
    } catch (error: any) {
      addLog(`❌ Failed to setup listeners: ${error.message}`);
    }
  };

  useEffect(() => {
    testConnection();
    const cleanup = setupRealtimeListeners();
    return cleanup;
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Realtime Database Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected === true ? 'bg-green-500' : isConnected === false ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected === true ? 'Connected' : isConnected === false ? 'Disconnected' : 'Testing...'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testConnection} variant="outline" size="sm">
              Test Connection
            </Button>
            <Button onClick={runDiagnostics} variant="outline" size="sm" disabled={isRunningDiagnostics}>
              {isRunningDiagnostics ? 'Running...' : 'Run Diagnostics'}
            </Button>
            <Button onClick={testBookingOperations} variant="outline" size="sm">
              Test Bookings
            </Button>
            <Button onClick={testBlogOperations} variant="outline" size="sm">
              Test Blogs
            </Button>
            <Button onClick={testBookingWrite} variant="outline" size="sm">
              Test Booking Write
            </Button>
            <Button onClick={testBlogWrite} variant="outline" size="sm">
              Test Blog Write
            </Button>
            <Button onClick={loadBookings} variant="outline" size="sm">
              Load Bookings
            </Button>
            <Button onClick={loadBlogs} variant="outline" size="sm">
              Load Blogs
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

          {diagnosticResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Diagnostic Results:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {diagnosticResults.map((result, index) => (
                  <div key={index} className={`p-2 rounded text-sm ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center space-x-2">
                      <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.success ? '✅' : '❌'}
                      </span>
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <div className="text-gray-600 mt-1">{result.message}</div>
                    {result.details && (
                      <div className="text-xs text-gray-500 mt-1">
                        Details: {JSON.stringify(result.details)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bookings ({bookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bookings.map((booking: any, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{booking.tourName}</div>
                  <div className="text-gray-600">{booking.user?.name} - {booking.status}</div>
                  <div className="text-xs text-gray-500">ID: {booking.id}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blogs ({blogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {blogs.map((blog: any, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{blog.title}</div>
                  <div className="text-gray-600">{blog.author?.name} - {blog.status}</div>
                  <div className="text-xs text-gray-500">ID: {blog.id}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirebaseTest;
