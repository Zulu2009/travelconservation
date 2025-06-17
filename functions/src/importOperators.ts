import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface OperatorData {
  id: string;
  name: string;
  description: string;
  location: string;
  country: string;
  website?: string;
  trustScore: number;
  sustainabilityRating: number;
  riskLevel: 'low' | 'medium' | 'high';
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'needs-review';
  source: string;
  discoveredAt: admin.firestore.FieldValue;
  operationType: string;
  yearsInOperation: number;
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
  guideExperience: string;
  sustainabilityFeatures: string[];
  lastUpdated: admin.firestore.FieldValue;
}

// Comprehensive East Africa operators database
const OPERATORS_DATA: Omit<OperatorData, 'lastUpdated' | 'discoveredAt'>[] = [
  // KENYA OPERATORS
  {
    id: "basecamp-explorer-kenya",
    name: "Basecamp Explorer Kenya",
    description: "27-year track record luxury conservation-focused safari operator in Maasai Mara with verified community partnerships and Gold eco-rating",
    location: "Maasai Mara (Naboisho Conservancy)",
    country: "Kenya",
    website: "https://basecampexplorer.com",
    trustScore: 9.5,
    sustainabilityRating: 5,
    riskLevel: "low" as const,
    verificationStatus: "verified" as const,
    source: "Manual Research Database",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 27,
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
    guideExperience: "Professional Maasai guides with 10+ years, cultural specialists",
    sustainabilityFeatures: ["Solar power", "waste management", "verified conservation funding"]
  },
  {
    id: "asilia-africa",
    name: "Asilia Africa",
    description: "B Corporation certified luxury conservation operator with carbon neutral operations since 2009 across multiple East African camps",
    location: "Serengeti, Ruaha, Nyerere, Tarangire (multi-camp)",
    country: "Tanzania",
    website: "https://asiliaafrica.com",
    trustScore: 9.5,
    sustainabilityRating: 5,
    riskLevel: "low" as const,
    verificationStatus: "verified" as const,
    source: "Manual Research Database",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 20,
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
    guideExperience: "Professional guides with 10+ years experience",
    sustainabilityFeatures: ["Carbon neutral since 2009", "100% solar power", "1,425 tonnes CO2/year offset"]
  },
  {
    id: "sabyinyo-silverback-lodge",
    name: "Sabyinyo Silverback Lodge",
    description: "Rwanda's first community-owned lodge with 100% community ownership and $3.5M+ distributed to 5,000+ households",
    location: "Rwanda (Volcanoes National Park)",
    country: "Rwanda",
    trustScore: 9.5,
    sustainabilityRating: 5,
    riskLevel: "low" as const,
    verificationStatus: "verified" as const,
    source: "Manual Research Database",
    operationType: "Luxury Community-Driven",
    yearsInOperation: 16,
    certifications: ["Rwanda's first community-owned lodge", "Rwanda Development Board"],
    conservationPartnerships: ["African Wildlife Foundation", "International Gorilla Conservation Programme"],
    communityImpact: {
      programs: ["100% community ownership through SACOLA trust", "5,000+ households benefited", "$3.5M+ distributed"],
      description: "100% community ownership through SACOLA trust, 5,000+ households benefited, $3.5M+ distributed"
    },
    priceTier: "Luxury",
    priceRange: [1000, 1650],
    contact: "Via Governors Camp Collection",
    guideExperience: "Professional rangers with extensive training",
    sustainabilityFeatures: ["Organic gardens", "local sourcing", "traditional architecture"]
  },
  {
    id: "limalimo-lodge",
    name: "Limalimo Lodge",
    description: "AWF certified conservation lodge in Ethiopia's Simien Mountains with 100% renewable energy and verified community impact",
    location: "Simien Mountains National Park",
    country: "Ethiopia",
    website: "https://limalimolodge.com",
    trustScore: 9.5,
    sustainabilityRating: 5,
    riskLevel: "low" as const,
    verificationStatus: "verified" as const,
    source: "Manual Research Database",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 9,
    certifications: ["AWF (African Wildlife Foundation) certified conservation covenant"],
    conservationPartnerships: ["Verified AWF partnership", "Ethiopian Wildlife Conservation Authority"],
    communityImpact: {
      programs: ["33 local staff (100% neighboring communities)", "200+ construction jobs", "$10/guest/night conservation fee"],
      description: "33 local staff (100% neighboring communities), 200+ construction jobs, $10/guest/night conservation fee"
    },
    priceTier: "Luxury",
    priceRange: [300, 620],
    contact: "+251931688062, info@limalimolodge.com",
    guideExperience: "Park-certified guides with 10+ years experience",
    sustainabilityFeatures: ["Minimal impact design", "local materials", "waste reduction"]
  },
  {
    id: "volcanoes-safaris",
    name: "Volcanoes Safaris",
    description: "GSTC certified luxury conservation operator across Rwanda and Uganda with 25+ years experience and university graduate guides",
    location: "Rwanda (Virunga Lodge) & Uganda (multiple lodges)",
    country: "Rwanda",
    website: "https://volcanoessafaris.com",
    trustScore: 9.5,
    sustainabilityRating: 5,
    riskLevel: "low" as const,
    verificationStatus: "verified" as const,
    source: "Manual Research Database",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 25,
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
    guideExperience: "University graduate guides with 15+ years experience",
    sustainabilityFeatures: ["Solar power", "rainwater harvesting", "Volcanoes Safaris Partnership Trust"]
  },
  {
    id: "tortilis-camp-elewana",
    name: "Tortilis Camp (Elewana Collection)",
    description: "Silver Level Ecotourism Kenya certified luxury camp in Amboseli with 100% solar power and Big Life Foundation partnership",
    location: "Amboseli (Kitirua Private Conservancy)",
    country: "Kenya",
    trustScore: 9.0,
    sustainabilityRating: 5,
    riskLevel: "low" as const,
    verificationStatus: "verified" as const,
    source: "Manual Research Database",
    operationType: "Luxury Conservation-Focused",
    yearsInOperation: 15,
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
    guideExperience: "100% Kenya Professional Safari Guides Association certified",
    sustainabilityFeatures: ["100% solar power", "90% plastic bottle reduction", "recycling programs"]
  },
  {
    id: "beyond-tanzania",
    name: "&Beyond Tanzania",
    description: "30+ year ultra-luxury operator with Africa Foundation partnership and comprehensive Care of the People initiative",
    location: "Ngorongoro, Serengeti, Grumeti (multiple luxury lodges)",
    country: "Tanzania",
    website: "https://andbeyond.com",
    trustScore: 9.0,
    sustainabilityRating: 5,
    riskLevel: "low" as const,
    verificationStatus: "verified" as const,
    source: "Manual Research Database",
    operationType: "Ultra-Luxury Conservation-Focused",
    yearsInOperation: 30,
    certifications: ["Responsible Tourism Tanzania Awards", "Travel + Leisure recognition"],
    conservationPartnerships: ["Africa Foundation (primary)", "Lionscape Coalition", "WWF"],
    communityImpact: {
      programs: ["Care of the People initiative", "education/healthcare programs"],
      description: "Care of the People initiative, education/healthcare programs"
    },
    priceTier: "Ultra-luxury",
    priceRange: [1000, 3000],
    contact: "Regional offices",
    guideExperience: "Expert professional guides with specialized training",
    sustainabilityFeatures: ["Advanced sustainable practices across properties"]
  },
  {
    id: "nature-discovery-centre",
    name: "Nature Discovery Centre",
    description: "UNCTAD Award winning responsible tour operator specializing in Kilimanjaro with porter welfare programs and Leave No Trace certification",
    location: "Moshi, Kilimanjaro region",
    country: "Tanzania",
    trustScore: 9.0,
    sustainabilityRating: 5,
    riskLevel: "low" as const,
    verificationStatus: "verified" as const,
    source: "Manual Research Database",
    operationType: "Adventure Travel (Mountain Specialist)",
    yearsInOperation: 15,
    certifications: ["UNCTAD Award Most Responsible Tour Operator (2018, 2019)", "Travelife Partner"],
    conservationPartnerships: ["Kilimanjaro Porters Assistance Project", "ATTA member"],
    communityImpact: {
      localEmployment: 80,
      programs: ["porter welfare programs"],
      description: "80%+ local employment, porter welfare programs"
    },
    priceTier: "Mid-range to premium",
    priceRange: [2000, 4000],
    contact: "Through RTTZ network",
    guideExperience: "Professional mountain guides with extensive certification",
    sustainabilityFeatures: ["Leave No Trace certified", "porter protection standards"]
  }
];

export const importOperators = functions.https.onRequest(async (request, response) => {
  // Enable CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  try {
    console.log('🔄 Starting operator import...');
    
    const batch = admin.firestore().batch();
    let imported = 0;
    let errors = 0;
    
    for (const operatorData of OPERATORS_DATA) {
      try {
        const docRef = admin.firestore().collection('operators').doc(operatorData.id);
        
        const operatorWithTimestamp: OperatorData = {
          ...operatorData,
          discoveredAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };
        
        batch.set(docRef, operatorWithTimestamp);
        imported++;
        
        console.log(`✅ Prepared ${operatorData.name} for import`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Error preparing ${operatorData.name}:`, error);
      }
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log(`🎉 Import complete: ${imported} operators imported, ${errors} errors`);
    
    response.json({
      success: true,
      imported,
      errors,
      message: `Successfully imported ${imported} verified sustainable travel operators to database`
    });
    
  } catch (error) {
    console.error('❌ Batch import failed:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
