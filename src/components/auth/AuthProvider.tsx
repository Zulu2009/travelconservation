import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../services/firebase/config';
import { AuthService } from '../../services/firebase/auth';
import { User } from '../../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userData = await AuthService.getCurrentUserData();
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    const user = await AuthService.signIn(email, password);
    setCurrentUser(user);
    return user;
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
    const user = await AuthService.signUp(email, password, displayName);
    setCurrentUser(user);
    return user;
  };

  const signInWithGoogle = async (): Promise<User> => {
    const user = await AuthService.signInWithGoogle();
    setCurrentUser(user);
    return user;
  };

  const signOut = async (): Promise<void> => {
    await AuthService.signOut();
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    await AuthService.updateUserProfile(userData);
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...userData });
    }
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
