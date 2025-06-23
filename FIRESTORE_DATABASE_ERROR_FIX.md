# 🔥 Firestore Database Error Fix Guide

## 🚨 **Current Issue:**
"Database error occurred" during registration indicates Firestore is not properly configured.

## 🔍 **Step-by-Step Fix:**

### **Step 1: Check Browser Console**
1. Open browser console (F12)
2. Try to register
3. Look for these specific error messages:
   - `❌ Firestore insertion failed with error:`
   - `❌ Error code:`
   - `❌ Error message:`

### **Step 2: Verify Firebase Project Setup**

#### **A. Check if Firestore Database Exists**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. If you see "Create database", click it and:
   - Choose **"Start in test mode"**
   - Select location closest to you
   - Click **"Done"**

#### **B. Check Firestore Security Rules**
1. In Firebase Console, go to **Firestore Database**
2. Click **"Rules"** tab
3. Replace the rules with this (allows registration):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to create their own documents during registration
    match /users/{userId} {
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uid;
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.uid;
    }
    
    // Allow authenticated users to read all users
    match /users/{userId} {
      allow read: if request.auth != null;
    }
    
    // Test collection
    match /test/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

### **Step 3: Test Firestore Connection**
After updating rules, refresh your app and check console for:
```
🔍 Testing Firebase connection...
Testing Auth service...
✅ Auth service initialized
Testing Firestore service...
✅ Firestore service initialized
Testing Firestore write permission...
✅ Firestore write test successful: [docId]
✅ Test document cleaned up
🎉 All Firebase services are working!
```

### **Step 4: Common Error Codes & Solutions**

#### **Error: `permission-denied`**
**Solution:** Update Firestore security rules (see Step 2B)

#### **Error: `not-found`**
**Solution:** Create Firestore database (see Step 2A)

#### **Error: `unavailable`**
**Solution:** Check internet connection and Firebase project status

#### **Error: `resource-exhausted`**
**Solution:** Check Firebase usage limits in console

### **Step 5: Alternative - Use Test Mode**
If you want to quickly test, temporarily set Firestore to test mode:

1. Go to **Firestore Database** → **Rules**
2. Replace with this (⚠️ **FOR TESTING ONLY**):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click **"Publish"**
4. Test registration
5. **IMPORTANT:** Change back to secure rules after testing

## 🧪 **Testing the Fix:**

### **Expected Console Output:**
```
Starting registration process...
User created in Firebase Auth: [uid]
User profile updated
🔍 Attempting to write to Firestore collection: users
📝 User data to be inserted: {...}
✅ User data successfully added to Firestore with ID: [docId]
✅ User data verified in Firestore
🎉 Registration successful: {...}
```

### **Success Indicators:**
- ✅ No "Database error occurred" message
- ✅ Success message appears
- ✅ Redirects to login page
- ✅ User appears in Firebase Console → Authentication
- ✅ User data appears in Firebase Console → Firestore Database

## 🚨 **If Still Not Working:**

### **Check These:**
1. **Firebase Project Status** - Is your project active?
2. **Billing** - Is billing set up (if needed)?
3. **Network** - Any firewall blocking Firebase?
4. **Browser** - Try incognito/private mode

### **Debug Commands:**
Add this to your browser console to test Firestore directly:
```javascript
// Test Firestore write
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './src/firebase/config';

addDoc(collection(db, 'test'), {
  test: true,
  timestamp: serverTimestamp()
}).then(doc => {
  console.log('✅ Test write successful:', doc.id);
}).catch(error => {
  console.error('❌ Test write failed:', error);
});
```

## 📞 **Need More Help?**

Share the exact error message from your browser console, and I can provide more specific guidance!

**Common console errors to look for:**
- `permission-denied`
- `not-found` 
- `unavailable`
- `resource-exhausted`
- `invalid-argument` 