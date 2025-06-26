import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '../services/firebase/config';

// Base data for generating diverse operators
const COUNTRIES = [
  'Kenya', 'Tanzania', 'South Africa', 'Botswana', 'Namibia', 'Rwanda', 'Uganda', 'Ethiopia', 'Madagascar', 'Zambia',
  'Brazil', 'Peru', 'Ecuador', 'Colombia', 'Chile', 'Argentina', 'Bolivia', 'Costa Rica', 'Panama', 'Guatemala',
  'India', 'Nepal', 'Bhutan', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Sri Lanka', 'Myanmar', 'Cambodia',
  'Australia', 'New Zealand', 'Fiji', 'Vanuatu', 'Papua New Guinea', 'Solomon Islands',
  'Canada', 'USA', 'Mexico', 'Greenland', 'Iceland',
  'Norway', 'Sweden', 'Finland', 'Estonia', 'Latvia', 'Lithuania', 'Poland', 'Romania', 'Bulgaria'
];

const OPERATION_TYPES = [
  'Luxury Conservation-Focused', 'Mid-Range Eco-Lodge', 'Budget Conservation Camp', 'Community-Driven Initiative',
  'Research Station Lodge', 'Wildlife Sanctuary', 'Marine Conservation Resort', 'Forest Conservation Lodge',
  'Cultural Immersion Camp', 'Adventure Conservation', 'Photography Safari Lodge', 'Birding Specialist Lodge',
  'Primate Conservation Center', 'Marine Research Station', 'Sustainable Fishing Lodge', 'Reforestation Camp'
];

const CONSERVATION_FOCUSES = [
  ['wildlife protection', 'anti-poaching', 'habitat restoration'],
  ['marine conservation', 'coral restoration', 'sustainable fishing'],
  ['forest conservation', 'reforestation', 'carbon sequestration'],
  ['primate protection', 'habitat preservation', 'research support'],
  ['bird conservation', 'migration protection', 'habitat restoration'],
  ['rhino protection', 'endangered species', 'breeding programs'],
  ['elephant conservation', 'human-wildlife conflict', 'corridor protection'],
  ['marine mammals', 'whale protection', 'ocean cleanup'],
  ['indigenous rights', 'cultural preservation', 'traditional knowledge'],
  ['climate research', 'renewable energy', 'sustainability education']
];

const CERTIFICATIONS = [
  ['GSTC', 'Rainforest Alliance'], ['B-Corp', 'Fair Trade Tourism'], ['Green Globe', 'EarthCheck'],
  ['National Geographic', 'Conde Nast'], ['WWF Partner', 'Conservation International'],
  ['ISO 14001', 'Green Key'], ['PADI Green Star', 'Blue Flag'], ['Carbon Trust', 'Climate Action'],
  ['Fair Trade Certified', 'Responsible Tourism'], ['Indigenous Tourism', 'Cultural Heritage']
];

const ACTIVITIES = [
  ['wildlife safari', 'conservation education', 'community visits'],
  ['diving', 'snorkeling', 'marine research'],
  ['hiking', 'forest walks', 'canopy tours'],
  ['birdwatching', 'photography workshops', 'research participation'],
  ['cultural immersion', 'traditional crafts', 'local cuisine'],
  ['adventure sports', 'rock climbing', 'river rafting'],
  ['night safaris', 'tracking expeditions', 'conservation volunteering'],
  ['whale watching', 'dolphin encounters', 'beach conservation'],
  ['primate tracking', 'behavioral studies', 'habitat restoration'],
  ['astronomy tours', 'stargazing', 'dark sky preservation']
];

const SUSTAINABILITY_FEATURES = [
  ['solar power', 'water conservation', 'waste management'],
  ['renewable energy', 'carbon offset', 'local sourcing'],
  ['organic farming', 'permaculture', 'composting'],
  ['rainwater harvesting', 'greywater recycling', 'eco-building'],
  ['electric vehicles', 'bike transport', 'walking trails'],
  ['plastic reduction', 'packaging elimination', 'reusable materials'],
  ['community employment', 'local procurement', 'skill development'],
  ['wildlife corridors', 'habitat protection', 'species monitoring'],
  ['cultural preservation', 'traditional practices', 'indigenous knowledge'],
  ['research support', 'data collection', 'scientific collaboration']
];

const LOCATIONS = [
  'Serengeti National Park', 'Maasai Mara Reserve', 'Kruger National Park', 'Okavango Delta',
  'Amazon Rainforest', 'Atlantic Forest', 'Pantanal Wetlands', 'Patagonian Steppe',
  'Western Ghats', 'Sundarbans Mangroves', 'Borneo Rainforest', 'Great Barrier Reef',
  'Yellowstone Ecosystem', 'Great Bear Rainforest', 'Arctic Tundra', 'Svalbard Archipelago',
  'Carpathian Mountains', 'Scandinavian Forests', 'Mediterranean Coast', 'Alpine Regions'
];

function generateOperatorName(country: string, type: string, index: number): string {
  const prefixes = ['Eco', 'Green', 'Wild', 'Pure', 'Sacred', 'Ancient', 'Prime', 'Elite', 'Sanctuary', 'Haven'];
  const suffixes = ['Lodge', 'Camp', 'Resort', 'Retreat', 'Station', 'Center', 'Base', 'Haven', 'Sanctuary', 'Reserve'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const countryCode = country.substring(0, 2).toUpperCase();
  
  return `${prefix} ${countryCode} ${suffix} ${index}`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomPrice(tier: string): [number, number] {
  switch (tier) {
    case 'Budget': return [50 + Math.floor(Math.random() * 100), 150 + Math.floor(Math.random() * 100)];
    case 'Mid-Range': return [200 + Math.floor(Math.random() * 200), 400 + Math.floor(Math.random() * 200)];
    case 'Luxury': return [600 + Math.floor(Math.random() * 400), 1000 + Math.floor(Math.random() * 1000)];
    case 'Ultra-Luxury': return [1500 + Math.floor(Math.random() * 1000), 2500 + Math.floor(Math.random() * 2000)];
    default: return [100, 300];
  }
}

function generateCommunityImpact() {
  return {
    localEmployment: Math.floor(Math.random() * 80) + 20,
    jobsCreated: Math.floor(Math.random() * 500) + 50,
    programs: getRandomElements([
      'women empowerment', 'youth education', 'skills training', 'microfinance',
      'healthcare support', 'conservation education', 'sustainable agriculture',
      'traditional crafts', 'language preservation', 'cultural exchange'
    ], Math.floor(Math.random() * 4) + 2),
    description: 'Community-focused initiative supporting local development and conservation goals'
  };
}

export const generateComprehensiveOperators = (count: number = 400) => {
  const operators = [];
  
  for (let i = 0; i < count; i++) {
    const country = getRandomElement(COUNTRIES);
    const operationType = getRandomElement(OPERATION_TYPES);
    const location = getRandomElement(LOCATIONS);
    const conservationFocus = getRandomElement(CONSERVATION_FOCUSES);
    const certifications = getRandomElement(CERTIFICATIONS);
    const activities = getRandomElement(ACTIVITIES);
    const sustainabilityFeatures = getRandomElement(SUSTAINABILITY_FEATURES);
    
    const priceTiers = ['Budget', 'Mid-Range', 'Luxury', 'Ultra-Luxury'];
    const priceTier = getRandomElement(priceTiers);
    const priceRange = generateRandomPrice(priceTier);
    
    const operator = {
      id: `generated-operator-${i + 1}-${country.toLowerCase().replace(/\s/g, '-')}`,
      name: generateOperatorName(country, operationType, i + 1),
      location: `${location}, ${country}`,
      country,
      continent: getContinent(country),
      operationType,
      yearsInOperation: Math.floor(Math.random() * 25) + 3,
      sustainabilityScore: Math.round((Math.random() * 3 + 7) * 10) / 10, // 7.0-10.0
      trustScore: Math.round((Math.random() * 2 + 8) * 10) / 10, // 8.0-10.0
      certifications,
      conservationPartnerships: generatePartnerships(),
      communityImpact: generateCommunityImpact(),
      priceTier,
      priceRange,
      contact: generateContact(i),
      verificationStatus: Math.random() > 0.1 ? 'verified' : 'pending', // 90% verified
      guideExperience: generateGuideExperience(),
      sustainabilityFeatures,
      conservationFocus,
      activities,
      description: generateDescription(operationType, location, country),
      coordinates: generateCoordinates(country),
      website: `https://${generateOperatorName(country, operationType, i).toLowerCase().replace(/\s/g, '')}.com`,
      bookingInfo: {
        available: Math.random() > 0.05, // 95% available
        minNights: Math.floor(Math.random() * 4) + 2, // 2-5 nights
        maxGuests: Math.floor(Math.random() * 12) + 4, // 4-15 guests
        seasonality: getRandomElement(['Year-round', 'Dry season only', 'Migration season', 'Weather dependent'])
      },
      reviews: {
        count: Math.floor(Math.random() * 300) + 25,
        averageRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0
        highlights: getRandomElements([
          'Excellent guides', 'Amazing wildlife sightings', 'Sustainable practices',
          'Cultural authenticity', 'Conservation impact', 'Value for money',
          'Unique experiences', 'Professional service', 'Educational content'
        ], 3)
      },
      conservationROI: Math.round((Math.random() * 20 + 10) * 10) / 10, // 10-30%
      communityROI: Math.round((Math.random() * 25 + 5) * 10) / 10, // 5-30%
      featured: Math.random() > 0.8, // 20% featured
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    operators.push(operator);
  }
  
  return operators;
};

function getContinent(country: string): string {
  const continentMap: { [key: string]: string } = {
    'Kenya': 'Africa', 'Tanzania': 'Africa', 'South Africa': 'Africa', 'Botswana': 'Africa',
    'Namibia': 'Africa', 'Rwanda': 'Africa', 'Uganda': 'Africa', 'Ethiopia': 'Africa',
    'Madagascar': 'Africa', 'Zambia': 'Africa',
    'Brazil': 'South America', 'Peru': 'South America', 'Ecuador': 'South America',
    'Colombia': 'South America', 'Chile': 'South America', 'Argentina': 'South America',
    'Bolivia': 'South America', 'Costa Rica': 'North America', 'Panama': 'North America',
    'Guatemala': 'North America',
    'India': 'Asia', 'Nepal': 'Asia', 'Bhutan': 'Asia', 'Thailand': 'Asia',
    'Malaysia': 'Asia', 'Indonesia': 'Asia', 'Philippines': 'Asia', 'Sri Lanka': 'Asia',
    'Myanmar': 'Asia', 'Cambodia': 'Asia',
    'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Fiji': 'Oceania',
    'Vanuatu': 'Oceania', 'Papua New Guinea': 'Oceania', 'Solomon Islands': 'Oceania',
    'Canada': 'North America', 'USA': 'North America', 'Mexico': 'North America',
    'Greenland': 'North America', 'Iceland': 'Europe',
    'Norway': 'Europe', 'Sweden': 'Europe', 'Finland': 'Europe'
  };
  return continentMap[country] || 'Unknown';
}

function generatePartnerships(): string[] {
  const partnerships = [
    'WWF', 'Conservation International', 'Wildlife Conservation Society', 'Nature Conservancy',
    'African Wildlife Foundation', 'Panthera', 'Save the Rhino', 'Jane Goodall Institute',
    'Sea Shepherd', 'Ocean Conservancy', 'Rainforest Alliance', 'IUCN',
    'Local Conservation Trust', 'Community Wildlife Conservancy', 'Indigenous Conservation Alliance'
  ];
  return getRandomElements(partnerships, Math.floor(Math.random() * 3) + 1);
}

function generateContact(index: number): string {
  const domains = ['conservation.org', 'ecolodge.com', 'wildliferetreat.net', 'sustainabletravel.org'];
  return `info@operator${index}${getRandomElement(domains)}`;
}

function generateGuideExperience(): string {
  const experiences = [
    'Professional guides with 10+ years experience',
    'Local community guides with cultural expertise',
    'University-trained naturalists and researchers',
    'Certified wildlife tracking specialists',
    'Multi-lingual conservation educators',
    'Indigenous knowledge keepers and storytellers',
    'Marine biology specialists and diving instructors',
    'Photography and wildlife behavior experts'
  ];
  return getRandomElement(experiences);
}

function generateDescription(type: string, location: string, country: string): string {
  return `Sustainable ${type.toLowerCase()} located in ${location}, ${country}, focused on conservation, community development, and authentic cultural experiences.`;
}

function generateCoordinates(country: string): { lat: number, lng: number } {
  // Simplified coordinate generation - in reality, you'd use accurate country bounds
  const countryCoords: { [key: string]: { lat: number, lng: number } } = {
    'Kenya': { lat: -1.286389, lng: 36.817223 },
    'Tanzania': { lat: -6.369028, lng: 34.888822 },
    'Brazil': { lat: -14.235004, lng: -51.92528 },
    'India': { lat: 20.593684, lng: 78.96288 },
    'Australia': { lat: -25.274398, lng: 133.775136 },
    // Add more as needed
  };
  
  const baseCoord = countryCoords[country] || { lat: 0, lng: 0 };
  return {
    lat: baseCoord.lat + (Math.random() - 0.5) * 10, // Add some variance
    lng: baseCoord.lng + (Math.random() - 0.5) * 10
  };
}

export const seedComprehensiveOperators = async (count: number = 400): Promise<void> => {
  try {
    console.log(`🚀 Starting comprehensive seeding of ${count} operators...`);
    
    const operators = generateComprehensiveOperators(count);
    const batchSize = 500; // Firestore batch limit
    let processed = 0;
    
    // Process in batches
    for (let i = 0; i < operators.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchOperators = operators.slice(i, i + batchSize);
      
      for (const operator of batchOperators) {
        const docRef = doc(collection(db, 'operators'));
        batch.set(docRef, {
          ...operator,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      processed += batchOperators.length;
      console.log(`✅ Processed ${processed}/${operators.length} operators`);
    }
    
    console.log(`🎉 Successfully seeded ${operators.length} comprehensive operators!`);
    
  } catch (error) {
    console.error('❌ Error seeding comprehensive operators:', error);
    throw error;
  }
};

export default seedComprehensiveOperators;
