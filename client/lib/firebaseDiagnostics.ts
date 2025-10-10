// Firebase Diagnostics and Configuration Checker
import { realtimeDb } from './firebaseConfig';
import { ref, set, get, push, onValue, off } from 'firebase/database';

export interface DiagnosticResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
}

export class FirebaseDiagnostics {
  private results: DiagnosticResult[] = [];

  addResult(test: string, success: boolean, message: string, details?: any) {
    this.results.push({ test, success, message, details });
  }

  getResults(): DiagnosticResult[] {
    return [...this.results];
  }

  clearResults() {
    this.results = [];
  }

  async runAllTests(): Promise<DiagnosticResult[]> {
    this.clearResults();
    
    console.log('🔍 Starting Firebase Diagnostics...');
    
    // Test 1: Basic connection
    await this.testBasicConnection();
    
    // Test 2: Write permissions
    await this.testWritePermissions();
    
    // Test 3: Read permissions
    await this.testReadPermissions();
    
    // Test 4: Real-time listeners
    await this.testRealtimeListeners();
    
    // Test 5: Specific data paths
    await this.testDataPaths();
    
    console.log('✅ Firebase Diagnostics completed');
    return this.getResults();
  }

  private async testBasicConnection(): Promise<void> {
    try {
      if (!realtimeDb) {
        this.addResult(
          'Basic Connection',
          false,
          'Firebase Realtime Database not initialized',
          { error: 'realtimeDb is null' }
        );
        return;
      }

      this.addResult(
        'Basic Connection',
        true,
        'Firebase Realtime Database initialized successfully',
        { databaseUrl: 'https://narayanganj-traveller-bd-default-rtdb.firebaseio.com' }
      );
    } catch (error: any) {
      this.addResult(
        'Basic Connection',
        false,
        'Firebase initialization failed',
        { error: error.message, code: error.code }
      );
    }
  }

  private async testWritePermissions(): Promise<void> {
    try {
      if (!realtimeDb) {
        this.addResult('Write Permissions', false, 'Database not available');
        return;
      }

      const testRef = ref(realtimeDb, 'diagnostics/write-test');
      const testData = {
        timestamp: new Date().toISOString(),
        test: 'write-permissions',
        message: 'Testing write access to Firebase Realtime Database'
      };

      await set(testRef, testData);
      
      this.addResult(
        'Write Permissions',
        true,
        'Successfully wrote test data to Firebase',
        { path: 'diagnostics/write-test', data: testData }
      );
    } catch (error: any) {
      this.addResult(
        'Write Permissions',
        false,
        'Failed to write data to Firebase',
        { error: error.message, code: error.code }
      );
    }
  }

  private async testReadPermissions(): Promise<void> {
    try {
      if (!realtimeDb) {
        this.addResult('Read Permissions', false, 'Database not available');
        return;
      }

      const testRef = ref(realtimeDb, 'diagnostics/write-test');
      const snapshot = await get(testRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.addResult(
          'Read Permissions',
          true,
          'Successfully read data from Firebase',
          { data }
        );
      } else {
        this.addResult(
          'Read Permissions',
          false,
          'No data found at test path',
          { path: 'diagnostics/write-test' }
        );
      }
    } catch (error: any) {
      this.addResult(
        'Read Permissions',
        false,
        'Failed to read data from Firebase',
        { error: error.message, code: error.code }
      );
    }
  }

  private async testRealtimeListeners(): Promise<void> {
    try {
      if (!realtimeDb) {
        this.addResult('Real-time Listeners', false, 'Database not available');
        return;
      }

      const testRef = ref(realtimeDb, 'diagnostics/realtime-test');
      let listenerTriggered = false;

      // Set up listener
      const unsubscribe = onValue(testRef, (snapshot) => {
        listenerTriggered = true;
        console.log('Real-time listener triggered:', snapshot.val());
      });

      // Write test data
      await set(testRef, {
        timestamp: new Date().toISOString(),
        test: 'realtime-listeners'
      });

      // Wait a bit for listener to trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Cleanup
      unsubscribe();
      off(testRef, 'value', unsubscribe);

      if (listenerTriggered) {
        this.addResult(
          'Real-time Listeners',
          true,
          'Real-time listeners working correctly',
          { listenerTriggered: true }
        );
      } else {
        this.addResult(
          'Real-time Listeners',
          false,
          'Real-time listeners not triggering',
          { listenerTriggered: false }
        );
      }
    } catch (error: any) {
      this.addResult(
        'Real-time Listeners',
        false,
        'Failed to test real-time listeners',
        { error: error.message, code: error.code }
      );
    }
  }

  private async testDataPaths(): Promise<void> {
    const paths = ['tours', 'blogs', 'bookings', 'settings', 'notifications'];
    
    for (const path of paths) {
      try {
        if (!realtimeDb) {
          this.addResult(`Data Path: ${path}`, false, 'Database not available');
          continue;
        }

        const pathRef = ref(realtimeDb, path);
        const snapshot = await get(pathRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const count = Array.isArray(data) ? data.length : Object.keys(data || {}).length;
          this.addResult(
            `Data Path: ${path}`,
            true,
            `Found ${count} items in ${path}`,
            { path, count, hasData: true }
          );
        } else {
          this.addResult(
            `Data Path: ${path}`,
            true,
            `Path ${path} exists but is empty`,
            { path, count: 0, hasData: false }
          );
        }
      } catch (error: any) {
        this.addResult(
          `Data Path: ${path}`,
          false,
          `Failed to access ${path}`,
          { error: error.message, code: error.code }
        );
      }
    }
  }

  // Test specific booking and blog operations
  async testBookingOperations(): Promise<DiagnosticResult[]> {
    this.clearResults();
    
    try {
      if (!realtimeDb) {
        this.addResult('Booking Operations', false, 'Database not available');
        return this.getResults();
      }

      // Test booking write
      const bookingsRef = ref(realtimeDb, 'bookings');
      const newBookingRef = push(bookingsRef);
      
      const testBooking = {
        id: newBookingRef.key,
        user: {
          name: 'Diagnostic Test User',
          email: 'test@diagnostics.com',
          phone: '+880 1700-000000'
        },
        tourId: 999,
        tourName: 'Diagnostic Test Tour',
        from: 'Test City',
        to: 'Test Destination',
        date: '2024-01-01',
        persons: 1,
        selectedSeats: ['A1'],
        notes: 'This is a diagnostic test booking',
        amount: 1000,
        status: 'pending',
        transactionId: 'DIAGNOSTIC123',
        bookingDate: new Date().toISOString()
      };

      await set(newBookingRef, testBooking);
      this.addResult(
        'Booking Write Test',
        true,
        'Successfully created test booking',
        { bookingId: newBookingRef.key }
      );

      // Test booking read
      const snapshot = await get(newBookingRef);
      if (snapshot.exists()) {
        this.addResult(
          'Booking Read Test',
          true,
          'Successfully read test booking',
          { data: snapshot.val() }
        );
      } else {
        this.addResult(
          'Booking Read Test',
          false,
          'Failed to read test booking'
        );
      }

      // Cleanup
      await set(newBookingRef, null);
      this.addResult(
        'Booking Cleanup',
        true,
        'Successfully cleaned up test booking'
      );

    } catch (error: any) {
      this.addResult(
        'Booking Operations',
        false,
        'Booking operations failed',
        { error: error.message, code: error.code }
      );
    }

    return this.getResults();
  }

  async testBlogOperations(): Promise<DiagnosticResult[]> {
    this.clearResults();
    
    try {
      if (!realtimeDb) {
        this.addResult('Blog Operations', false, 'Database not available');
        return this.getResults();
      }

      // Test blog write
      const blogsRef = ref(realtimeDb, 'blogs');
      const newBlogRef = push(blogsRef);
      
      const testBlog = {
        id: newBlogRef.key,
        title: 'Diagnostic Test Blog Post',
        author: {
          name: 'Diagnostic Test Author',
          email: 'author@diagnostics.com',
          avatar: null
        },
        content: 'This is a diagnostic test blog post content.',
        excerpt: 'Diagnostic test blog post excerpt',
        status: 'pending',
        submissionDate: new Date().toISOString().split('T')[0],
        category: 'Diagnostic',
        readTime: '1 min read',
        likes: 0,
        comments: 0,
        views: 0,
        images: [],
        tags: ['diagnostic', 'test']
      };

      await set(newBlogRef, testBlog);
      this.addResult(
        'Blog Write Test',
        true,
        'Successfully created test blog',
        { blogId: newBlogRef.key }
      );

      // Test blog read
      const snapshot = await get(newBlogRef);
      if (snapshot.exists()) {
        this.addResult(
          'Blog Read Test',
          true,
          'Successfully read test blog',
          { data: snapshot.val() }
        );
      } else {
        this.addResult(
          'Blog Read Test',
          false,
          'Failed to read test blog'
        );
      }

      // Cleanup
      await set(newBlogRef, null);
      this.addResult(
        'Blog Cleanup',
        true,
        'Successfully cleaned up test blog'
      );

    } catch (error: any) {
      this.addResult(
        'Blog Operations',
        false,
        'Blog operations failed',
        { error: error.message, code: error.code }
      );
    }

    return this.getResults();
  }
}

// Export singleton instance
export const firebaseDiagnostics = new FirebaseDiagnostics();
