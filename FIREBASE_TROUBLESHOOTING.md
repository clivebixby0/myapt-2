# 🔥 Firebase API Key Error - Troubleshooting Guide

## 🚨 **Error: "auth/api-key-not-valid.-please-pass-a-valid-api-key."**

This error occurs when Firebase cannot validate your API key. Here's how to fix it:

## 📋 **Step 1: Verify Your Firebase Project**

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Check if your project exists:**
   - Look for project: `apartment-management-app-4a33a`
   - If it doesn't exist, create a new project

## 🔧 **Step 2: Get Your Correct Firebase Configuration**

1. **In Firebase Console, go to Project Settings (gear icon)**
2. **Scroll down to "Your apps" section**
3. **If no web app exists, click "Add app" → Web app**
4. **Register app with name: `apartment-management-web`**
5. **Copy the configuration object**

## 📝 **Step 3: Create Environment File**

Create a `.env` file in your project root (same level as `package.json`):

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-actual-api-key-from-firebase-console
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# App Configuration
REACT_APP_APP_NAME=Apartment Management System
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG_MODE=true
```

## ⚙️ **Step 4: Enable Firebase Services**

### **Authentication**
1. Go to Authentication → Sign-in method
2. Enable Email/Password authentication
3. Add your domain to authorized domains

### **Firestore Database**
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode"
4. Select location closest to your users

## 🔄 **Step 5: Restart Your Development Server**

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm start
# or
yarn start
```

## 🧪 **Step 6: Test the Configuration**

Open your browser console and check for:
- No Firebase API key errors
- Firebase config loaded successfully
- Authentication working

## 🚨 **Common Issues & Solutions**

### **Issue 1: Project Doesn't Exist**
- Create a new Firebase project
- Follow the setup guide in `FIREBASE_SETUP.md`

### **Issue 2: API Key is Invalid**
- Double-check the API key from Firebase Console
- Ensure no extra spaces or characters
- Make sure you're using the correct project

### **Issue 3: Environment Variables Not Loading**
- Ensure `.env` file is in the root directory
- Restart your development server
- Check that variable names start with `REACT_APP_`

### **Issue 4: CORS Issues**
- Add your domain to Firebase authorized domains
- Go to Authentication → Settings → Authorized domains

## 🔍 **Debug Steps**

1. **Check Console Logs:**
   ```javascript
   // Should show in browser console:
   Firebase config loaded: {
     projectId: "your-project-id",
     authDomain: "your-project.firebaseapp.com",
     apiKey: "***1234"
   }
   ```

2. **Verify Environment Variables:**
   ```javascript
   // Add this temporarily to check values
   console.log('API Key:', process.env.REACT_APP_FIREBASE_API_KEY);
   ```

3. **Test Firebase Connection:**
   ```javascript
   // In browser console:
   import { auth } from './src/firebase/config';
   console.log('Auth object:', auth);
   ```

## 📞 **Still Having Issues?**

1. **Check Firebase Console for errors**
2. **Verify your Firebase project is active**
3. **Ensure billing is set up (if needed)**
4. **Check network connectivity**

## 🔒 **Security Notes**

- Never commit `.env` files to version control
- Use different Firebase projects for development/production
- Regularly rotate API keys
- Monitor Firebase usage in console

## 📚 **Additional Resources**

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules) 