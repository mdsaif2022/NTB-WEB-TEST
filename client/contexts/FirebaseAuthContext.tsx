import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isDemoConfig, getEmailLinkSettings } from '@/lib/firebaseConfig';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  uid: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  createdAt: any;
  emailVerified: boolean;
}

interface FirebaseAuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (name: string, phone: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  // Passwordless authentication methods
  sendPasswordlessSignInLink: (email: string) => Promise<void>;
  signInWithEmailLink: (email: string, emailLink: string) => Promise<void>;
  isSignInWithEmailLink: (emailLink: string) => boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if Firebase is properly initialized
  const isFirebaseAvailable = auth && db;

  // Fetch user data from Firestore
  const fetchUserData = async (user: User): Promise<UserData | null> => {
    if (!isFirebaseAvailable) {
      console.warn('Firebase not available, returning null user data');
      return null;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (currentUser) {
      const data = await fetchUserData(currentUser);
      setUserData(data);
    }
  };

  // Register new user
  const register = async (name: string, email: string, phone: string, password: string) => {
    if (!isFirebaseAvailable) {
      if (isDemoConfig) {
        toast({
          title: "Demo Mode",
          description: "Firebase is in demo mode. Please set up a real Firebase project to enable user registration.",
          variant: "default",
        });
      } else {
        toast({
          title: "Firebase Not Configured",
          description: "Please configure Firebase to enable user registration.",
          variant: "destructive",
        });
      }
      throw new Error('Firebase not available');
    }
    
    try {
      setLoading(true);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: name,
      });

      // Send email verification
      await sendEmailVerification(user);

      // Store user data in Firestore
      const userData = {
        uid: user.uid,
        name,
        email,
        phone,
        verified: false, // Will be true after email verification
        createdAt: serverTimestamp(),
        emailVerified: false,
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
        variant: "default",
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    if (!isFirebaseAvailable) {
      toast({
        title: "Firebase Not Configured",
        description: "Please configure Firebase to enable user login.",
        variant: "destructive",
      });
      throw new Error('Firebase not available');
    }
    
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        toast({
          title: "Email Verification Required",
          description: "Please verify your email before accessing the website. Check your email for the verification link.",
          variant: "destructive",
        });
        throw new Error('Email not verified');
      }

      // Fetch user data from Firestore
      const userData = await fetchUserData(user);
      setUserData(userData);

      // Update Firestore with email verification status if it's verified but not updated in Firestore
      if (user.emailVerified && userData && !userData.emailVerified) {
        await updateDoc(doc(db, 'users', user.uid), {
          emailVerified: true,
          verified: true,
        });
        // Refresh user data
        const updatedUserData = await fetchUserData(user);
        setUserData(updatedUserData);
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.displayName || 'User'}!`,
        variant: "default",
      });

    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message === 'Email not verified') {
        // Don't show error toast for email verification, it's already shown above
        throw error;
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    if (!isFirebaseAvailable) {
      toast({
        title: "Firebase Not Configured",
        description: "Please configure Firebase to enable email verification.",
        variant: "destructive",
      });
      throw new Error('Firebase not available');
    }

    if (!currentUser) {
      toast({
        title: "No User Found",
        description: "Please log in to send verification email.",
        variant: "destructive",
      });
      throw new Error('No current user');
    }

    try {
      setLoading(true);
      console.log('Sending verification email to:', currentUser.email);
      
      await sendEmailVerification(currentUser);
      
      console.log('Verification email sent successfully');
      toast({
        title: "Verification Email Sent",
        description: "Please check your email and click the verification link.",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Send verification email error:', error);
      
      let errorMessage = 'Failed to send verification email. Please try again.';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please log in again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }

      toast({
        title: "Failed to Send Verification Email",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      let errorMessage = 'Failed to send password reset email.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }

      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (name: string, phone: string) => {
    if (!currentUser) return;

    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: name,
      });

      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name,
        phone,
      });

      // Refresh user data
      await refreshUserData();

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });

    } catch (error) {
      console.error('Update profile error:', error);
      toast({
        title: "Profile Update Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser || !currentUser.email) return;

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
        variant: "default",
      });

    } catch (error: any) {
      console.error('Change password error:', error);
      let errorMessage = 'Failed to change password.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password should be at least 6 characters.';
      }

      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Send passwordless sign-in link to email
  const sendPasswordlessSignInLink = async (email: string) => {
    if (!isFirebaseAvailable) {
      if (isDemoConfig) {
        toast({
          title: "Demo Mode",
          description: "Firebase is in demo mode. Please set up a real Firebase project to enable passwordless authentication.",
          variant: "default",
        });
      } else {
        toast({
          title: "Firebase Not Configured",
          description: "Please configure Firebase to enable passwordless authentication.",
          variant: "destructive",
        });
      }
      throw new Error('Firebase not available');
    }

    try {
      setLoading(true);
      
      // Store email for later verification
      window.localStorage.setItem('emailForSignIn', email);
      
      await sendSignInLinkToEmail(auth, email, getEmailLinkSettings());
      
      toast({
        title: "Sign-in Link Sent",
        description: "Check your email for the sign-in link. Click the link to sign in without a password.",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Passwordless sign-in error:', error);
      
      let errorMessage = 'Failed to send sign-in link. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }

      toast({
        title: "Sign-in Link Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email link
  const signInWithEmailLink = async (email: string, emailLink: string) => {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase not available');
    }

    try {
      setLoading(true);
      
      const result = await signInWithEmailLink(auth, email, emailLink);
      const user = result.user;
      
      // Check if email is verified (should be true for email link sign-in)
      if (!user.emailVerified) {
        toast({
          title: "Email Verification Required",
          description: "Please verify your email before accessing the website. Check your email for the verification link.",
          variant: "destructive",
        });
        throw new Error('Email not verified');
      }

      // Update Firestore with email verification status
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          emailVerified: true,
          verified: true,
        });
      } catch (error) {
        console.error('Error updating email verification status:', error);
      }
      
      // Clear stored email
      window.localStorage.removeItem('emailForSignIn');
      
      toast({
        title: "Sign-in Successful",
        description: "You have been signed in successfully using the email link.",
        variant: "default",
      });
      
      return result;
    } catch (error: any) {
      console.error('Email link sign-in error:', error);
      
      let errorMessage = 'Failed to sign in with email link. Please try again.';
      
      if (error.code === 'auth/invalid-email-link') {
        errorMessage = 'The sign-in link is invalid or has expired.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.message === 'Email not verified') {
        // Don't show error toast for email verification, it's already shown above
        throw error;
      }

      toast({
        title: "Sign-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if current URL is a sign-in link
  const isSignInWithEmailLink = (emailLink: string) => {
    if (!isFirebaseAvailable) return false;
    return isSignInWithEmailLink(auth, emailLink);
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!isFirebaseAvailable) {
      console.warn('Firebase not available, skipping auth state listener');
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userData = await fetchUserData(user);
        setUserData(userData);

        // Update Firestore with email verification status if it's verified but not updated in Firestore
        if (user.emailVerified && userData && !userData.emailVerified) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              emailVerified: true,
              verified: true,
            });
            // Refresh user data
            const updatedUserData = await fetchUserData(user);
            setUserData(updatedUserData);
          } catch (error) {
            console.error('Error updating email verification status:', error);
          }
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [isFirebaseAvailable]);

  const value: FirebaseAuthContextType = {
    currentUser,
    userData,
    loading,
    register,
    login,
    logout,
    sendVerificationEmail,
    resetPassword,
    updateUserProfile,
    changePassword,
    refreshUserData,
    sendPasswordlessSignInLink,
    signInWithEmailLink,
    isSignInWithEmailLink,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
