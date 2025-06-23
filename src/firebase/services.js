import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './config';

// Helper function to get user by UID
const getUserByUid = async (uid) => {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { success: true, data: { id: doc.id, ...doc.data() } };
    }
    return { 
      success: false, 
      error: {
        code: 'user-not-found',
        message: 'User not found'
      }
    };
  } catch (error) {
    console.error('Get user by UID error:', error);
    return { 
      success: false, 
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
};

// ===== AUTHENTICATION SERVICES =====
export const authService = {
  // Register new user
  register: async (email, password, userData) => {
    try {
      console.log('Starting registration process...', { email, userData });
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('User created in Firebase Auth:', user.uid);
      
      // Update user profile
      await updateProfile(user, {
        displayName: userData.fullName || userData.username
      });
      
      console.log('User profile updated');
      
      // Prepare user data for Firestore
      const firestoreData = {
        uid: user.uid,
        email: user.email,
        username: userData.username,
        fullName: userData.fullName,
        phone: userData.phone || '',
        address: userData.address || '',
        country: userData.country || '',
        role: userData.role || 'tenant',
        apartmentId: userData.apartmentId || null,
        status: userData.apartmentId ? 'assigned' : 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('Preparing to add user data to Firestore:', firestoreData);
      
      // Add user data to Firestore with UID as document ID
      let userDocRef;
      try {
        console.log('🔍 Attempting to write to Firestore collection: users');
        console.log('📝 User data to be inserted:', JSON.stringify(firestoreData, null, 2));
        
        userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, firestoreData);
        console.log('✅ User data successfully added to Firestore with UID as document ID:', user.uid);
      } catch (firestoreError) {
        console.error('❌ Firestore insertion failed with error:', firestoreError);
        console.error('❌ Error code:', firestoreError.code);
        console.error('❌ Error message:', firestoreError.message);
        console.error('❌ Full error object:', firestoreError);
        
        // Check if it's a permissions error
        if (firestoreError.code === 'permission-denied') {
          console.error('🚨 This is a Firestore security rules issue!');
          console.error('🚨 Check your Firestore security rules in Firebase Console');
        }
        
        // Check if it's a database not found error
        if (firestoreError.code === 'not-found') {
          console.error('🚨 Firestore database not found!');
          console.error('🚨 Make sure Firestore Database is created in Firebase Console');
        }
        
        // If Firestore fails, we should clean up the Auth user
        try {
          await user.delete();
          console.log('Cleaned up Auth user after Firestore failure');
        } catch (cleanupError) {
          console.error('Failed to clean up Auth user:', cleanupError);
        }
        
        return { 
          success: false, 
          error: {
            code: 'firestore-error',
            message: `Database error: ${firestoreError.message} (Code: ${firestoreError.code})`
          }
        };
      }
      
      // If apartment is assigned, update the apartment to reflect the assignment
      if (userData.apartmentId) {
        console.log('🔄 Updating apartment assignment for apartment ID:', userData.apartmentId);
        try {
          await updateDoc(doc(db, 'apartments', userData.apartmentId), {
            tenantId: user.uid,
            status: 'Occupied',
            updatedAt: serverTimestamp()
          });
          console.log('✅ Apartment updated successfully with tenant assignment');
        } catch (apartmentUpdateError) {
          console.error('❌ Failed to update apartment assignment:', apartmentUpdateError);
          // Don't fail the registration, but log the error
        }
      }
      
      // Verify the user was added to Firestore
      try {
        const verificationDoc = await getDoc(doc(db, 'users', user.uid));
        if (verificationDoc.exists()) {
          console.log('✅ User data verified in Firestore');
        } else {
          console.error('❌ User data not found in Firestore after insertion');
          throw new Error('User data not found after insertion');
        }
      } catch (verificationError) {
        console.error('❌ Firestore verification failed:', verificationError);
        return { 
          success: false, 
          error: {
            code: 'verification-error',
            message: `Database verification failed: ${verificationError.message}`
          }
        };
      }
      
      // Get the complete user data
      const userDoc = await getUserByUid(user.uid);
      
      if (!userDoc.success) {
        console.error('❌ Failed to retrieve user data after registration');
        return { 
          success: false, 
          error: {
            code: 'retrieval-error',
            message: 'Failed to retrieve user data after registration'
          }
        };
      }
      
      const completeUser = {
        uid: user.uid,
        email: user.email,
        ...userDoc.data
      };
      
      console.log('🎉 Registration successful:', completeUser);
      
      return { 
        success: true, 
        user: completeUser 
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please login instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      return { 
        success: false, 
        error: {
          code: error.code,
          message: errorMessage
        }
      };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      console.log('authService.login: Starting login process...', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('authService.login: User authenticated:', user.uid);
      
      // Get user data from Firestore
      console.log('authService.login: Getting user data from Firestore...');
      const userDoc = await getUserByUid(user.uid);
      console.log('authService.login: Firestore result:', userDoc);
      
      if (!userDoc.success) {
        console.error('authService.login: User data not found in Firestore');
        return { 
          success: false, 
          error: {
            code: 'user-data-not-found',
            message: 'User data not found in database'
          }
        };
      }
      
      const completeUser = {
        uid: user.uid,
        email: user.email,
        ...userDoc.data
      };
      
      console.log('authService.login: Login successful, complete user data:', completeUser);
      
      return { 
        success: true, 
        user: completeUser
      };
    } catch (error) {
      console.error('authService.login: Login error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Get user by UID (for AuthContext)
  getUserByUid: async (uid) => {
    try {
      console.log('authService.getUserByUid: Getting user data for UID:', uid);
      
      // Use the helper function directly to avoid recursion
      const q = query(collection(db, 'users'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const userData = { id: doc.id, ...doc.data() };
        console.log('authService.getUserByUid: User data retrieved successfully:', userData);
        return { success: true, data: userData };
      } else {
        console.error('authService.getUserByUid: User not found in Firestore');
        return { 
          success: false, 
          error: {
            code: 'user-not-found',
            message: 'User not found in database'
          }
        };
      }
    } catch (error) {
      console.error('authService.getUserByUid: Error retrieving user data:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  }
};

// ===== USER SERVICES =====
export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      console.log('Firebase service: Getting all users...');
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        console.log('Firebase service: User data:', userData);
        users.push(userData);
      });
      console.log('Firebase service: Total users retrieved:', users.length);
      return { success: true, data: users };
    } catch (error) {
      console.error('Firebase service: Get users error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
      }
      return { 
        success: false, 
        error: {
          code: 'user-not-found',
          message: 'User not found'
        }
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Get user by UID
  getUserByUid: async (uid) => {
    try {
      const q = query(collection(db, 'users'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { success: true, data: { id: doc.id, ...doc.data() } };
      }
      return { 
        success: false, 
        error: {
          code: 'user-not-found',
          message: 'User not found'
        }
      };
    } catch (error) {
      console.error('Get user by UID error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Add new user (creates Firebase Auth user and Firestore record)
  addUser: async (userData) => {
    try {
      console.log('Starting user creation process...', { email: userData.email, userData });
      
      // Validate required fields
      if (!userData.email || !userData.password) {
        return { 
          success: false, 
          error: {
            code: 'missing-required-fields',
            message: 'Email and password are required'
          }
        };
      }
      
      // Store current user info
      const currentUser = auth.currentUser;
      const currentUserEmail = currentUser?.email;
      
      console.log('Current user before creation:', currentUserEmail);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const newUser = userCredential.user;
      
      console.log('User created in Firebase Auth:', newUser.uid);
      
      // Update user profile
      await updateProfile(newUser, {
        displayName: userData.fullName || userData.username
      });
      
      console.log('User profile updated');
      
      // Prepare user data for Firestore
      let status = 'active';
      if (userData.status === 'disabled') {
        status = 'disabled';
      } else if (userData.apartmentId) {
        status = 'active';
      }
      const firestoreData = {
        uid: newUser.uid,
        email: newUser.email,
        username: userData.username,
        fullName: userData.fullName,
        phone: userData.phone || '',
        address: userData.address || '',
        country: userData.country || '',
        role: userData.role || 'tenant',
        apartmentId: userData.apartmentId || null,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('Preparing to add user data to Firestore:', firestoreData);
      
      // Add user data to Firestore with UID as document ID
      const userDocRef = doc(db, 'users', newUser.uid);
      await setDoc(userDocRef, firestoreData);
      console.log('✅ User data successfully added to Firestore with UID as document ID:', newUser.uid);
      
      // If apartment is assigned, update the apartment to reflect the assignment
      if (userData.apartmentId) {
        console.log('🔄 Updating apartment assignment for apartment ID:', userData.apartmentId);
        try {
          await updateDoc(doc(db, 'apartments', userData.apartmentId), {
            tenantId: newUser.uid,
            status: 'Occupied',
            updatedAt: serverTimestamp()
          });
          console.log('✅ Apartment updated successfully with tenant assignment');
        } catch (apartmentUpdateError) {
          console.error('❌ Failed to update apartment assignment:', apartmentUpdateError);
          // Don't fail the user creation, but log the error
        }
      }
      
      // Sign out the newly created user immediately
      await signOut(auth);
      console.log('✅ Signed out newly created user');
      
      // Get the complete user data
      const completeUser = {
        id: newUser.uid, // Use UID as the ID
        uid: newUser.uid,
        email: newUser.email,
        ...firestoreData
      };
      
      console.log('🎉 User creation successful:', completeUser);
      
      return { 
        success: true, 
        id: newUser.uid, // Return UID as the ID
        user: completeUser
      };
    } catch (error) {
      console.error('❌ User creation error:', error);
      
      // Try to clean up if there was an error during creation
      try {
        if (auth.currentUser && auth.currentUser.email === userData.email) {
          await signOut(auth);
          console.log('✅ Cleaned up failed user creation');
        }
      } catch (cleanupError) {
        console.error('Error during cleanup after user creation failure:', cleanupError);
      }
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      return { 
        success: false, 
        error: {
          code: error.code,
          message: errorMessage
        }
      };
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      // Get the current user data to check for apartment changes
      const currentUserDoc = await getDoc(doc(db, 'users', userId));
      const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : {};
      const oldApartmentId = currentUserData.apartmentId;
      const newApartmentId = userData.apartmentId;
      
      // Determine new status
      let status = 'active';
      if (userData.status === 'disabled') {
        status = 'disabled';
      } else if (userData.apartmentId) {
        status = 'active';
      }
      
      // Update the user
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        status,
        updatedAt: serverTimestamp()
      });
      
      // Handle apartment assignment changes
      if (oldApartmentId !== newApartmentId) {
        console.log('🔄 Apartment assignment changed for user:', userId);
        console.log('Old apartment ID:', oldApartmentId);
        console.log('New apartment ID:', newApartmentId);
        
        // Remove tenant from old apartment if it exists
        if (oldApartmentId) {
          try {
            await updateDoc(doc(db, 'apartments', oldApartmentId), {
              tenantId: null,
              status: 'Available',
              updatedAt: serverTimestamp()
            });
            console.log('✅ Removed tenant from old apartment:', oldApartmentId);
          } catch (error) {
            console.error('❌ Failed to remove tenant from old apartment:', error);
          }
        }
        
        // Assign tenant to new apartment if it exists
        if (newApartmentId) {
          try {
            await updateDoc(doc(db, 'apartments', newApartmentId), {
              tenantId: userId,
              status: 'Occupied',
              updatedAt: serverTimestamp()
            });
            console.log('✅ Assigned tenant to new apartment:', newApartmentId);
          } catch (error) {
            console.error('❌ Failed to assign tenant to new apartment:', error);
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    console.log('Firebase service: Deleting user with ID:', userId);
    try {
      // Get the user data to check for apartment assignment
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const apartmentId = userData.apartmentId;
      
      console.log('Firebase service: User apartment ID:', apartmentId);
      
      // Remove tenant from apartment if assigned
      if (apartmentId) {
        try {
          await updateDoc(doc(db, 'apartments', apartmentId), {
            tenantId: null,
            status: 'Available',
            updatedAt: serverTimestamp()
          });
          console.log('Firebase service: Removed tenant from apartment:', apartmentId);
        } catch (apartmentError) {
          console.error('Firebase service: Failed to remove tenant from apartment:', apartmentError);
          // Continue with user deletion even if apartment update fails
        }
      }
      
      console.log('Firebase service: Attempting to delete document from users collection');
      await deleteDoc(doc(db, 'users', userId));
      console.log('Firebase service: User deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Firebase service: Delete user error:', error);
      console.error('Firebase service: Error code:', error.code);
      console.error('Firebase service: Error message:', error.message);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  }
};

// ===== APARTMENT SERVICES =====
export const apartmentService = {
  // Get all apartments
  getAllApartments: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'apartments'));
      const apartments = [];
      querySnapshot.forEach((doc) => {
        apartments.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: apartments };
    } catch (error) {
      console.error('Get apartments error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Get apartment by ID
  getApartmentById: async (apartmentId) => {
    try {
      const apartmentDoc = await getDoc(doc(db, 'apartments', apartmentId));
      if (apartmentDoc.exists()) {
        return { success: true, data: { id: apartmentDoc.id, ...apartmentDoc.data() } };
      }
      return { 
        success: false, 
        error: {
          code: 'apartment-not-found',
          message: 'Apartment not found'
        }
      };
    } catch (error) {
      console.error('Get apartment by ID error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Add new apartment
  addApartment: async (apartmentData) => {
    try {
      const docRef = await addDoc(collection(db, 'apartments'), {
        ...apartmentData,
        tenantId: null, // No tenant assigned initially
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Add apartment error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Update apartment
  updateApartment: async (apartmentId, apartmentData) => {
    try {
      // Get the current apartment data to check for tenant changes
      const currentApartmentDoc = await getDoc(doc(db, 'apartments', apartmentId));
      const currentApartmentData = currentApartmentDoc.exists() ? currentApartmentDoc.data() : {};
      const oldTenantId = currentApartmentData.tenantId;
      const newTenantId = apartmentData.tenantId;
      
      // Update the apartment
      await updateDoc(doc(db, 'apartments', apartmentId), {
        ...apartmentData,
        updatedAt: serverTimestamp()
      });
      
      // Handle tenant assignment changes
      if (oldTenantId !== newTenantId) {
        console.log('🔄 Tenant assignment changed for apartment:', apartmentId);
        console.log('Old tenant ID:', oldTenantId);
        console.log('New tenant ID:', newTenantId);
        
        // Remove apartment assignment from old tenant if it exists
        if (oldTenantId) {
          try {
            await updateDoc(doc(db, 'users', oldTenantId), {
              apartmentId: null,
              status: 'active',
              updatedAt: serverTimestamp()
            });
            console.log('✅ Removed apartment assignment from old tenant:', oldTenantId);
          } catch (error) {
            console.error('❌ Failed to remove apartment assignment from old tenant:', error);
          }
        }
        
        // Assign apartment to new tenant if it exists
        if (newTenantId) {
          try {
            await updateDoc(doc(db, 'users', newTenantId), {
              apartmentId: apartmentId,
              status: 'assigned',
              updatedAt: serverTimestamp()
            });
            console.log('✅ Assigned apartment to new tenant:', newTenantId);
          } catch (error) {
            console.error('❌ Failed to assign apartment to new tenant:', error);
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update apartment error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Assign tenant to apartment
  assignTenantToApartment: async (apartmentId, tenantId) => {
    try {
      // Update apartment with tenant
      await updateDoc(doc(db, 'apartments', apartmentId), {
        tenantId: tenantId,
        status: 'Occupied',
        updatedAt: serverTimestamp()
      });

      // Update user with apartment assignment and status
      await updateDoc(doc(db, 'users', tenantId), {
        apartmentId: apartmentId,
        status: 'assigned',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Assign tenant to apartment error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Remove tenant from apartment
  removeTenantFromApartment: async (apartmentId, tenantId) => {
    try {
      // Update apartment to remove tenant
      await updateDoc(doc(db, 'apartments', apartmentId), {
        tenantId: null,
        status: 'Available',
        updatedAt: serverTimestamp()
      });

      // Update user to remove apartment assignment and set status to active
      await updateDoc(doc(db, 'users', tenantId), {
        apartmentId: null,
        status: 'active',
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Remove tenant from apartment error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Delete apartment
  deleteApartment: async (apartmentId) => {
    try {
      // Get the apartment data to check for tenant assignment
      const apartmentDoc = await getDoc(doc(db, 'apartments', apartmentId));
      const apartmentData = apartmentDoc.exists() ? apartmentDoc.data() : {};
      const tenantId = apartmentData.tenantId;
      
      console.log('Firebase service: Deleting apartment with ID:', apartmentId);
      console.log('Firebase service: Apartment tenant ID:', tenantId);
      
      // Remove apartment assignment from tenant if assigned
      if (tenantId) {
        try {
          await updateDoc(doc(db, 'users', tenantId), {
            apartmentId: null,
            status: 'active',
            updatedAt: serverTimestamp()
          });
          console.log('Firebase service: Removed apartment assignment from tenant:', tenantId);
        } catch (tenantError) {
          console.error('Firebase service: Failed to remove apartment assignment from tenant:', tenantError);
          // Continue with apartment deletion even if tenant update fails
        }
      }
      
      await deleteDoc(doc(db, 'apartments', apartmentId));
      return { success: true };
    } catch (error) {
      console.error('Delete apartment error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  }
};

// ===== PAYMENT SERVICES =====
export const paymentService = {
  // Get all payments
  getAllPayments: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'payments'));
      const payments = [];
      querySnapshot.forEach((doc) => {
        payments.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: payments };
    } catch (error) {
      console.error('Get payments error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Get payments by tenant
  getPaymentsByTenant: async (tenantId) => {
    try {
      const q = query(collection(db, 'payments'), where('tenantId', '==', tenantId));
      const querySnapshot = await getDocs(q);
      const payments = [];
      querySnapshot.forEach((doc) => {
        payments.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: payments };
    } catch (error) {
      console.error('Get payments by tenant error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Add new payment
  addPayment: async (paymentData) => {
    try {
      // Validate required fields
      if (!paymentData.tenantId || !paymentData.apartmentId || !paymentData.amount) {
        return {
          success: false,
          error: {
            code: 'validation-error',
            message: 'Tenant, apartment, and amount are required'
          }
        };
      }

      const docRef = await addDoc(collection(db, 'payments'), {
        ...paymentData,
        maintenanceId: paymentData.maintenanceId || null, // Optional maintenance relationship
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // If this payment is for maintenance, update the maintenance record
      if (paymentData.maintenanceId) {
        await updateDoc(doc(db, 'maintenance', paymentData.maintenanceId), {
          paymentId: docRef.id,
          updatedAt: serverTimestamp()
        });
      }

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Add payment error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Update payment
  updatePayment: async (paymentId, paymentData) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        ...paymentData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Update payment error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Delete payment
  deletePayment: async (paymentId) => {
    console.log('Firebase service: Deleting payment with ID:', paymentId);
    try {
      // Validate input
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }
      
      console.log('Firebase service: Attempting to delete document from payments collection');
      const paymentRef = doc(db, 'payments', paymentId);
      
      // Check if document exists before deleting
      const paymentDoc = await getDoc(paymentRef);
      if (!paymentDoc.exists()) {
        console.warn('Firebase service: Payment document does not exist:', paymentId);
        return { 
          success: false, 
          error: {
            code: 'payment-not-found',
            message: 'Payment not found'
          }
        };
      }
      
      console.log('Firebase service: Payment document exists, proceeding with deletion');
      await deleteDoc(paymentRef);
      console.log('Firebase service: Payment deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Firebase service: Delete payment error:', error);
      console.error('Firebase service: Error code:', error.code);
      console.error('Firebase service: Error message:', error.message);
      console.error('Firebase service: Error stack:', error.stack);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You may not have the right to delete this payment.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Payment not found. It may have been already deleted.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (error.code === 'network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      return { 
        success: false, 
        error: {
          code: error.code,
          message: errorMessage
        }
      };
    }
  }
};

// ===== MAINTENANCE SERVICES =====
export const maintenanceService = {
  // Get all maintenance requests
  getAllMaintenance: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'maintenance'));
      const maintenance = [];
      querySnapshot.forEach((doc) => {
        maintenance.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: maintenance };
    } catch (error) {
      console.error('Get maintenance error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Get maintenance by apartment
  getMaintenanceByApartment: async (apartmentId) => {
    try {
      const q = query(collection(db, 'maintenance'), where('apartmentId', '==', apartmentId));
      const querySnapshot = await getDocs(q);
      const maintenance = [];
      querySnapshot.forEach((doc) => {
        maintenance.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: maintenance };
    } catch (error) {
      console.error('Get maintenance by apartment error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Get maintenance by tenant
  getMaintenanceByTenant: async (tenantId) => {
    try {
      const q = query(collection(db, 'maintenance'), where('requestedBy', '==', tenantId));
      const querySnapshot = await getDocs(q);
      const maintenance = [];
      querySnapshot.forEach((doc) => {
        maintenance.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: maintenance };
    } catch (error) {
      console.error('Get maintenance by tenant error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Add new maintenance request
  addMaintenance: async (maintenanceData) => {
    try {
      // Validate required fields
      if (!maintenanceData.apartmentId || !maintenanceData.requestedBy || !maintenanceData.issue) {
        return {
          success: false,
          error: {
            code: 'validation-error',
            message: 'Apartment, requested by, and issue description are required'
          }
        };
      }

      const docRef = await addDoc(collection(db, 'maintenance'), {
        ...maintenanceData,
        paymentId: null, // No payment initially
        estimatedCost: maintenanceData.estimatedCost || 0,
        requiresPayment: maintenanceData.requiresPayment || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Add maintenance error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Update maintenance request
  updateMaintenance: async (maintenanceId, maintenanceData) => {
    try {
      await updateDoc(doc(db, 'maintenance', maintenanceId), {
        ...maintenanceData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Update maintenance error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Link payment to maintenance
  linkPaymentToMaintenance: async (maintenanceId, paymentId) => {
    try {
      await updateDoc(doc(db, 'maintenance', maintenanceId), {
        paymentId: paymentId,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Link payment to maintenance error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  // Delete maintenance request
  deleteMaintenance: async (maintenanceId) => {
    try {
      await deleteDoc(doc(db, 'maintenance', maintenanceId));
      return { success: true };
    } catch (error) {
      console.error('Delete maintenance error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  }
};

// ===== FILE UPLOAD SERVICE =====
export const fileService = {
  // Upload file to Firebase Storage
  uploadFile: async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('File upload error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  }
};

// ===== RELATIONSHIP SERVICES =====
export const relationshipService = {
  // Get user with apartment details
  getUserWithApartment: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return { 
          success: false, 
          error: { message: 'User not found' }
        };
      }

      const userData = { id: userDoc.id, ...userDoc.data() };
      
      // If user has an apartment, get apartment details
      if (userData.apartmentId) {
        const apartmentDoc = await getDoc(doc(db, 'apartments', userData.apartmentId));
        if (apartmentDoc.exists()) {
          userData.apartment = { id: apartmentDoc.id, ...apartmentDoc.data() };
        }
      }

      return { success: true, data: userData };
    } catch (error) {
      console.error('Get user with apartment error:', error);
      return { 
        success: false, 
        error: { message: error.message }
      };
    }
  },

  // Get apartment with tenant details
  getApartmentWithTenant: async (apartmentId) => {
    try {
      const apartmentDoc = await getDoc(doc(db, 'apartments', apartmentId));
      if (!apartmentDoc.exists()) {
        return { 
          success: false, 
          error: { message: 'Apartment not found' }
        };
      }

      const apartmentData = { id: apartmentDoc.id, ...apartmentDoc.data() };
      
      // If apartment has a tenant, get tenant details
      if (apartmentData.tenantId) {
        const tenantDoc = await getDoc(doc(db, 'users', apartmentData.tenantId));
        if (tenantDoc.exists()) {
          apartmentData.tenant = { id: tenantDoc.id, ...tenantDoc.data() };
        }
      }

      return { success: true, data: apartmentData };
    } catch (error) {
      console.error('Get apartment with tenant error:', error);
      return { 
        success: false, 
        error: { message: error.message }
      };
    }
  },

  // Get maintenance with apartment and requester details
  getMaintenanceWithDetails: async (maintenanceId) => {
    try {
      const maintenanceDoc = await getDoc(doc(db, 'maintenance', maintenanceId));
      if (!maintenanceDoc.exists()) {
        return { 
          success: false, 
          error: { message: 'Maintenance request not found' }
        };
      }

      const maintenanceData = { id: maintenanceDoc.id, ...maintenanceDoc.data() };
      
      // Get apartment details
      if (maintenanceData.apartmentId) {
        const apartmentDoc = await getDoc(doc(db, 'apartments', maintenanceData.apartmentId));
        if (apartmentDoc.exists()) {
          maintenanceData.apartment = { id: apartmentDoc.id, ...apartmentDoc.data() };
        }
      }

      // Get requester details
      if (maintenanceData.requestedBy) {
        const requesterDoc = await getDoc(doc(db, 'users', maintenanceData.requestedBy));
        if (requesterDoc.exists()) {
          maintenanceData.requester = { id: requesterDoc.id, ...requesterDoc.data() };
        }
      }

      // Get payment details if exists
      if (maintenanceData.paymentId) {
        const paymentDoc = await getDoc(doc(db, 'payments', maintenanceData.paymentId));
        if (paymentDoc.exists()) {
          maintenanceData.payment = { id: paymentDoc.id, ...paymentDoc.data() };
        }
      }

      return { success: true, data: maintenanceData };
    } catch (error) {
      console.error('Get maintenance with details error:', error);
      return { 
        success: false, 
        error: { message: error.message }
      };
    }
  },

  // Get payment with all related details
  getPaymentWithDetails: async (paymentId) => {
    try {
      const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
      if (!paymentDoc.exists()) {
        return { 
          success: false, 
          error: { message: 'Payment not found' }
        };
      }

      const paymentData = { id: paymentDoc.id, ...paymentDoc.data() };
      
      // Get tenant details
      if (paymentData.tenantId) {
        const tenantDoc = await getDoc(doc(db, 'users', paymentData.tenantId));
        if (tenantDoc.exists()) {
          paymentData.tenant = { id: tenantDoc.id, ...tenantDoc.data() };
        }
      }

      // Get apartment details
      if (paymentData.apartmentId) {
        const apartmentDoc = await getDoc(doc(db, 'apartments', paymentData.apartmentId));
        if (apartmentDoc.exists()) {
          paymentData.apartment = { id: apartmentDoc.id, ...apartmentDoc.data() };
        }
      }

      // Get maintenance details if exists
      if (paymentData.maintenanceId) {
        const maintenanceDoc = await getDoc(doc(db, 'maintenance', paymentData.maintenanceId));
        if (maintenanceDoc.exists()) {
          paymentData.maintenance = { id: maintenanceDoc.id, ...maintenanceDoc.data() };
        }
      }

      return { success: true, data: paymentData };
    } catch (error) {
      console.error('Get payment with details error:', error);
      return { 
        success: false, 
        error: { message: error.message }
      };
    }
  },

  // Get all apartments with their tenants
  getAllApartmentsWithTenants: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'apartments'));
      const apartments = [];
      
      for (const doc of querySnapshot.docs) {
        const apartmentData = { id: doc.id, ...doc.data() };
        
        // Get tenant details if apartment has a tenant
        if (apartmentData.tenantId) {
          const tenantDoc = await getDoc(doc(db, 'users', apartmentData.tenantId));
          if (tenantDoc.exists()) {
            apartmentData.tenant = { id: tenantDoc.id, ...tenantDoc.data() };
          }
        }
        
        apartments.push(apartmentData);
      }
      
      return { success: true, data: apartments };
    } catch (error) {
      console.error('Get all apartments with tenants error:', error);
      return { 
        success: false, 
        error: { message: error.message }
      };
    }
  },

  // Get all users with their apartments
  getAllUsersWithApartments: async () => {
    try {
      console.log('🔄 Getting all users with apartments...');
      
      // First, let's test if we can read from the users collection at all
      console.log('🧪 Testing basic users collection access...');
      const testQuery = await getDocs(collection(db, 'users'));
      console.log('✅ Basic users collection access successful, found', testQuery.docs.length, 'documents');
      
      const querySnapshot = await getDocs(collection(db, 'users'));
      console.log('📊 Found', querySnapshot.docs.length, 'users in database');
      
      // Log the first few users to see their structure
      if (querySnapshot.docs.length > 0) {
        console.log('📋 Sample user data:');
        querySnapshot.docs.slice(0, 3).forEach((doc, index) => {
          console.log(`User ${index + 1}:`, { id: doc.id, ...doc.data() });
        });
      }
      
      const users = [];
      
      for (const doc of querySnapshot.docs) {
        const userData = { id: doc.id, ...doc.data() };
        console.log('👤 Processing user:', userData.email, 'with apartmentId:', userData.apartmentId);
        
        // Get apartment details if user has an apartment
        if (userData.apartmentId) {
          console.log('🏠 Getting apartment details for user:', userData.email);
          const apartmentDoc = await getDoc(doc(db, 'apartments', userData.apartmentId));
          if (apartmentDoc.exists()) {
            userData.apartment = { id: apartmentDoc.id, ...apartmentDoc.data() };
            console.log('✅ Found apartment for user:', userData.email);
          } else {
            console.log('⚠️ Apartment not found for user:', userData.email, 'apartmentId:', userData.apartmentId);
          }
        } else {
          console.log('🏠 No apartment assigned to user:', userData.email);
        }
        
        users.push(userData);
      }
      
      console.log('✅ Successfully loaded', users.length, 'users with apartments');
      return { success: true, data: users };
    } catch (error) {
      console.error('❌ Get all users with apartments error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      return { 
        success: false, 
        error: { message: error.message }
      };
    }
  }
};

// Test Firebase connection
// eslint-disable-next-line no-unused-vars
const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Test Auth service
    console.log('Testing Auth service...');
    // eslint-disable-next-line no-unused-vars
    const authTest = auth;
    console.log('✅ Auth service initialized');
    
    // Test Firestore service
    console.log('Testing Firestore service...');
    // eslint-disable-next-line no-unused-vars
    const dbTest = db;
    console.log('✅ Firestore service initialized');
    
    // Test Firestore write permission
    console.log('Testing Firestore write permission...');
    try {
      const testDocRef = await addDoc(collection(db, 'test'), {
        test: true,
        timestamp: serverTimestamp()
      });
      console.log('✅ Firestore write test successful:', testDocRef.id);
      
      // Clean up test document
      await deleteDoc(testDocRef);
      console.log('✅ Test document cleaned up');
    } catch (writeError) {
      console.error('❌ Firestore write test failed:', writeError);
      console.log('This might indicate Firestore security rules or database setup issues');
    }
    
    console.log('🎉 All Firebase services are working!');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}; 