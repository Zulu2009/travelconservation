import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserPreferences } from '../../types';

// Auth service class
export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update the user's display name
      await updateProfile(firebaseUser, { displayName });

      // Create user document in Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        photoURL: firebaseUser.photoURL || undefined,
        preferences: {
          conservationTypes: [],
          luxuryLevel: [1, 2, 3, 4, 5],
          budgetRange: [0, 10000],
          travelStyle: 'luxury',
          regions: [],
          activities: [],
        },
        bookings: [],
        savedListings: [],
        conservationImpact: {
          totalTrips: 0,
          carbonOffset: 0,
          wildlifeProtected: 0,
          fundsContributed: 0,
          certificationsEarned: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      return userData;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign in with Google
  static async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        return userDoc.data() as User;
      } else {
        // Create new user document
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || undefined,
          preferences: {
            conservationTypes: [],
            luxuryLevel: [1, 2, 3, 4, 5],
            budgetRange: [0, 10000],
            travelStyle: 'luxury',
            regions: [],
            activities: [],
          },
          bookings: [],
          savedListings: [],
          conservationImpact: {
            totalTrips: 0,
            carbonOffset: 0,
            wildlifeProtected: 0,
            fundsContributed: 0,
            certificationsEarned: [],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        return userData;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Send password reset email
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Update password
  static async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Get current user data
  static async getCurrentUserData(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user data:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(userData: Partial<User>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Update Firebase Auth profile if display name or photo URL changed
      if (userData.displayName || userData.photoURL) {
        await updateProfile(user, {
          displayName: userData.displayName,
          photoURL: userData.photoURL,
        });
      }

      // Update Firestore document
      const updateData = {
        ...userData,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), updateData, { merge: true });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export default AuthService;
