// Research Database for Conservation Travel
export interface ResearchProject {
  id: string;
  title: string;
  location: string;
  country: string;
  type: 'marine' | 'wildlife' | 'forest' | 'climate' | 'community';
  description: string;
  impact: string;
  participationLevel: 'beginner' | 'intermediate' | 'expert';
  duration: string;
  cost: string;
  season: string;
  organization: string;
  website?: string;
  coordinates?: { lat: number; lng: number };
  tags: string[];
}

export interface ConservationFact {
  id: string;
  category: string;
  fact: string;
  source: string;
  relevantTo: string[];
}

export interface TravelDestination {
  id: string;
  name: string;
  country: string;
  region: string;
  conservationFocus: string[];
  bestTimeToVisit: string;
  accessLevel: 'easy' | 'moderate' | 'challenging';
  accommodations: string[];
  activities: string[];
  impactMetrics: string;
}

export interface VerifiedSupplier {
  id: string;
  name: string;
  type: 'lodge' | 'tour-operator' | 'research-station' | 'ngo' | 'transport' | 'equipment';
  location: string;
  country: string;
  specialization: string[];
  trustScore: number; // 1-10
  sustainabilityRating: number; // 1-5
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  capacity: number;
  certifications: string[];
  conservationImpact: {
    projectsSupported: number;
    fundsRaised: string;
    speciesProtected: string[];
    communityBenefits: string;
  };
  clientReviews: {
    averageRating: number;
    totalReviews: number;
    recentFeedback: string[];
  };
  contactInfo: {
    website?: string;
    email?: string;
    phone?: string;
  };
  verificationDate: string;
  lastAudit: string;
  roi: {
    conservationROI: string;
    communityROI: string;
    researchROI: string;
  };
}

export interface ResearchMetric {
  id: string;
  category: string;
  metric: string;
  value: string;
  source: string;
  lastUpdated: string;
  reliability: 'high' | 'medium' | 'low';
  relevantSuppliers: string[];
}

// Verified Suppliers Database
export const verifiedSuppliers: VerifiedSupplier[] = [
  {
    id: 'finch-bay-galapagos',
    name: 'Finch Bay Eco Hotel',
    type: 'lodge',
    location: 'Santa Cruz Island, Galápagos',
    country: 'Ecuador',
    specialization: ['marine-conservation', 'eco-luxury', 'research-support'],
    trustScore: 9.2,
    sustainabilityRating: 5,
    priceRange: '$$$$',
    capacity: 54,
    certifications: ['Green Globe', 'Rainforest Alliance', 'Smart Voyager'],
    conservationImpact: {
      projectsSupported: 12,
      fundsRaised: '$2.3M annually',
      speciesProtected: ['Marine Iguanas', 'Giant Tortoises', 'Blue-footed Boobies'],
      communityBenefits: '85% local staff, community education programs'
    },
    clientReviews: {
      averageRating: 4.8,
      totalReviews: 847,
      recentFeedback: [
        'Exceptional conservation focus with luxury comfort',
        'Staff incredibly knowledgeable about local wildlife',
        'Every activity felt meaningful for conservation'
      ]
    },
    contactInfo: {
      website: 'https://www.finchbayhotel.com',
      email: 'reservations@finchbayhotel.com',
      phone: '+593-5-252-6297'
    },
    verificationDate: '2024-11-15',
    lastAudit: '2024-10-20',
    roi: {
      conservationROI: '15:1 (funds to conservation impact)',
      communityROI: '8:1 (local economic benefit)',
      researchROI: '12:1 (research data value)'
    }
  },
  {
    id: 'amboseli-porini',
    name: 'Porini Amboseli Camp',
    type: 'lodge',
    location: 'Amboseli Ecosystem',
    country: 'Kenya',
    specialization: ['elephant-conservation', 'community-conservancy', 'wildlife-research'],
    trustScore: 8.9,
    sustainabilityRating: 5,
    priceRange: '$$$',
    capacity: 20,
    certifications: ['Travelife Gold', 'Kenya Eco-Tourism Society'],
    conservationImpact: {
      projectsSupported: 8,
      fundsRaised: '$1.8M annually',
      speciesProtected: ['African Elephants', 'Lions', 'Cheetahs'],
      communityBenefits: '100% Maasai owned, school funding, healthcare'
    },
    clientReviews: {
      averageRating: 4.7,
      totalReviews: 523,
      recentFeedback: [
        'Authentic Maasai experience with real conservation impact',
        'Incredible elephant encounters with research context',
        'Felt like contributing to something meaningful'
      ]
    },
    contactInfo: {
      website: 'https://www.porini.com',
      email: 'info@porini.com',
      phone: '+254-20-712-0932'
    },
    verificationDate: '2024-12-01',
    lastAudit: '2024-11-10',
    roi: {
      conservationROI: '18:1 (community conservancy impact)',
      communityROI: '22:1 (direct Maasai benefit)',
      researchROI: '9:1 (elephant research data)'
    }
  },
  {
    id: 'monteverde-institute',
    name: 'Monteverde Institute Research Station',
    type: 'research-station',
    location: 'Monteverde Cloud Forest',
    country: 'Costa Rica',
    specialization: ['biodiversity-research', 'climate-studies', 'education'],
    trustScore: 9.5,
    sustainabilityRating: 5,
    priceRange: '$$',
    capacity: 40,
    certifications: ['Carbon Neutral', 'Sustainable Tourism CST'],
    conservationImpact: {
      projectsSupported: 25,
      fundsRaised: '$3.2M annually',
      speciesProtected: ['Quetzals', 'Cloud Forest Species', '400+ bird species'],
      communityBenefits: 'Local employment, student scholarships, research training'
    },
    clientReviews: {
      averageRating: 4.9,
      totalReviews: 312,
      recentFeedback: [
        'World-class research facility with incredible biodiversity',
        'Educational experience exceeded all expectations',
        'Contributing to real scientific discoveries'
      ]
    },
    contactInfo: {
      website: 'https://www.monteverde-institute.org',
      email: 'info@mvinstitute.org',
      phone: '+506-2645-5053'
    },
    verificationDate: '2024-11-20',
    lastAudit: '2024-10-15',
    roi: {
      conservationROI: '25:1 (biodiversity research impact)',
      communityROI: '12:1 (local economic benefit)',
      researchROI: '35:1 (scientific publication value)'
    }
  }
];

// Research Metrics Database
export const researchMetrics: ResearchMetric[] = [
  {
    id: 'coral-restoration-success',
    category: 'Marine Conservation',
    metric: 'Coral Restoration Success Rate',
    value: '73% survival rate after 2 years',
    source: 'Australian Institute of Marine Science',
    lastUpdated: '2024-11-01',
    reliability: 'high',
    relevantSuppliers: ['finch-bay-galapagos']
  },
  {
    id: 'elephant-population-trend',
    category: 'Wildlife Conservation',
    metric: 'Amboseli Elephant Population',
    value: '1,673 individuals (stable, +2.3% annually)',
    source: 'Amboseli Trust for Elephants',
    lastUpdated: '2024-10-15',
    reliability: 'high',
    relevantSuppliers: ['amboseli-porini']
  },
  {
    id: 'cloud-forest-species-count',
    category: 'Biodiversity',
    metric: 'Monteverde Species Diversity',
    value: '2,500+ species in 26,000 hectares',
    source: 'Monteverde Institute',
    lastUpdated: '2024-11-10',
    reliability: 'high',
    relevantSuppliers: ['monteverde-institute']
  }
];

// Research Projects Database
export const researchProjects: ResearchProject[] = [
  {
    id: 'galapagos-marine-1',
    title: 'Galápagos Marine Iguana Population Study',
    location: 'Galápagos Islands',
    country: 'Ecuador',
    type: 'marine',
    description: 'Monitor marine iguana populations and their adaptation to climate change. Participants assist with data collection, behavioral observations, and habitat mapping.',
    impact: 'Critical data for understanding climate adaptation in endemic species. Research directly informs conservation policy.',
    participationLevel: 'intermediate',
    duration: '2-4 weeks',
    cost: '$3,500-6,000',
    season: 'Year-round (best: June-November)',
    organization: 'Charles Darwin Foundation',
    website: 'https://www.darwinfoundation.org',
    coordinates: { lat: -0.7893, lng: -91.0542 },
    tags: ['marine', 'climate-change', 'endemic-species', 'data-collection']
  },
  {
    id: 'kenya-elephant-1',
    title: 'Amboseli Elephant Research Project',
    location: 'Amboseli National Park',
    country: 'Kenya',
    type: 'wildlife',
    description: 'Long-term elephant behavior and family structure research. Assist with photo-identification, GPS collaring, and human-wildlife conflict mitigation.',
    impact: 'World\'s longest-running elephant study. Data used globally for elephant conservation strategies.',
    participationLevel: 'beginner',
    duration: '1-3 weeks',
    cost: '$2,800-4,500',
    season: 'June-October, January-March',
    organization: 'Amboseli Trust for Elephants',
    coordinates: { lat: -2.6912, lng: 37.2606 },
    tags: ['elephants', 'behavior-study', 'human-wildlife-conflict', 'photo-id']
  },
  {
    id: 'costa-rica-forest-1',
    title: 'Monteverde Cloud Forest Biodiversity Survey',
    location: 'Monteverde Cloud Forest',
    country: 'Costa Rica',
    type: 'forest',
    description: 'Comprehensive biodiversity monitoring in one of the world\'s most biodiverse ecosystems. Focus on bird, amphibian, and plant species documentation.',
    impact: 'Critical baseline data for climate change impact assessment. Discoveries of new species regularly occur.',
    participationLevel: 'intermediate',
    duration: '2-6 weeks',
    cost: '$2,200-5,000',
    season: 'December-April (dry season)',
    organization: 'Monteverde Institute',
    coordinates: { lat: 10.3009, lng: -84.7834 },
    tags: ['biodiversity', 'cloud-forest', 'species-discovery', 'climate-research']
  }
];

// Conservation Facts Database
export const conservationFacts: ConservationFact[] = [
  {
    id: 'marine-1',
    category: 'Marine Conservation',
    fact: 'Coral reefs support 25% of all marine species despite covering less than 1% of the ocean floor.',
    source: 'NOAA Coral Reef Conservation Program',
    relevantTo: ['marine', 'coral', 'biodiversity']
  },
  {
    id: 'elephant-1',
    category: 'Wildlife Conservation',
    fact: 'African elephant populations have declined by 60% over the last decade due to poaching and habitat loss.',
    source: 'African Wildlife Foundation',
    relevantTo: ['elephants', 'africa', 'poaching']
  },
  {
    id: 'forest-1',
    category: 'Forest Conservation',
    fact: 'Cloud forests capture water from fog, providing up to 60% of water supply for surrounding communities.',
    source: 'Tropical Montane Cloud Forest Initiative',
    relevantTo: ['cloud-forest', 'water', 'communities']
  }
];

// Travel Destinations Database
export const travelDestinations: TravelDestination[] = [
  {
    id: 'galapagos',
    name: 'Galápagos Islands',
    country: 'Ecuador',
    region: 'Pacific Ocean',
    conservationFocus: ['marine-conservation', 'endemic-species', 'evolution-research'],
    bestTimeToVisit: 'June-November (cooler, less rain)',
    accessLevel: 'moderate',
    accommodations: ['eco-lodges', 'research-stations', 'liveaboard-boats'],
    activities: ['snorkeling', 'wildlife-observation', 'research-participation', 'hiking'],
    impactMetrics: 'UNESCO World Heritage Site with 97% of land area protected'
  },
  {
    id: 'amboseli',
    name: 'Amboseli National Park',
    country: 'Kenya',
    region: 'East Africa',
    conservationFocus: ['elephant-conservation', 'human-wildlife-conflict', 'ecosystem-research'],
    bestTimeToVisit: 'June-October, January-March (dry seasons)',
    accessLevel: 'easy',
    accommodations: ['safari-lodges', 'research-camps', 'community-conservancies'],
    activities: ['game-drives', 'elephant-tracking', 'community-visits', 'research-assistance'],
    impactMetrics: 'Home to 1,600+ elephants, critical wildlife corridor'
  }
];

// Research Database Functions
export const searchProjects = (query: string, type?: string): ResearchProject[] => {
  const lowerQuery = query.toLowerCase();
  return researchProjects.filter(project => {
    const matchesQuery = 
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.location.toLowerCase().includes(lowerQuery) ||
      project.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    
    const matchesType = !type || project.type === type;
    
    return matchesQuery && matchesType;
  });
};

export const searchSuppliers = (query: string, type?: string, minTrustScore?: number): VerifiedSupplier[] => {
  const lowerQuery = query.toLowerCase();
  return verifiedSuppliers.filter(supplier => {
    const matchesQuery = 
      supplier.name.toLowerCase().includes(lowerQuery) ||
      supplier.location.toLowerCase().includes(lowerQuery) ||
      supplier.specialization.some(spec => spec.toLowerCase().includes(lowerQuery));
    
    const matchesType = !type || supplier.type === type;
    const meetsTrustScore = !minTrustScore || supplier.trustScore >= minTrustScore;
    
    return matchesQuery && matchesType && meetsTrustScore;
  });
};

export const getSuppliersByLocation = (country: string): VerifiedSupplier[] => {
  return verifiedSuppliers.filter(supplier => 
    supplier.country.toLowerCase() === country.toLowerCase()
  );
};

export const getTopSuppliers = (limit: number = 5): VerifiedSupplier[] => {
  return verifiedSuppliers
    .sort((a, b) => b.trustScore - a.trustScore)
    .slice(0, limit);
};

export const getMetricsByCategory = (category: string): ResearchMetric[] => {
  return researchMetrics.filter(metric => 
    metric.category.toLowerCase().includes(category.toLowerCase())
  );
};

export const getProjectsByLocation = (country: string): ResearchProject[] => {
  return researchProjects.filter(project => 
    project.country.toLowerCase() === country.toLowerCase()
  );
};

export const getFactsByCategory = (category: string): ConservationFact[] => {
  return conservationFacts.filter(fact => 
    fact.relevantTo.some(topic => topic.toLowerCase().includes(category.toLowerCase()))
  );
};

export const getDestinationInfo = (name: string): TravelDestination | undefined => {
  return travelDestinations.find(dest => 
    dest.name.toLowerCase().includes(name.toLowerCase())
  );
};

// Enhanced seed function for Firestore
export const seedResearchDatabase = async () => {
  const { doc, setDoc } = await import('firebase/firestore');
  const { db } = await import('../services/firebase/config');
  
  try {
    console.log('🌱 Seeding comprehensive research database...');
    
    // Seed verified suppliers
    for (const supplier of verifiedSuppliers) {
      await setDoc(doc(db, 'verified-suppliers', supplier.id), supplier);
    }
    
    // Seed research metrics
    for (const metric of researchMetrics) {
      await setDoc(doc(db, 'research-metrics', metric.id), metric);
    }
    
    // Seed research projects
    for (const project of researchProjects) {
      await setDoc(doc(db, 'research-projects', project.id), project);
    }
    
    // Seed conservation facts
    for (const fact of conservationFacts) {
      await setDoc(doc(db, 'conservation-facts', fact.id), fact);
    }
    
    // Seed travel destinations
    for (const destination of travelDestinations) {
      await setDoc(doc(db, 'travel-destinations', destination.id), destination);
    }
    
    console.log('✅ Research database seeded successfully!');
    console.log(`📊 Seeded: ${verifiedSuppliers.length} suppliers, ${researchMetrics.length} metrics, ${researchProjects.length} projects`);
    return true;
  } catch (error) {
    console.error('❌ Error seeding research database:', error);
    return false;
  }
};
