# 🔥 Firebase Project Setup Guide

## 🚨 **Current Issue:**
The app is not working because the Firebase project configuration might be incorrect or the project doesn't exist.

## 🛠️ **Quick Fix Steps:**

### **1. Check Current Firebase Configuration**
The current config in `src/firebase/config.js` is:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBBpfvmvjKGH_sQ7Ucr0hrs-D56WO2DZIo",
  authDomain: "apartment-management-app-4a33a.firebaseapp.com",
  projectId: "apartment-management-app-4a33a",
  storageBucket: "apartment-management-app-4a33a.firebasestorage.app",
  messagingSenderId: "405489818061",
  appId: "1:405489818061:web:b0595d34ddf5f53cb54c84",
  measurementId: "G-T4S9B2CGTM"
};
```

### **2. Verify Project Exists**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Check if project `apartment-management-app-4a33a` exists
3. If it doesn't exist, create a new project

### **3. Create New Firebase Project (if needed)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `apartment-management-app-4a33a` (or any name you prefer)
4. Follow the setup wizard

### **4. Enable Authentication**
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### **5. Create Firestore Database**
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to you)
5. Click "Done"

### **6. Update Security Rules**
1. In Firestore Database, go to "Rules" tab
2. Replace the rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users under any document
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click "Publish"

### **7. Get New Configuration**
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" if no web app exists
4. Choose "Web" platform
5. Register app with name "Apartment Management"
6. Copy the configuration object

### **8. Update App Configuration**
Replace the config in `src/firebase/config.js` with your new configuration.

### **9. Test the Setup**
1. Go to `http://localhost:3000/test` to run Firebase diagnostics
2. Click "Run Diagnostics" on the login page
3. Check browser console for any errors

## 🧪 **Test the Setup**

### **Check Browser Console**
After restarting, you should see:
```
Firebase Configuration Check: {projectId: "your-new-project", ...}
✅ Firebase initialized successfully
🔍 Testing Firebase connection...
Testing Auth service...
✅ Auth service initialized
Testing Firestore service...
✅ Firestore service initialized
🎉 All Firebase services are working!
```

### **Test Registration**
1. Go to your app (should show registration page)
2. Fill out the form with test data
3. Click "Create Account"
4. Check console for success logs

## 🚨 **If You Still Get Errors:**

### **Error 1: "auth/api-key-not-valid"**
- Double-check your API key in the `.env` file
- Make sure there are no extra spaces
- Verify the project exists in Firebase Console

### **Error 2: "auth/network-request-failed"**
- Check your internet connection
- Try a different browser
- Check if Firebase is blocked by firewall

### **Error 3: "auth/email-already-in-use"**
- Use a different email address for testing

## 📞 **Need Help?**

If you're still having issues:
1. **Share the console logs** - what do you see in the browser console?
2. **Check Firebase Console** - is your project active?
3. **Verify .env file** - are the values correct?

## 🎯 **Expected Success Flow:**
1. ✅ Firebase initializes successfully
2. ✅ Registration form works
3. ✅ User created in Firebase Auth
4. ✅ User data stored in Firestore
5. ✅ Success message appears
6. ✅ Redirects to login page

Let me know what you see in the console after setting up the new Firebase project!

## 🎯 **Common Issues and Solutions:**

### **Issue: "Firebase: Error (auth/invalid-api-key)"**
**Solution:** The API key is incorrect or the project doesn't exist.

### **Issue: "Firebase: Error (auth/network-request-failed)"**
**Solution:** Check internet connection and Firebase project status.

### **Issue: "Firebase: Error (firestore/permission-denied)"**
**Solution:** Update Firestore security rules to allow read/write access.

### **Issue: "Firebase: Error (firestore/not-found)"**
**Solution:** Create the Firestore database in Firebase Console.

## 🎯 **Testing the Setup:**

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Go to the test page:**
   ```
   http://localhost:3000/test
   ```

3. **Run diagnostics on login page:**
   ```
   http://localhost:3000/login
   ```
   Click "Run Diagnostics" button

4. **Check browser console** for detailed error messages

## 🎯 **Creating Test Users:**

Once Firebase is working, you can create test users:

1. **Via Firebase Console:**
   - Go to Authentication > Users
   - Click "Add user"
   - Enter email and password

2. **Via the app (after login):**
   - Login as admin
   - Go to Users page
   - Click "Add New User"

## 🎯 **Demo Credentials:**
Use these credentials for testing:
- Email: `admin@apartment.com`
- Password: `admin123`

## 🎯 **Next Steps:**
After Firebase is working:
1. Create the admin user in Firebase Console
2. Test login functionality
3. Create additional users via the app
4. Set up proper security rules for production 