import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase/config';

// Comprehensive global conservation operators
const GLOBAL_OPERATORS = [
  // AFRICA
  {
    name: "Singita Grumeti Reserves",
    location: "Serengeti, Tanzania",
    country: "Tanzania",
    continent: "Africa",
    website: "https://singita.com/grumeti",
    description: "Premium safari lodge supporting wildlife conservation and anti-poaching efforts in the Serengeti ecosystem",
    conservationFocus: ["wildlife", "anti-poaching", "ecosystem protection"],
    sustainabilityRating: 5,
    trustScore: 9.2,
    priceRange: "$$$$",
    certifications: ["B-Corp", "Relais & Châteaux"],
    conservationROI: 18.5,
    communityROI: 12.3,
    activities: ["safari", "wildlife research", "conservation education"],
    coordinates: { lat: -2.3333, lng: 34.8333 }
  },
  {
    name: "Ol Pejeta Conservancy",
    location: "Laikipia, Kenya",
    country: "Kenya",
    continent: "Africa",
    website: "https://olpejetaconservancy.org",
    description: "Leading conservation organization protecting endangered species including the last northern white rhinos",
    conservationFocus: ["rhino protection", "wildlife corridor", "community development"],
    sustainabilityRating: 5,
    trustScore: 9.5,
    priceRange: "$$$",
    certifications: ["GSTC", "Fair Trade Tourism"],
    conservationROI: 22.1,
    communityROI: 19.8,
    activities: ["rhino tracking", "wildlife research", "community visits"]
  },
  {
    name: "Sanctuary Gorilla Forest Camp",
    location: "Bwindi, Uganda",
    country: "Uganda",
    continent: "Africa",
    website: "https://sanctuaryretreats.com/bwindi",
    description: "Luxury eco-camp supporting mountain gorilla conservation in Bwindi Impenetrable Forest",
    conservationFocus: ["gorilla protection", "forest conservation", "local employment"],
    sustainabilityRating: 5,
    trustScore: 9.1,
    priceRange: "$$$$",
    certifications: ["Rainforest Alliance", "Uganda Wildlife Authority"],
    conservationROI: 20.3,
    communityROI: 15.7,
    activities: ["gorilla trekking", "forest walks", "cultural encounters"]
  },

  // SOUTH AMERICA
  {
    name: "Cristalino Lodge",
    location: "Amazon, Brazil",
    country: "Brazil",
    continent: "South America",
    website: "https://cristalinolodge.com.br",
    description: "Award-winning ecolodge in private Amazon reserve with world-class birding and research programs",
    conservationFocus: ["rainforest protection", "biodiversity research", "carbon sequestration"],
    sustainabilityRating: 5,
    trustScore: 9.4,
    priceRange: "$$$",
    certifications: ["National Geographic", "Rainforest Alliance", "GSTC"],
    conservationROI: 25.8,
    communityROI: 14.2,
    activities: ["birdwatching", "canopy research", "night safaris"]
  },
  {
    name: "EcoCamp Patagonia",
    location: "Torres del Paine, Chile",
    country: "Chile",
    continent: "South America",
    website: "https://ecocamp.travel",
    description: "Sustainable dome camp in Patagonia promoting conservation and renewable energy",
    conservationFocus: ["ecosystem protection", "renewable energy", "sustainable tourism"],
    sustainabilityRating: 5,
    trustScore: 8.9,
    priceRange: "$$$",
    certifications: ["B-Corp", "GSTC", "ISO 14001"],
    conservationROI: 16.4,
    communityROI: 11.8,
    activities: ["hiking", "wildlife observation", "sustainability tours"]
  },
  {
    name: "Posada Amazonas",
    location: "Tambopata, Peru",
    country: "Peru",
    continent: "South America",
    website: "https://rainforestexpeditions.com/posada-amazonas",
    description: "Community-owned lodge supporting indigenous rights and rainforest conservation",
    conservationFocus: ["indigenous rights", "rainforest protection", "community empowerment"],
    sustainabilityRating: 5,
    trustScore: 9.0,
    priceRange: "$$",
    certifications: ["Rainforest Alliance", "Fair Trade Tourism"],
    conservationROI: 19.7,
    communityROI: 28.5,
    activities: ["canopy walkway", "clay lick visits", "cultural experiences"]
  },

  // ASIA
  {
    name: "Ananda Estate",
    location: "Palawan, Philippines",
    country: "Philippines",
    continent: "Asia",
    website: "https://anandaestate.com",
    description: "Luxury eco-resort supporting marine conservation and sustainable fishing practices",
    conservationFocus: ["marine protection", "coral restoration", "sustainable fishing"],
    sustainabilityRating: 4,
    trustScore: 8.7,
    priceRange: "$$$$",
    certifications: ["PADI Green Star", "Philippine Department of Tourism"],
    conservationROI: 17.2,
    communityROI: 13.9,
    activities: ["diving", "coral restoration", "fishing with locals"]
  },
  {
    name: "Diphlu River Lodge",
    location: "Kaziranga, India",
    country: "India",
    continent: "Asia",
    website: "https://www.diphluriverlodge.com",
    description: "Eco-lodge supporting rhino conservation and community development in Kaziranga",
    conservationFocus: ["rhino protection", "elephant conservation", "anti-poaching"],
    sustainabilityRating: 4,
    trustScore: 8.5,
    priceRange: "$$$",
    certifications: ["Wild Frontiers", "Responsible Tourism Society of India"],
    conservationROI: 18.8,
    communityROI: 16.3,
    activities: ["rhino safaris", "elephant tracking", "village visits"]
  },
  {
    name: "Borneo Nature Lodge",
    location: "Kinabatangan River, Malaysia",
    country: "Malaysia",
    continent: "Asia",
    website: "https://borneonaturelodge.com",
    description: "River lodge supporting orangutan conservation and rainforest protection",
    conservationFocus: ["orangutan protection", "rainforest conservation", "river ecosystem"],
    sustainabilityRating: 4,
    trustScore: 8.8,
    priceRange: "$$$",
    certifications: ["Malaysia Tourism Board", "WWF Partner"],
    conservationROI: 21.4,
    communityROI: 18.7,
    activities: ["orangutan spotting", "river cruises", "night walks"]
  },

  // NORTH AMERICA
  {
    name: "Clayoquot Wilderness Resort",
    location: "British Columbia, Canada",
    country: "Canada",
    continent: "North America",
    website: "https://wildretreat.com",
    description: "Luxury wilderness resort supporting old-growth forest conservation and First Nations culture",
    conservationFocus: ["old-growth protection", "First Nations partnership", "marine conservation"],
    sustainabilityRating: 5,
    trustScore: 9.0,
    priceRange: "$$$$",
    certifications: ["Relais & Châteaux", "Indigenous Tourism BC"],
    conservationROI: 15.6,
    communityROI: 20.2,
    activities: ["bear watching", "whale watching", "cultural experiences"]
  },
  {
    name: "Basecamp Greenland",
    location: "Scoresby Sound, Greenland",
    country: "Greenland",
    continent: "North America",
    website: "https://basecampgreenland.gl",
    description: "Arctic expedition base supporting climate research and Inuit culture preservation",
    conservationFocus: ["climate research", "Arctic protection", "cultural preservation"],
    sustainabilityRating: 5,
    trustScore: 8.9,
    priceRange: "$$$",
    certifications: ["Polar Tourism Association", "Visit Greenland"],
    conservationROI: 19.3,
    communityROI: 22.1,
    activities: ["glacier research", "Arctic wildlife", "Inuit culture"]
  },

  // EUROPE
  {
    name: "Inkaterra Machu Picchu Pueblo Hotel",
    location: "Aguas Calientes, Peru",
    country: "Peru",
    continent: "South America",
    website: "https://inkaterra.com",
    description: "Historic hotel supporting cloud forest conservation and archaeological preservation",
    conservationFocus: ["cloud forest", "archaeological preservation", "biodiversity research"],
    sustainabilityRating: 5,
    trustScore: 9.2,
    priceRange: "$$$$",
    certifications: ["National Geographic", "Rainforest Alliance"],
    conservationROI: 18.9,
    communityROI: 16.4,
    activities: ["Machu Picchu tours", "orchid walks", "bird watching"]
  },
  {
    name: "Treehotel",
    location: "Harads, Sweden",
    country: "Sweden",
    continent: "Europe",
    website: "https://treehotel.se",
    description: "Innovative treehouse hotel promoting sustainable design and forest conservation",
    conservationFocus: ["sustainable architecture", "forest protection", "renewable energy"],
    sustainabilityRating: 5,
    trustScore: 8.6,
    priceRange: "$$$",
    certifications: ["Green Key", "Nordic Ecolabel"],
    conservationROI: 12.7,
    communityROI: 14.8,
    activities: ["forest bathing", "wildlife observation", "sustainable design tours"]
  },

  // OCEANIA
  {
    name: "Longitude 131°",
    location: "Uluru, Australia",
    country: "Australia",
    continent: "Oceania",
    website: "https://longitude131.com.au",
    description: "Luxury desert camp supporting Aboriginal culture and desert conservation",
    conservationFocus: ["desert ecosystem", "Aboriginal culture", "sustainable tourism"],
    sustainabilityRating: 4,
    trustScore: 8.8,
    priceRange: "$$$$",
    certifications: ["Luxury Lodges of Australia", "Respecting Our Culture"],
    conservationROI: 14.3,
    communityROI: 19.6,
    activities: ["Uluru tours", "Aboriginal art", "desert walks"]
  },
  {
    name: "Jean-Michel Cousteau Resort",
    location: "Vanua Levu, Fiji",
    country: "Fiji",
    continent: "Oceania",
    website: "https://fijiresort.com",
    description: "Family resort supporting marine conservation and coral reef protection",
    conservationFocus: ["marine conservation", "coral restoration", "environmental education"],
    sustainibilityRating: 5,
    trustScore: 9.1,
    priceRange: "$$$",
    certifications: ["Green Globe", "Fiji Tourism Board"],
    conservationROI: 20.8,
    communityROI: 17.5,
    activities: ["diving", "marine research", "cultural villages"]
  },

  // ARCTIC REGIONS
  {
    name: "Svalbard Wilderness Camp",
    location: "Svalbard, Norway",
    country: "Norway",
    continent: "Europe",
    website: "https://svalbardwilderness.com",
    description: "Arctic wilderness camp supporting polar bear research and climate monitoring",
    conservationFocus: ["polar bear protection", "Arctic ecosystem", "climate research"],
    sustainabilityRating: 5,
    trustScore: 9.0,
    priceRange: "$$$",
    certifications: ["Visit Svalbard", "Arctic Council"],
    conservationROI: 21.5,
    communityROI: 15.2,
    activities: ["polar bear tracking", "glacier monitoring", "Arctic photography"]
  }
];

export const seedGlobalOperators = async (): Promise<void> => {
  try {
    console.log('🌍 Starting global operator seeding...');
    
    for (const operator of GLOBAL_OPERATORS) {
      const operatorData = {
        ...operator,
        id: `${operator.name.toLowerCase().replace(/\s+/g, '-')}-${operator.country.toLowerCase()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        verified: true,
        featured: Math.random() > 0.7, // 30% chance of being featured
        reviews: {
          count: Math.floor(Math.random() * 200) + 50,
          averageRating: 4.2 + Math.random() * 0.8, // 4.2-5.0 rating
        },
        bookingInfo: {
          available: true,
          minNights: Math.floor(Math.random() * 3) + 2, // 2-4 nights minimum
          maxGuests: Math.floor(Math.random() * 8) + 4, // 4-12 guests
        }
      };

      await addDoc(collection(db, 'operators'), operatorData);
      console.log(`✅ Added: ${operator.name} (${operator.country})`);
    }

    console.log(`🎉 Successfully seeded ${GLOBAL_OPERATORS.length} global operators!`);
  } catch (error) {
    console.error('❌ Error seeding global operators:', error);
    throw error;
  }
};

export default seedGlobalOperators;
