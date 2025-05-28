// Core data types for TravelConservation.com

export interface ConservationListing {
  id: string;
  name: string;
  location: {
    country: string;
    region: string;
    coordinates: [number, number];
  };
  conservationType: 'wildlife' | 'marine' | 'forest' | 'cultural';
  luxuryLevel: 1 | 2 | 3 | 4 | 5;
  priceRange: 'budget' | 'mid' | 'luxury' | 'ultra-luxury';
  activities: string[];
  sustainabilityScore: number;
  certifications: string[];
  images: string[];
  description: string;
  contactInfo: ContactInfo;
  availability: DateRange[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  address: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  available: boolean;
  price?: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: UserPreferences;
  bookings: Booking[];
  savedListings: string[];
  conservationImpact: ConservationImpact;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  conservationTypes: string[];
  luxuryLevel: number[];
  budgetRange: [number, number];
  travelStyle: 'adventure' | 'luxury' | 'educational' | 'family';
  regions: string[];
  activities: string[];
}

export interface ConservationImpact {
  totalTrips: number;
  carbonOffset: number;
  wildlifeProtected: number;
  fundsContributed: number;
  certificationsEarned: string[];
}

export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  dateRange: DateRange;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced AI Persona types for trip planning
export interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  expertise: string[];
  personality: string;
  communicationStyle: string;
  focusAreas: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  systemPrompt: string;
  avatar?: string;
  backgroundColor: string;
  accentColor: string;
  icon: string;
  interests: string[];
  budgetRange: [number, number];
  travelStyle: 'adventure' | 'luxury' | 'educational' | 'family';
  conservationFocus: string[];
  recommendedListings: string[];
}

// Chat message types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'persona';
  timestamp: Date;
  personaId?: string;
  messageType?: 'text' | 'trip-plan' | 'suggestion';
}

// Trip plan types
export interface TripPlan {
  id: string;
  userId: string;
  personaId: string;
  title: string;
  description: string;
  duration: number;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  destinations: TripDestination[];
  activities: TripActivity[];
  accommodations: TripAccommodation[];
  conservationImpact: {
    projectsSupported: string[];
    carbonOffset: number;
    wildlifeProtected: number;
    communityBenefit: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TripDestination {
  id: string;
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  duration: number;
  description: string;
  conservationType: 'wildlife' | 'marine' | 'forest' | 'cultural';
  activities: string[];
}

export interface TripActivity {
  id: string;
  name: string;
  description: string;
  duration: number;
  cost: number;
  conservationImpact: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  groupSize: {
    min: number;
    max: number;
  };
}

export interface TripAccommodation {
  id: string;
  name: string;
  type: 'eco-lodge' | 'luxury-resort' | 'research-station' | 'safari-camp';
  sustainabilityScore: number;
  amenities: string[];
  pricePerNight: number;
  location: string;
  description: string;
}

// Chat session types
export interface ChatSession {
  id: string;
  userId: string;
  personaId: string;
  messages: ChatMessage[];
  tripPlan?: TripPlan;
  preferences: {
    budget: { min: number; max: number };
    duration: { min: number; max: number };
    groupSize: number;
    interests: string[];
    accessibility: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  listingId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  conservationImpactRating: number;
  luxuryRating: number;
  valueRating: number;
  createdAt: Date;
  verified: boolean;
}

export interface SearchFilters {
  conservationType?: string[];
  luxuryLevel?: number[];
  priceRange?: [number, number];
  location?: string;
  activities?: string[];
  sustainabilityScore?: number;
  dateRange?: DateRange;
  guests?: number;
}

export interface AnalyticsData {
  totalListings: number;
  totalUsers: number;
  totalBookings: number;
  conservationImpact: {
    totalCarbonOffset: number;
    totalWildlifeProtected: number;
    totalFundsRaised: number;
  };
  popularDestinations: Array<{
    country: string;
    bookings: number;
  }>;
  sustainabilityTrends: Array<{
    month: string;
    averageScore: number;
  }>;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface ListingFormData {
  name: string;
  description: string;
  location: {
    country: string;
    region: string;
    address: string;
  };
  conservationType: string;
  luxuryLevel: number;
  priceRange: string;
  activities: string[];
  certifications: string[];
  contactInfo: ContactInfo;
}

export interface UserProfileFormData {
  displayName: string;
  preferences: UserPreferences;
}

export interface BookingFormData {
  dateRange: DateRange;
  guests: number;
  specialRequests?: string;
}
