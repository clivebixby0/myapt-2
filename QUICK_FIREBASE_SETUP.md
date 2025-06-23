# 🚀 Quick Firebase Setup Guide

## **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `apartment-management-app`
4. **Disable Google Analytics** (optional)
5. Click **"Create project"**

## **Step 2: Enable Authentication**

1. In your new project, go to **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Click **"Save"**

## **Step 3: Create Firestore Database**

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"**
4. Select location (choose closest to you)
5. Click **"Done"**

## **Step 4: Get Your Configuration**

1. Click the **gear icon** (Project Settings)
2. Scroll down to **"Your apps"**
3. Click **"Add app"** → **Web app**
4. Register app with name: `apartment-management-web`
5. **Copy the configuration object**

## **Step 5: Update Your Code**

Replace the config in `src/firebase/config.js` with your new configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-new-api-key",
  authDomain: "your-new-project.firebaseapp.com",
  projectId: "your-new-project-id",
  storageBucket: "your-new-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## **Step 6: Test**

1. Restart your development server
2. Try to login
3. Check browser console for success messages

## **Need Help?**

If you're still getting errors, the issue might be:
- Project doesn't exist
- API key is invalid
- Services not enabled
- Network connectivity issues

Let me know what you see in the browser console! 