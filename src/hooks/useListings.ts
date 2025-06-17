import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '../services/firebase/config';

export interface ConservationListing {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  location: {
    country: string;
    region: string;
    coordinates: [number, number];
    timezone?: string;
  };
  conservation: {
    type: string[];
    impactMetrics: {
      acresProtected: number;
      speciesSupported: string[];
      annualFunding: number;
      yearsActive: number;
      urgencyScore: number;
      [key: string]: any;
    };
    certifications?: string[];
    sustainabilityScore: number;
  };
  pricing: {
    range: string;
    currency: string;
    perNight: boolean;
    averageCost: number;
    inclusions?: string[];
  };
  luxury: {
    level: number;
    amenities: string[];
    accommodation?: string;
  };
  images: string[];
  activities: string[];
  bestTimeToVisit?: string;
  featured: boolean;
  verified: boolean;
  partnershipLevel?: string;
  bookingInfo?: {
    email: string;
    phone: string;
    website: string;
  };
  reviews?: {
    averageRating: number;
    totalReviews: number;
    recentReview?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const useListings = (filters?: {
  conservationType?: string;
  country?: string;
  featured?: boolean;
  luxuryLevel?: number;
  maxPrice?: number;
}) => {
  const [listings, setListings] = useState<ConservationListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters?.conservationType) {
      constraints.push(where('conservation.type', 'array-contains', filters.conservationType));
    }
    if (filters?.country) {
      constraints.push(where('location.country', '==', filters.country));
    }
    if (filters?.featured) {
      constraints.push(where('featured', '==', true));
    }
    if (filters?.luxuryLevel) {
      constraints.push(where('luxury.level', '>=', filters.luxuryLevel));
    }

    // Default ordering
    constraints.push(orderBy('featured', 'desc'));
    constraints.push(orderBy('updatedAt', 'desc'));

    const q = query(collection(db, 'listings'), ...constraints);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const listingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as ConservationListing[];

        // Apply price filter (client-side since it's complex)
        const filteredListings = filters?.maxPrice 
          ? listingsData.filter(listing => listing.pricing.averageCost <= filters.maxPrice!)
          : listingsData;

        setListings(filteredListings);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching listings:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters]);

  return { listings, loading, error };
};
