# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the NTB Tours website.

## Prerequisites

- Node.js and npm installed
- Firebase account
- Basic knowledge of React and Firebase

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `ntb-tours` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your preferred location
5. Click **Done**

## Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register your app with nickname: `NTB Tours Web`
5. Copy the Firebase configuration object

## Step 5: Update Firebase Configuration

1. **Create Environment File**: Copy `client/lib/env.template` to `.env.local` in the project root
2. **Fill in Configuration**: Replace the placeholder values with your actual Firebase config:

```bash
# Create .env.local file
cp client/lib/env.template .env.local
```

3. **Update .env.local** with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Alternative Method**: You can also directly edit `client/lib/firebaseConfig.js` and replace the demo values with your actual Firebase configuration.

## Step 6: Set Up Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read access for tours (adjust as needed)
    match /tours/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Bookings - users can read their own, admins can read all
    match /bookings/{document} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.admin == true);
      allow write: if request.auth != null;
    }
  }
}
```

## Step 7: Install Dependencies

The Firebase SDK is already installed. If you need to reinstall:

```bash
npm install firebase
```

## Step 8: Test the Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:8080/auth/register`
3. Try creating a new account
4. Check Firebase Console > Authentication to see the new user
5. Check Firestore Database > users collection to see user data

## Features Implemented

### ✅ Registration System
- Full name, email, phone, password fields
- Email verification via Firebase
- User data stored in Firestore
- Form validation and error handling

### ✅ Login System
- Email/password authentication
- Remember user session
- Error handling for invalid credentials

### ✅ Email Verification
- Automatic email verification on registration
- Resend verification email functionality
- Verification status checking

### ✅ Password Reset
- Forgot password functionality
- Email-based password reset
- Secure reset flow

### ✅ Booking Protection
- Users must be logged in to book tours
- Email verification required before booking
- Clear error messages and redirects

### ✅ User Management
- Firebase Auth integration
- Firestore user data storage
- Profile management capabilities

## File Structure

```
client/
├── lib/
│   └── firebaseConfig.js          # Firebase configuration
├── contexts/
│   └── FirebaseAuthContext.tsx    # Authentication context
├── pages/
│   └── auth/
│       ├── Register.tsx           # Registration page
│       ├── Login.tsx              # Login page
│       ├── VerifyEmail.tsx        # Email verification
│       └── ForgotPassword.tsx     # Password reset
└── components/
    └── Navigation.tsx             # Updated with Firebase auth
```

## Security Considerations

1. **Email Verification**: Users must verify their email before booking
2. **Password Requirements**: Minimum 6 characters (Firebase default)
3. **Session Management**: Firebase handles secure session tokens
4. **Data Validation**: Client-side and server-side validation
5. **Firestore Rules**: Proper security rules for data access

## Troubleshooting

### Common Issues

1. **"Firebase not configured" error**
   - Check `firebaseConfig.js` has correct values
   - Ensure Firebase project is active

2. **"Permission denied" error**
   - Check Firestore security rules
   - Ensure user is authenticated

3. **Email verification not working**
   - Check spam folder
   - Verify email provider settings
   - Check Firebase Authentication settings

4. **User data not saving**
   - Check Firestore rules
   - Verify user is authenticated
   - Check browser console for errors

### Development vs Production

For production deployment:

1. Update Firestore rules for production security
2. Configure custom domain in Firebase
3. Set up proper CORS settings
4. Enable additional security features
5. Set up monitoring and analytics

## Support

If you encounter issues:

1. Check Firebase Console for errors
2. Review browser console for client-side errors
3. Verify all configuration values are correct
4. Test with a fresh browser session
5. Check Firebase documentation for updates

## Next Steps

After setup is complete, you can:

1. Customize the UI components
2. Add additional user profile fields
3. Implement role-based access control
4. Add social login providers
5. Set up email templates
6. Configure analytics and monitoring

---

**Note**: This is a development setup. For production, ensure proper security rules, environment variables, and monitoring are in place.
