import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import {
  ConservationListing,
  SearchFilters,
  PaginatedResponse,
  Booking,
  Review,
  Persona,
  AnalyticsData,
} from '../../types';

// Firestore service class
export class FirestoreService {
  // Conservation Listings
  static async getListings(
    filters?: SearchFilters,
    pageSize: number = 12,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<PaginatedResponse<ConservationListing>> {
    try {
      let q = query(collection(db, 'listings'));

      // Apply filters
      if (filters) {
        if (filters.conservationType && filters.conservationType.length > 0) {
          q = query(q, where('conservationType', 'in', filters.conservationType));
        }
        if (filters.luxuryLevel && filters.luxuryLevel.length > 0) {
          q = query(q, where('luxuryLevel', 'in', filters.luxuryLevel));
        }
        if (filters.location) {
          q = query(q, where('location.country', '==', filters.location));
        }
        if (filters.sustainabilityScore) {
          q = query(q, where('sustainabilityScore', '>=', filters.sustainabilityScore));
        }
      }

      // Add ordering and pagination
      q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const listings: ConservationListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ConservationListing);
      });

      return {
        data: listings,
        total: querySnapshot.size,
        page: lastDoc ? 1 : 0, // Simplified pagination
        limit: pageSize,
        hasMore: querySnapshot.size === pageSize,
      };
    } catch (error) {
      console.error('Error getting listings:', error);
      throw error;
    }
  }

  static async getListingById(id: string): Promise<ConservationListing | null> {
    try {
      const docRef = doc(db, 'listings', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ConservationListing;
      }
      return null;
    } catch (error) {
      console.error('Error getting listing:', error);
      throw error;
    }
  }

  static async createListing(listing: Omit<ConservationListing, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'listings'), {
        ...listing,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  static async updateListing(id: string, updates: Partial<ConservationListing>): Promise<void> {
    try {
      const docRef = doc(db, 'listings', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  static async deleteListing(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'listings', id));
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  }

  // Bookings
  static async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...booking,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  static async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookings: Booking[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Booking);
      });

      return bookings;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  static async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Reviews
  static async createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...review,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  static async getListingReviews(listingId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('listingId', '==', listingId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Review);
      });

      return reviews;
    } catch (error) {
      console.error('Error getting listing reviews:', error);
      throw error;
    }
  }

  // Personas
  static async getPersonas(): Promise<Persona[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'personas'));
      const personas: Persona[] = [];
      
      querySnapshot.forEach((doc) => {
        personas.push({
          id: doc.id,
          ...doc.data(),
        } as Persona);
      });

      return personas;
    } catch (error) {
      console.error('Error getting personas:', error);
      throw error;
    }
  }

  static async getPersonaById(id: string): Promise<Persona | null> {
    try {
      const docRef = doc(db, 'personas', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Persona;
      }
      return null;
    } catch (error) {
      console.error('Error getting persona:', error);
      throw error;
    }
  }

  // Analytics
  static async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      // This would typically involve multiple queries and aggregations
      // For now, returning mock data structure
      const [listingsSnapshot, usersSnapshot, bookingsSnapshot] = await Promise.all([
        getDocs(collection(db, 'listings')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'bookings')),
      ]);

      return {
        totalListings: listingsSnapshot.size,
        totalUsers: usersSnapshot.size,
        totalBookings: bookingsSnapshot.size,
        conservationImpact: {
          totalCarbonOffset: 0, // Would be calculated from actual data
          totalWildlifeProtected: 0,
          totalFundsRaised: 0,
        },
        popularDestinations: [],
        sustainabilityTrends: [],
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      throw error;
    }
  }

  // Search functionality
  static async searchListings(searchTerm: string): Promise<ConservationListing[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simplified implementation
      const q = query(
        collection(db, 'listings'),
        orderBy('name'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const listings: ConservationListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const listing = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ConservationListing;
        
        // Simple text matching
        if (
          listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.location.country.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          listings.push(listing);
        }
      });

      return listings;
    } catch (error) {
      console.error('Error searching listings:', error);
      throw error;
    }
  }

  // User saved listings
  static async saveListingForUser(userId: string, listingId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const savedListings = userData.savedListings || [];
        
        if (!savedListings.includes(listingId)) {
          savedListings.push(listingId);
          await updateDoc(userRef, {
            savedListings,
            updatedAt: Timestamp.now(),
          });
        }
      }
    } catch (error) {
      console.error('Error saving listing for user:', error);
      throw error;
    }
  }

  static async removeSavedListingForUser(userId: string, listingId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const savedListings = userData.savedListings || [];
        const updatedSavedListings = savedListings.filter((id: string) => id !== listingId);
        
        await updateDoc(userRef, {
          savedListings: updatedSavedListings,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error removing saved listing for user:', error);
      throw error;
    }
  }
}

export default FirestoreService;
