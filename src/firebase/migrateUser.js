import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

// Migration script to fix user document ID
export const migrateUserDocument = async (oldUserId, newUid) => {
  try {
    console.log('🔄 Starting user document migration...');
    console.log('Old user ID:', oldUserId);
    console.log('New UID (document ID):', newUid);
    
    // Get the old user document
    const oldUserDoc = await getDoc(doc(db, 'users', oldUserId));
    
    if (!oldUserDoc.exists()) {
      console.error('❌ Old user document not found');
      return { success: false, error: 'Old user document not found' };
    }
    
    const userData = oldUserDoc.data();
    console.log('📄 User data to migrate:', userData);
    
    // Create new document with UID as document ID
    const newUserDoc = doc(db, 'users', newUid);
    await setDoc(newUserDoc, {
      ...userData,
      uid: newUid, // Ensure UID field matches document ID
      updatedAt: new Date()
    });
    
    console.log('✅ New user document created with UID as document ID');
    
    // Delete the old document
    await deleteDoc(doc(db, 'users', oldUserId));
    console.log('🗑️ Old user document deleted');
    
    console.log('🎉 User migration completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
};

// Usage example:
// migrateUserDocument('5e4pWZFQFtmLvC1mPI7i', '7K3lvLLNsmPOkGRr1DKhsRP94AI2') 