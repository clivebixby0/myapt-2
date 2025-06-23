# 🔥 Firebase Integration Guide for Apartment Management App

## 📋 **Prerequisites**
1. Firebase account (free tier available)
2. Node.js and npm installed
3. Your React app ready

## 🚀 **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `apartment-management-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

## ⚙️ **Step 2: Enable Firebase Services**

### **Authentication**
1. Go to Authentication → Sign-in method
2. Enable Email/Password authentication
3. Add authorized domains if needed

### **Firestore Database**
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location closest to your users
5. Click "Done"

### **Storage** (Optional for file uploads)
1. Go to Storage
2. Click "Get started"
3. Choose "Start in test mode"
4. Select location

## 🔧 **Step 3: Get Firebase Configuration**

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app
4. Register app with name: `apartment-management-web`
5. Copy the configuration object

## 📝 **Step 4: Update Firebase Config**

Replace the placeholder config in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🗄️ **Database Schema**

### **Collections Structure**

```
apartment-management-app/
├── users/
│   ├── {userId}/
│   │   ├── uid: string
│   │   ├── email: string
│   │   ├── username: string
│   │   ├── fullName: string
│   │   ├── phone: string
│   │   ├── address: string
│   │   ├── country: string
│   │   ├── role: "admin" | "tenant"
│   │   ├── status: "active" | "inactive"
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
├── apartments/
│   ├── {apartmentId}/
│   │   ├── apartmentNumber: string
│   │   ├── building: string
│   │   ├── floor: number
│   │   ├── bedrooms: number
│   │   ├── bathrooms: number
│   │   ├── squareFeet: number
│   │   ├── monthlyRent: number
│   │   ├── status: "Available" | "Occupied" | "Under Maintenance"
│   │   ├── description: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
├── payments/
│   ├── {paymentId}/
│   │   ├── tenantId: string (reference to users)
│   │   ├── apartmentId: string (reference to apartments)
│   │   ├── amount: number
│   │   ├── paymentType: "Rent" | "Deposit" | "Late Fee" | "Maintenance Fee"
│   │   ├── paymentMethod: "Credit Card" | "Bank Transfer" | "Cash" | "Check"
│   │   ├── dueDate: string (YYYY-MM-DD)
│   │   ├── status: "Pending" | "Paid" | "Overdue"
│   │   ├── notes: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
└── maintenance/
    ├── {maintenanceId}/
    │   ├── apartmentId: string (reference to apartments)
    │   ├── issueType: "Plumbing" | "Electrical" | "HVAC" | "Appliance" | "Structural" | "Other"
    │   ├── priority: "Low" | "Medium" | "High" | "Emergency"
    │   ├── description: string
    │   ├── requestedDate: string (YYYY-MM-DD)
    │   ├── contactPhone: string
    │   ├── status: "Pending" | "In Progress" | "Completed" | "Cancelled"
    │   ├── notes: string
    │   ├── createdAt: timestamp
    │   └── updatedAt: timestamp
```

## 🔒 **Security Rules**

### **Firestore Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data, admins can read all
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Apartments - admins can read/write, tenants can read
    match /apartments/{apartmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Payments - admins can read/write, tenants can read their own
    match /payments/{paymentId} {
      allow read: if request.auth != null && 
        (resource.data.tenantId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Maintenance - admins can read/write, tenants can read/write their own
    match /maintenance/{maintenanceId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Storage Security Rules** (if using file uploads)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 **Testing the Integration**

### **1. Test Authentication**
```javascript
// Test login
const result = await authService.login('test@example.com', 'password123');
console.log(result);

// Test registration
const userData = {
  username: 'testuser',
  fullName: 'Test User',
  phone: '+1234567890',
  address: '123 Test St',
  country: 'USA',
  role: 'tenant'
};
const result = await authService.register('test@example.com', 'password123', userData);
console.log(result);
```

### **2. Test Data Operations**
```javascript
// Test adding apartment
const apartmentData = {
  apartmentNumber: 'Apt 101',
  building: 'Building A',
  floor: 1,
  bedrooms: 2,
  bathrooms: 1,
  squareFeet: 800,
  monthlyRent: 1200,
  status: 'Available',
  description: 'Beautiful apartment with city view'
};
const result = await apartmentService.addApartment(apartmentData);
console.log(result);
```

## 📊 **Firebase Console Features to Use**

### **Authentication Dashboard**
- Monitor user sign-ups and sign-ins
- View user details and manage accounts
- Set up password reset and email verification

### **Firestore Dashboard**
- View and edit documents directly
- Monitor database usage and performance
- Set up indexes for complex queries

### **Analytics** (if enabled)
- Track user engagement
- Monitor app performance
- View crash reports

## 🚨 **Important Notes**

1. **Environment Variables**: Store Firebase config in `.env` file:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   ```

2. **Production Security**: Update security rules before going live

3. **Backup Strategy**: Set up regular backups of your Firestore data

4. **Cost Monitoring**: Monitor usage to stay within free tier limits

5. **Error Handling**: Implement proper error handling for network issues

## 🔄 **Migration from Local Storage**

The app will automatically migrate from localStorage to Firebase when you:
1. Update the Firebase config
2. Restart the app
3. The DataContext will load data from Firebase instead of localStorage

## 📈 **Performance Optimization**

1. **Indexes**: Create composite indexes for complex queries
2. **Pagination**: Implement pagination for large datasets
3. **Caching**: Use React Query or SWR for client-side caching
4. **Offline Support**: Enable offline persistence for better UX

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **Permission Denied**: Check security rules
2. **Network Error**: Verify Firebase config
3. **Quota Exceeded**: Monitor usage in Firebase console
4. **Authentication Issues**: Check email/password format

### **Debug Mode:**
Enable Firebase debug mode in development:
```javascript
// Add to config.js
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase config:', firebaseConfig);
}
``` 