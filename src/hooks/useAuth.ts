import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase/config';
import { AuthService } from '../services/firebase/auth';
import { User } from '../types';

// Custom hook for Firebase authentication
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const user = await AuthService.signIn(email, password);
      setUserData(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setLoading(true);
      const user = await AuthService.signUp(email, password, displayName);
      setUserData(user);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google sign in function
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const user = await AuthService.signInWithGoogle();
      setUserData(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setError(null);
      await AuthService.signOut();
      setUserData(null);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await AuthService.resetPassword(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      throw err;
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Get user data from Firestore
        try {
          const userData = await AuthService.getCurrentUserData();
          setUserData(userData);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    currentUser,
    userData,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearError
  };
}

// Hook for protected routes
export function useRequireAuth() {
  const { currentUser, loading } = useAuth();
  
  return {
    user: currentUser,
    loading,
    isAuthenticated: !!currentUser
  };
}

export default useAuth;
