import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase/config';

export const seedDatabase = async () => {
  console.log('🌱 Seeding database with sample conservation listings...');

  const sampleListings = [
    {
      id: 'maasai-mara-conservancy',
      name: 'Maasai Mara Wildlife Conservancy',
      description: 'Experience the Great Migration while supporting local conservation efforts. This luxury tented camp works directly with Maasai communities to protect wildlife corridors and provide sustainable income through responsible tourism.',
      longDescription: 'Witness one of nature\'s most spectacular events while making a real difference for wildlife conservation. Our partnership with local Maasai communities has created a sustainable model that protects over 15,000 acres of critical habitat while providing education and employment opportunities.',
      location: {
        country: 'Kenya',
        region: 'Maasai Mara',
        coordinates: [-1.4061, 35.0081],
        timezone: 'Africa/Nairobi'
      },
      conservation: {
        type: ['Wildlife Protection', 'Community Development', 'Anti-Poaching'],
        impactMetrics: {
          acresProtected: 15000,
          speciesSupported: ['African Elephant', 'Black Rhino', 'African Lion', 'Cheetah', 'Leopard'],
          annualFunding: 250000,
          yearsActive: 12,
          urgencyScore: 8,
          communityJobs: 45,
          antiPoachingUnits: 3
        },
        certifications: ['Travelife Gold', 'Fair Trade Tourism'],
        sustainabilityScore: 95
      },
      pricing: {
        range: '$800-1,200',
        currency: 'USD',
        perNight: true,
        averageCost: 1000,
        inclusions: ['All meals', 'Game drives', 'Conservation activities', 'Cultural visits']
      },
      luxury: {
        level: 4,
        amenities: ['Spa services', 'Private guides', 'Gourmet dining', 'WiFi', 'Laundry service'],
        accommodation: 'Luxury tented camp with en-suite bathrooms'
      },
      images: [
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800',
        'https://images.unsplash.com/photo-1551043357-45c4ac8b7c4e?w=800'
      ],
      activities: [
        'Game drives during migration season',
        'Visit to anti-poaching units',
        'Maasai cultural experience',
        'Conservation education program',
        'Night game drives'
      ],
      bestTimeToVisit: 'July-October (Great Migration)',
      featured: true,
      verified: true,
      partnershipLevel: 'Premium',
      bookingInfo: {
        email: 'bookings@maasaimaraconservancy.org',
        phone: '+254-123-456-789',
        website: 'https://maasaimaraconservancy.org'
      },
      reviews: {
        averageRating: 4.8,
        totalReviews: 156,
        recentReview: 'Absolutely life-changing experience. Knowing our stay directly supported ranger salaries made it even more meaningful.'
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2025-01-20')
    },
    
    {
      id: 'galapagos-eco-lodge',
      name: 'Galápagos Marine Research Lodge',
      description: 'Luxury eco-lodge supporting marine conservation research in the Galápagos. Participate in sea turtle monitoring and coral reef restoration while enjoying world-class accommodations.',
      longDescription: 'Combine luxury with meaningful conservation work in one of the world\'s most important marine ecosystems. Our lodge partners with the Charles Darwin Foundation to conduct critical research on marine species recovery.',
      location: {
        country: 'Ecuador',
        region: 'Galápagos Islands',
        coordinates: [-0.9538, -90.9656],
        timezone: 'Pacific/Galapagos'
      },
      conservation: {
        type: ['Marine Conservation', 'Species Research', 'Ecosystem Restoration'],
        impactMetrics: {
          acresProtected: 5000,
          speciesSupported: ['Galápagos Tortoise', 'Marine Iguana', 'Blue-footed Booby', 'Sea Lions', 'Hammerhead Sharks'],
          annualFunding: 180000,
          yearsActive: 8,
          urgencyScore: 9,
          researchProjects: 12,
          scientistSupport: 15
        },
        certifications: ['Smart Voyager', 'Rainforest Alliance'],
        sustainabilityScore: 98
      },
      pricing: {
        range: '$1,500-2,500',
        currency: 'USD',
        perNight: true,
        averageCost: 2000,
        inclusions: ['All meals', 'Research activities', 'Equipment', 'Expert guides', 'Transfers']
      },
      luxury: {
        level: 5,
        amenities: ['Ocean view suites', 'Research lab access', 'Expert naturalists', 'Diving equipment', 'Observatory deck'],
        accommodation: 'Sustainable luxury suites with private terraces'
      },
      images: [
        'https://images.unsplash.com/photo-1582543849368-9b1caec2e6c9?w=800',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
      ],
      activities: [
        'Sea turtle monitoring',
        'Coral reef restoration diving',
        'Marine species research',
        'Underwater photography workshops',
        'Endemic species observation'
      ],
      bestTimeToVisit: 'December-May (warm season)',
      featured: true,
      verified: true,
      partnershipLevel: 'Research Partner',
      bookingInfo: {
        email: 'research@galapagosecolodge.com',
        phone: '+593-5-252-6146',
        website: 'https://galapagosecolodge.com'
      },
      reviews: {
        averageRating: 4.9,
        totalReviews: 89,
        recentReview: 'Participated in actual marine research while staying in paradise. The scientists were amazing teachers.'
      },
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2025-01-18')
    },

    {
      id: 'amazon-rainforest-reserve',
      name: 'Amazon Rainforest Conservation Reserve',
      description: 'Immerse yourself in pristine rainforest while protecting biodiversity. This eco-luxury lodge supports indigenous communities and reforestation programs in the Brazilian Amazon.',
      longDescription: 'Experience the world\'s most biodiverse ecosystem while directly supporting indigenous land rights and reforestation efforts. Our reserve protects critical habitat for endangered species and traditional ways of life.',
      location: {
        country: 'Brazil',
        region: 'Amazon Basin',
        coordinates: [-3.4653, -62.2159],
        timezone: 'America/Manaus'
      },
      conservation: {
        type: ['Forest Protection', 'Indigenous Rights', 'Biodiversity Research', 'Reforestation'],
        impactMetrics: {
          acresProtected: 25000,
          speciesSupported: ['Jaguar', 'Giant Otter', 'Harpy Eagle', 'Pink River Dolphin', 'Three-toed Sloth'],
          annualFunding: 320000,
          yearsActive: 15,
          urgencyScore: 9,
          treesPlanted: 50000,
          indigenousFamilies: 120
        },
        certifications: ['FSC Certified', 'Indigenous Partnership Certified'],
        sustainabilityScore: 92
      },
      pricing: {
        range: '$600-900',
        currency: 'USD',
        perNight: true,
        averageCost: 750,
        inclusions: ['All meals', 'Guided expeditions', 'Canoe trips', 'Cultural experiences', 'Research participation']
      },
      luxury: {
        level: 4,
        amenities: ['Canopy walkways', 'Indigenous guides', 'Research station', 'Medicinal plant tours', 'Night sounds experience'],
        accommodation: 'Sustainable bungalows in the forest canopy'
      },
      images: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
        'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800'
      ],
      activities: [
        'Canopy research expeditions',
        'Indigenous cultural exchange',
        'Medicinal plant workshops',
        'Wildlife tracking',
        'Reforestation participation'
      ],
      bestTimeToVisit: 'June-November (dry season)',
      featured: true,
      verified: true,
      partnershipLevel: 'Community Partner',
      bookingInfo: {
        email: 'reservations@amazonreserve.org',
        phone: '+55-92-3234-5678',
        website: 'https://amazonreserve.org'
      },
      reviews: {
        averageRating: 4.7,
        totalReviews: 134,
        recentReview: 'Learning from indigenous elders about forest conservation was incredibly moving. True cultural exchange.'
      },
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2025-01-15')
    }
  ];

  // Add conservation metrics
  const conservationMetrics = {
    totalFunding: 2450000,
    acresProtected: 847000,
    speciesSaved: 23,
    averageCostPerAcre: 2.84,
    urgentProjects: 8,
    activePrograms: 156,
    lastUpdated: new Date()
  };

  try {
    // Add sample listings
    for (const listing of sampleListings) {
      await setDoc(doc(db, 'listings', listing.id), listing);
      console.log(`✅ Added listing: ${listing.name}`);
    }

    // Add conservation metrics
    await setDoc(doc(db, 'conservation-metrics', 'global'), conservationMetrics);
    console.log('✅ Added conservation metrics');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
