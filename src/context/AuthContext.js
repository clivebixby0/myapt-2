import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../firebase/services';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? firebaseUser.uid : 'No user');
      
      if (firebaseUser) {
        // Get user data from Firestore
        try {
          const result = await authService.getUserByUid(firebaseUser.uid);
          if (result.success) {
            const completeUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...result.data
            };
            console.log('Setting user in AuthContext:', completeUser);
            setUser(completeUser);
            localStorage.setItem('user', JSON.stringify(completeUser));
          } else {
            console.error('Failed to get user data from Firestore:', result.error);
            // Only clear user if we can't get the data for the current user
            setUser(null);
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          // Only clear user if we can't get the data for the current user
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        console.log('No Firebase user, clearing user state');
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Keep empty dependency array to avoid infinite loops

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        return { success: true, user: result.user };
      } else {
        return { 
          success: false, 
          error: result.error,
          message: result.error?.message || "Login failed. Please check your credentials."
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error,
        message: error.message || "An unexpected error occurred during login."
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error,
        message: error.message || "An error occurred during logout."
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 