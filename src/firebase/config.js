import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBpfvmvjKGH_sQ7Ucr0hrs-D56WO2DZIo",
  authDomain: "apartment-management-app-4a33a.firebaseapp.com",
  projectId: "apartment-management-app-4a33a",
  storageBucket: "apartment-management-app-4a33a.firebasestorage.app",
  messagingSenderId: "405489818061",
  appId: "1:405489818061:web:b0595d34ddf5f53cb54c84",
  measurementId: "G-T4S9B2CGTM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 