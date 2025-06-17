import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase/config';

interface OperatorData {
  id: string;
  name: string;
  location: string;
  operationType: string;
  yearsInOperation: number;
  sustainabilityScore: number;
  certifications: string[];
  conservationPartnerships: string[];
  communityImpact: {
    localEmployment?: number;
    jobsCreated?: number;
    programs: string[];
    description: string;
  };
  priceTier: string;
  priceRange: [number, number];
  contact: string;
  verificationStatus: string;
  country: string;
  guideExperience: string;
  sustainabilityFeatures: string[];
  createdAt: Date;
}

const SAMPLE_OPERATORS: OperatorData[] = [
  {
    id: "basecamp-explorer-kenya",
    name: "Basecamp Explorer Kenya",
    location: "Maasai Mara (Naboisho Conservancy)",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 27,
    sustainabilityScore: 9.5,
    certifications: ["Ecotourism Kenya Gold eco-rating", "The Long Run membership (4C framework)"],
    conservationPartnerships: ["Masai Mara Wildlife Conservancy Association", "600+ Maasai families partnership"],
    communityImpact: {
      localEmployment: 98,
      jobsCreated: 2000,
      programs: ["women nature guides program"],
      description: "98% local employment (2,000+ jobs), women nature guides program"
    },
    priceTier: "Luxury",
    priceRange: [500, 800],
    contact: "Operations through Naboisho Conservancy",
    verificationStatus: "verified",
    country: "Kenya",
    guideExperience: "Professional Maasai guides with 10+ years, cultural specialists",
    sustainabilityFeatures: ["Solar power", "waste management", "verified conservation funding"],
    createdAt: new Date()
  },
  {
    id: "asilia-africa",
    name: "Asilia Africa",
    location: "Serengeti, Ruaha, Nyerere, Tarangire (multi-camp)",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 20,
    sustainabilityScore: 9.5,
    certifications: ["B Corporation Certified", "Responsible Tourism Tanzania Tree Level"],
    conservationPartnerships: ["Honeyguide Foundation", "Singita Grumeti Fund", "STEP"],
    communityImpact: {
      localEmployment: 33,
      programs: ["Maa Trust women's empowerment"],
      description: "33% rural village staff, Maa Trust women's empowerment"
    },
    priceTier: "Luxury",
    priceRange: [800, 2000],
    contact: "press@asilia.com",
    verificationStatus: "verified",
    country: "Tanzania",
    guideExperience: "Professional guides with 10+ years experience",
    sustainabilityFeatures: ["Carbon neutral since 2009", "100% solar power", "1,425 tonnes CO2/year offset"],
    createdAt: new Date()
  },
  {
    id: "sabyinyo-silverback-lodge",
    name: "Sabyinyo Silverback Lodge",
    location: "Rwanda (Volcanoes National Park)",
    operationType: "Luxury Community-Driven",
    yearsInOperation: 16,
    sustainabilityScore: 9.5,
    certifications: ["Rwanda's first community-owned lodge", "Rwanda Development Board"],
    conservationPartnerships: ["African Wildlife Foundation", "International Gorilla Conservation Programme"],
    communityImpact: {
      programs: ["100% community ownership through SACOLA trust", "5,000+ households benefited", "$3.5M+ distributed"],
      description: "100% community ownership through SACOLA trust, 5,000+ households benefited, $3.5M+ distributed"
    },
    priceTier: "Luxury",
    priceRange: [1000, 1650],
    contact: "Via Governors Camp Collection",
    verificationStatus: "verified",
    country: "Rwanda",
    guideExperience: "Professional rangers with extensive training",
    sustainabilityFeatures: ["Organic gardens", "local sourcing", "traditional architecture"],
    createdAt: new Date()
  },
  {
    id: "limalimo-lodge",
    name: "Limalimo Lodge",
    location: "Simien Mountains National Park",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 9,
    sustainabilityScore: 9.5,
    certifications: ["AWF (African Wildlife Foundation) certified conservation covenant"],
    conservationPartnerships: ["Verified AWF partnership", "Ethiopian Wildlife Conservation Authority"],
    communityImpact: {
      programs: ["33 local staff (100% neighboring communities)", "200+ construction jobs", "$10/guest/night conservation fee"],
      description: "33 local staff (100% neighboring communities), 200+ construction jobs, $10/guest/night conservation fee"
    },
    priceTier: "Luxury",
    priceRange: [300, 620],
    contact: "+251931688062, info@limalimolodge.com",
    verificationStatus: "verified",
    country: "Ethiopia",
    guideExperience: "Park-certified guides with 10+ years experience",
    sustainabilityFeatures: ["Minimal impact design", "local materials", "waste reduction"],
    createdAt: new Date()
  },
  {
    id: "volcanoes-safaris",
    name: "Volcanoes Safaris",
    location: "Rwanda (Virunga Lodge) & Uganda (multiple lodges)",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 25,
    sustainabilityScore: 9.5,
    certifications: ["GSTC standards framework", "AUTO member", "Rwanda Tourism Board"],
    conservationPartnerships: ["Jane Goodall Institute", "Dian Fossey Gorilla Fund"],
    communityImpact: {
      localEmployment: 85,
      programs: ["$50/guest/night conservation fee"],
      description: "85% local employment, $50/guest/night conservation fee"
    },
    priceTier: "Luxury",
    priceRange: [1500, 2500],
    contact: "enquiries@volcanoessafaris.com",
    verificationStatus: "verified",
    country: "Rwanda",
    guideExperience: "University graduate guides with 15+ years experience",
    sustainabilityFeatures: ["Solar power", "rainwater harvesting", "Volcanoes Safaris Partnership Trust"],
    createdAt: new Date()
  },
  {
    id: "tortilis-camp-elewana",
    name: "Tortilis Camp (Elewana Collection)",
    location: "Amboseli (Kitirua Private Conservancy)",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 15,
    sustainabilityScore: 9.0,
    certifications: ["Silver Level Ecotourism Kenya certification"],
    conservationPartnerships: ["Big Life Foundation (anti-poaching)", "Kitirua Conservancy management"],
    communityImpact: {
      localEmployment: 60,
      programs: ["$36,145 annual community payments"],
      description: "60% local staff, $36,145 annual community payments"
    },
    priceTier: "Luxury",
    priceRange: [400, 600],
    contact: "Through Elewana Collection",
    verificationStatus: "verified",
    country: "Kenya",
    guideExperience: "100% Kenya Professional Safari Guides Association certified",
    sustainabilityFeatures: ["100% solar power", "90% plastic bottle reduction", "recycling programs"],
    createdAt: new Date()
  },
  {
    id: "campi-ya-kanzi",
    name: "Campi ya Kanzi",
    location: "Amboseli (Kimana Community Wildlife Sanctuary)",
    operationType: "Luxury Community-Driven",
    yearsInOperation: 15,
    sustainabilityScore: 9.5,
    certifications: ["First community-owned conservancy model"],
    conservationPartnerships: ["Maasai Wilderness Conservation Trust"],
    communityImpact: {
      programs: ["844 Maasai families ownership", "100% community control"],
      description: "844 Maasai families ownership, 100% community control"
    },
    priceTier: "Luxury",
    priceRange: [400, 600],
    contact: "Through community trust",
    verificationStatus: "verified",
    country: "Kenya",
    guideExperience: "100% Maasai-operated",
    sustainabilityFeatures: ["Wildlife corridor protection", "community conservation model"],
    createdAt: new Date()
  },
  {
    id: "bale-mountain-lodge",
    name: "Bale Mountain Lodge",
    location: "Bale Mountains National Park, Harenna Forest",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 11,
    sustainabilityScore: 9.5,
    certifications: ["AWF African Wildlife Capital investment", "Ethiopian government concession"],
    conservationPartnerships: ["Verified AWF partnership", "Ethiopian Wolf Conservation Programme"],
    communityImpact: {
      programs: ["50+ local employees", "100% local hiring policy"],
      description: "50+ local employees, 100% local hiring policy"
    },
    priceTier: "Luxury",
    priceRange: [400, 600],
    contact: "info@balemountainlodge.com",
    verificationStatus: "verified",
    country: "Ethiopia",
    guideExperience: "Local guides with 10+ years, park-certified",
    sustainabilityFeatures: ["25kW micro-hydro plant (100% renewable)", "biogas plant", "carbon-neutral heating", "70% power reduction"],
    createdAt: new Date()
  }
];

export const checkIfSeedingNeeded = async (): Promise<boolean> => {
  try {
    const operatorsCollection = collection(db, 'operators');
    const snapshot = await getDocs(operatorsCollection);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking if seeding needed:', error);
    return true; // Assume seeding is needed if there's an error
  }
};

export const seedOperators = async (): Promise<void> => {
  try {
    console.log('🔄 Starting operator seeding...');
    
    let seeded = 0;
    let errors = 0;
    
    for (const operator of SAMPLE_OPERATORS) {
      try {
        const docRef = doc(db, 'operators', operator.id);
        await setDoc(docRef, operator);
        seeded++;
        console.log(`✅ Seeded ${operator.name}`);
      } catch (error) {
        errors++;
        console.error(`❌ Error seeding ${operator.name}:`, error);
      }
    }
    
    console.log(`🎉 Seeding complete: ${seeded} operators seeded, ${errors} errors`);
    
  } catch (error) {
    console.error('❌ Operator seeding failed:', error);
    throw error;
  }
};
