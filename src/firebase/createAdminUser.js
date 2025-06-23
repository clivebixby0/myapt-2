import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Function to create an admin user
export const createAdminUser = async (email, password, userData) => {
  try {
    console.log('🔧 Creating admin user...', { email, userData });
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ User created in Firebase Auth:', user.uid);
    
    // Update user profile
    await updateProfile(user, {
      displayName: userData.fullName || userData.username
    });
    
    console.log('✅ User profile updated');
    
    // Prepare user data for Firestore
    const firestoreData = {
      uid: user.uid,
      email: user.email,
      username: userData.username,
      fullName: userData.fullName,
      phone: userData.phone || '',
      address: userData.address || '',
      country: userData.country || '',
      role: 'admin', // Set as admin
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 User data for Firestore:', firestoreData);
    
    // Create document with UID as document ID
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, firestoreData);
    
    console.log('✅ User document created in Firestore with UID as document ID:', user.uid);
    
    const completeUser = {
      id: user.uid,
      uid: user.uid,
      email: user.email,
      ...firestoreData
    };
    
    console.log('🎉 Admin user creation successful:', completeUser);
    
    return { 
      success: true, 
      user: completeUser 
    };
    
  } catch (error) {
    console.error('❌ Admin user creation error:', error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters long.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    return { 
      success: false, 
      error: {
        code: error.code,
        message: errorMessage
      }
    };
  }
};

// Function to create a test admin user
export const createTestAdminUser = async () => {
  const testUserData = {
    username: 'admin',
    fullName: 'System Administrator',
    phone: '+1234567890',
    address: '123 Admin Street',
    country: 'USA'
  };
  
  return await createAdminUser('admin@apartment.com', 'admin123', testUserData);
}; 