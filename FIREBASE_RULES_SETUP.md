# Firebase Realtime Database Rules Setup

## Issue
The application is showing this error:
```
Error fetching user notifications: Error: Index not defined, add ".indexOn": "userId", for path "/notifications", to the rules
```

## Solution
Update your Firebase Realtime Database rules to include proper indexing for efficient queries.

## Steps to Fix

### 1. Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `narayanganj-traveller-bd`
3. Go to **Realtime Database** → **Rules**

### 2. Replace Current Rules
Replace your current rules with the following:

```json
{
  "rules": {
    "tours": {
      ".read": true,
      ".write": true,
      ".indexOn": ["status", "createdDate"]
    },
    "blogs": {
      ".read": true,
      ".write": true,
      ".indexOn": ["status", "submissionDate", "author.email"]
    },
    "bookings": {
      ".read": true,
      ".write": true,
      ".indexOn": ["userId", "status", "bookingDate", "tourId"]
    },
    "settings": {
      ".read": true,
      ".write": true
    },
    "notifications": {
      ".read": true,
      ".write": true,
      ".indexOn": ["userId", "read", "createdAt"]
    },
    "users": {
      ".read": true,
      ".write": true,
      ".indexOn": ["email", "role"]
    },
    "popupAds": {
      ".read": true,
      ".write": true,
      ".indexOn": ["isActive", "targetAudience"]
    },
    "test": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 3. Publish Rules
1. Click **Publish** to apply the new rules
2. Wait for the rules to be deployed (usually takes a few seconds)

### 4. Verify Fix
1. Refresh your application
2. Check the browser console - the error should be gone
3. Test notification functionality

## What These Indexes Do

- **`notifications.userId`**: Enables efficient querying of notifications by user ID
- **`notifications.read`**: Enables filtering by read/unread status
- **`notifications.createdAt`**: Enables sorting by creation date
- **`bookings.userId`**: Enables efficient querying of bookings by user ID
- **`bookings.status`**: Enables filtering by booking status
- **`tours.status`**: Enables filtering tours by status
- **`blogs.status`**: Enables filtering blogs by status

## Important Notes

- These rules are **permissive** (read/write: true) for development/testing
- For production, consider implementing proper authentication-based rules
- Indexes improve query performance but use additional storage
- Rules changes take effect immediately after publishing

## Troubleshooting

If you still see errors after applying the rules:

1. **Clear browser cache** and refresh
2. **Check Firebase Console** for any rule validation errors
3. **Verify** that the rules were published successfully
4. **Wait a few minutes** for changes to propagate

## Security Considerations

For production deployment, consider implementing more restrictive rules:

```json
{
  "rules": {
    "notifications": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      },
      ".indexOn": ["userId", "read", "createdAt"]
    }
  }
}
```

This ensures users can only access their own notifications.
