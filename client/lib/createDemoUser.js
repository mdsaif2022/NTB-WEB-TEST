// Demo user creation script for testing Firebase Authentication
// Run this in browser console after setting up Firebase

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export const createDemoUser = async () => {
  try {
    // Create demo user account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'demo@ntbtours.com', 
      'demo123'
    );
    
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, {
      displayName: 'Demo User'
    });
    
    // Store user data in Firestore
    const userData = {
      uid: user.uid,
      name: 'Demo User',
      email: 'demo@ntbtours.com',
      phone: '+8801234567890',
      verified: true,
      createdAt: serverTimestamp(),
      emailVerified: true,
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    console.log('Demo user created successfully:', user.email);
    return user;
    
  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  }
};

// Usage instructions:
// 1. Import this function in your component or run in browser console
// 2. Call createDemoUser() to create a test user
// 3. Use email: demo@ntbtours.com, password: demo123 to login
