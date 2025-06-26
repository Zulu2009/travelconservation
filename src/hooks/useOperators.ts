import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '../services/firebase/config';

export interface Operator {
  id: string;
  name: string;
  description: string;
  location: string;
  country?: string;
  region?: string;
  website?: string;
  email?: string;
  phone?: string;
  trustScore: number;
  sustainabilityRating: number;
  riskLevel: 'low' | 'medium' | 'high';
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'needs-review';
  source: string;
  discoveredAt: any;
  lastAnalyzed?: any;
  certifications?: string[];
  metrics?: {
    overallScore: number;
    conservationROI: number;
    communityROI: number;
    sustainabilityIndex: number;
    impactScore: number;
    transparencyScore: number;
    localBenefit: number;
  };
  analysis?: {
    summary: string;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
    aiConfidence: number;
  };
  activities?: string[];
  accommodationType?: string;
  priceRange?: string;
  bestTimeToVisit?: string;
  images?: string[];
}

export const useOperators = (filters?: {
  verificationStatus?: string;
  country?: string;
  riskLevel?: string;
  minTrustScore?: number;
  source?: string;
}) => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters?.verificationStatus) {
      constraints.push(where('verificationStatus', '==', filters.verificationStatus));
    }
    if (filters?.country) {
      constraints.push(where('country', '==', filters.country));
    }
    if (filters?.riskLevel) {
      constraints.push(where('riskLevel', '==', filters.riskLevel));
    }
    if (filters?.source) {
      constraints.push(where('source', '==', filters.source));
    }

    // Don't use orderBy initially to avoid index issues
    const q = query(collection(db, 'operators'), ...constraints);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const operatorsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure required fields have defaults
            trustScore: data.trustScore || 0,
            sustainabilityRating: data.sustainabilityRating || 0,
            riskLevel: data.riskLevel || 'medium',
            verificationStatus: data.verificationStatus || 'pending',
            discoveredAt: data.discoveredAt?.toDate(),
            lastAnalyzed: data.lastAnalyzed?.toDate(),
          };
        }) as Operator[];

        // Apply trust score filter and sort client-side
        let filteredOperators = filters?.minTrustScore 
          ? operatorsData.filter(op => op.trustScore >= filters.minTrustScore!)
          : operatorsData;

        // Sort by verification status first, then trust score
        filteredOperators.sort((a, b) => {
          if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
          if (b.verificationStatus === 'verified' && a.verificationStatus !== 'verified') return 1;
          return b.trustScore - a.trustScore;
        });

        setOperators(filteredOperators);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching operators:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters]);

  return { operators, loading, error };
};
