// Web-based Global Seeding Script
// This runs in the browser console on your admin page

const GLOBAL_OPERATORS_COMPREHENSIVE = {
  africa: {
    kenya: [
      'Maasai Mara Wildlife Conservancy', 'Amboseli Elephant Research Center', 'Samburu Game Reserve Lodge',
      'Lake Nakuru Flamingo Sanctuary', 'Tsavo Conservation Project', 'Mount Kenya Safari Club',
      'Lewa Wildlife Conservancy', 'Ol Pejeta Rhino Sanctuary', 'Meru National Park Lodge',
      'Aberdare Forest Conservation', 'Hell\'s Gate Eco Lodge', 'Kakamega Forest Research'
    ],
    tanzania: [
      'Serengeti Conservation Area', 'Ngorongoro Crater Lodge', 'Tarangire Wildlife Camp',
      'Ruaha Elephant Project', 'Selous Game Reserve', 'Lake Manyara Tree Lodge',
      'Katavi National Park', 'Mahale Chimpanzee Research', 'Saadani Marine Park',
      'Udzungwa Mountains Lodge', 'Mikumi Wildlife Center', 'Arusha Cultural Tourism'
    ],
    south_africa: [
      'Kruger National Park Lodges', 'Table Mountain Eco Tours', 'Addo Elephant Sanctuary',
      'Hermanus Whale Watching', 'Kgalagadi Desert Camp', 'Drakensberg Conservation',
      'Garden Route Marine Project', 'Cape Point Penguin Colony', 'Hluhluwe-iMfolozi Reserve',
      'Madikwe Game Reserve', 'Sabi Sands Private Reserve', 'Pilanesberg Safari Lodge'
    ],
    botswana: [
      'Okavango Delta Safaris', 'Chobe Elephant Lodge', 'Kalahari Desert Expeditions',
      'Moremi Game Reserve', 'Central Kalahari Camp', 'Makgadikgadi Pans Lodge',
      'Khwai Community Conservancy', 'Savute Elephant Camp', 'Linyanti Wildlife Reserve',
      'Nxai Pan National Park', 'Tuli Block Safari', 'Mashatu Game Reserve'
    ]
  },
  asia: {
    thailand: [
      'Thai Elephant Sanctuary', 'Khao Sok Rainforest Lodge', 'Similan Islands Marine',
      'Golden Triangle Conservation', 'Kanchanaburi Tiger Temple', 'Doi Inthanon Research',
      'Phang Nga Bay Eco Tours', 'Koh Phi Phi Marine Project', 'Chiang Mai Gibbon Rescue',
      'Khao Yai Wildlife Sanctuary', 'Mu Ko Ang Thong Marine', 'Phuket Sea Turtle Project'
    ],
    indonesia: [
      'Borneo Orangutan Research', 'Komodo Dragon Conservation', 'Bali Sea Turtle Project',
      'Sumatra Tiger Foundation', 'Java Rhino Sanctuary', 'Raja Ampat Marine Park',
      'Tanjung Puting Research', 'Leuser Ecosystem Project', 'Flores Cultural Tourism',
      'Banda Islands Conservation', 'Togean Marine Sanctuary', 'Wakatobi Coral Research'
    ],
    malaysia: [
      'Malaysian Wildlife Rescue', 'Sepilok Orangutan Rehab', 'Kinabalu Park Research',
      'Perhentian Marine Project', 'Langkawi Geopark Tours', 'Taman Negara Lodge',
      'Redang Island Conservation', 'Gunung Mulu Cave Research', 'Kuala Selangor Fireflies',
      'Bako Mangrove Conservation', 'Tioman Island Eco Resort', 'Cameron Highlands Research'
    ]
  },
  americas: {
    costa_rica: [
      'Costa Rica Sloth Sanctuary', 'Manuel Antonio Wildlife', 'Monteverde Cloud Forest',
      'Tortuguero Sea Turtle Project', 'Arenal Volcano Research', 'Corcovado Rainforest Lodge',
      'Osa Peninsula Conservation', 'Cahuita Marine Park', 'Santa Rosa Wildlife Refuge',
      'Carara Biological Reserve', 'Rincon de la Vieja Lodge', 'Braulio Carrillo Research'
    ],
    ecuador: [
      'Galapagos Research Station', 'Amazon Rainforest Lodge', 'Ecuadorian Cloud Forest',
      'Yasuni Biodiversity Research', 'Cotopaxi Wildlife Refuge', 'Mindo Bird Sanctuary',
      'Sangay National Park', 'Machalilla Marine Park', 'Antisana Ecological Reserve',
      'Cayambe-Coca Research', 'Podocarpus Conservation', 'Sumaco Biosphere Reserve'
    ],
    brazil: [
      'Amazon Conservation Research', 'Pantanal Wildlife Lodge', 'Brazilian Jaguar Project',
      'Atlantic Forest Foundation', 'Iguazu Falls Conservation', 'Caatinga Dry Forest',
      'Fernando de Noronha Marine', 'Chapada Diamantina Lodge', 'Serra da Capivara Research',
      'Mamiraua Sustainable Reserve', 'Abrolhos Marine Sanctuary', 'Cerrado Conservation'
    ]
  },
  europe: {
    iceland: [
      'Iceland Whale Research', 'Reykjavik Puffin Tours', 'Vatnajokull Glacier Research',
      'Westfjords Wildlife', 'Northern Lights Eco Lodge', 'Geysir Geothermal Research',
      'Landmannalaugar Hiking', 'Jokulsarlon Seal Watching', 'Snaefellsnes Peninsula',
      'Thorsmork Valley Lodge', 'Askja Volcano Research', 'Husavik Whale Museum'
    ],
    norway: [
      'Norwegian Arctic Expeditions', 'Lofoten Wildlife Lodge', 'Svalbard Polar Research',
      'Nordkapp Arctic Tours', 'Trolltunga Eco Hiking', 'Geirangerfjord Conservation',
      'Hardangerfjord Research', 'Dovrefjell Musk Ox Project', 'Rondane Wildlife Park',
      'Lyngen Alps Lodge', 'Vesteralen Whale Safari', 'Finnmark Reindeer Herding'
    ]
  },
  oceania: {
    australia: [
      'Great Barrier Reef Research', 'Australian Koala Rescue', 'Kakadu Wildlife Lodge',
      'Tasmania Devil Sanctuary', 'Kangaroo Island Conservation', 'Blue Mountains Research',
      'Daintree Rainforest Lodge', 'Ningaloo Marine Park', 'Grampians Wildlife Sanctuary',
      'Flinders Ranges Research', 'Fraser Island Conservation', 'Cradle Mountain Lodge'
    ],
    new_zealand: [
      'New Zealand Kiwi Conservation', 'Fiordland Wildlife Lodge', 'Bay of Islands Marine',
      'Stewart Island Research', 'Otago Peninsula Wildlife', 'Abel Tasman Eco Lodge',
      'Coromandel Forest Research', 'Marlborough Sounds Conservation', 'Tongariro Alpine',
      'Westland Glacier Research', 'Canterbury Plains Wildlife', 'Northland Kauri Forest'
    ]
  }
};

const CONSERVATION_FOCUSES = [
  ['wildlife', 'safari'], ['marine', 'coral'], ['forest', 'reforestation'],
  ['community', 'cultural'], ['research', 'education'], ['adventure', 'eco-tourism'],
  ['birding', 'ornithology'], ['primate', 'rehabilitation'], ['elephant', 'conservation'],
  ['big cats', 'protection'], ['sea turtle', 'nesting'], ['whale', 'migration']
];

async function webBasedGlobalSeeding() {
  console.log('🌍 Starting Web-Based Global Seeding...');
  console.log('🎯 Target: 1000+ operators across all continents');
  
  // Import Firebase functions
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
  const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
  
  // Use existing Firebase config from window if available, or default config
  const firebaseConfig = window.firebaseConfig || {
    apiKey: "AIzaSyCW95JOdKfC8L5sP_PYe9EYwY3VKdBxNYE",
    authDomain: "travelconservation-b4f04.firebaseapp.com",
    projectId: "travelconservation-b4f04",
    storageBucket: "travelconservation-b4f04.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  };
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  let operatorCount = 0;
  const timestamp = new Date().toISOString();
  
  try {
    // Process each continent and country
    for (const [continent, countries] of Object.entries(GLOBAL_OPERATORS_COMPREHENSIVE)) {
      console.log(`\n🌎 Processing ${continent.toUpperCase()}...`);
      
      for (const [country, operators] of Object.entries(countries)) {
        console.log(`  📍 Adding ${operators.length} operators from ${country}`);
        
        for (let index = 0; index < operators.length; index++) {
          const operatorName = operators[index];
          const focus = CONSERVATION_FOCUSES[Math.floor(Math.random() * CONSERVATION_FOCUSES.length)];
          
          const operatorData = {
            id: `${continent}-${country}-${index}-${Date.now()}`,
            name: operatorName,
            continent: continent,
            country: country.replace('_', ' '),
            region: `${country.replace('_', ' ')}, ${continent}`,
            tier: operatorCount % 4 === 0 ? 'tier1' : 'tier2',
            status: 'unvetted',
            verification_status: 'pending',
            discoveredAt: timestamp,
            source: 'web_based_global_seeding',
            conservation_focus: focus,
            primary_focus: focus[0],
            secondary_focus: focus[1],
            description: `${operatorName} - Conservation-focused travel operator in ${country.replace('_', ' ')} specializing in ${focus.join(' and ')} experiences`,
            location: `${country.replace('_', ' ')}, ${continent}`,
            website: `https://${operatorName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            trust_score: Math.floor(Math.random() * 10) + 1,
            risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            price_range: ['$', '$$', '$$$', '$$$$'][Math.floor(Math.random() * 4)],
            languages: getLanguagesForCountry(country),
            activities: getActivitiesForFocus(focus),
            certifications: [],
            sustainability_score: null,
            last_updated: timestamp,
            created_at: timestamp
          };
          
          try {
            await addDoc(collection(db, 'operators'), operatorData);
            operatorCount++;
            
            if (operatorCount % 50 === 0) {
              console.log(`📈 Progress: ${operatorCount} operators seeded`);
              // Small delay to avoid rate limits
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error(`Error adding ${operatorName}:`, error);
          }
        }
      }
    }
    
    console.log(`\n🎉 Web-Based Global Seeding Complete!`);
    console.log(`📊 Total Operators Seeded: ${operatorCount}`);
    console.log(`🌍 Continents Covered: ${Object.keys(GLOBAL_OPERATORS_COMPREHENSIVE).length}`);
    console.log(`✅ Status: All operators marked as 'unvetted' - ready for sustainability analysis`);
    
    return {
      success: true,
      total_operators: operatorCount,
      continents: Object.keys(GLOBAL_OPERATORS_COMPREHENSIVE).length
    };
    
  } catch (error) {
    console.error('❌ Web-based seeding failed:', error);
    return {
      success: false,
      error: error.message,
      operators_seeded: operatorCount
    };
  }
}

function getLanguagesForCountry(country) {
  const languageMap = {
    kenya: ['English', 'Swahili'], tanzania: ['English', 'Swahili'], south_africa: ['English', 'Afrikaans'],
    thailand: ['Thai', 'English'], indonesia: ['Indonesian', 'English'], malaysia: ['Malay', 'English'],
    brazil: ['Portuguese', 'English'], costa_rica: ['Spanish', 'English'], ecuador: ['Spanish', 'English'],
    iceland: ['Icelandic', 'English'], norway: ['Norwegian', 'English']
  };
  return languageMap[country] || ['English', 'Local Language'];
}

function getActivitiesForFocus(focus) {
  const activityMap = {
    wildlife: ['Safari drives', 'Wildlife photography', 'Animal tracking'],
    marine: ['Snorkeling', 'Diving', 'Marine research'],
    forest: ['Hiking', 'Canopy walks', 'Bird watching'],
    community: ['Cultural exchanges', 'Village visits', 'Traditional crafts'],
    research: ['Field studies', 'Data collection', 'Conservation projects']
  };
  
  return focus.map(f => activityMap[f] || ['Nature walks', 'Education', 'Photography']).flat().slice(0, 3);
}

// Auto-run the seeding function
console.log('🚀 Activating Global Discovery System...');
webBasedGlobalSeeding().then(result => {
  console.log('✅ Final Result:', result);
}).catch(error => {
  console.error('❌ Seeding Failed:', error);
});
