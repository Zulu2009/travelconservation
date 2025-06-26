const axios = require('axios');

// Mass Discovery Script - Get 1000+ Global Operators
const MASS_DISCOVERY_CONFIG = {
  target_operators: 1000,
  batch_size: 50,
  parallel_batches: 5,
  discovery_endpoint: 'https://us-central1-travelconservation-b4f04.cloudfunctions.net/discoverOperators',
  delay_between_batches: 2000 // 2 seconds
};

// Global operator templates for mass generation
const GLOBAL_OPERATORS_DATA = {
  africa: [
    'Maasai Mara Wildlife Conservancy', 'Serengeti Conservation Area', 'Ngorongoro Crater Lodge',
    'Okavango Delta Safaris', 'Victoria Falls Adventure Center', 'Table Mountain Eco Tours',
    'Kruger National Park Lodges', 'Samburu Wildlife Reserve', 'Amboseli Elephant Research',
    'Lake Nakuru Flamingo Tours', 'Bwindi Gorilla Trekking', 'Mount Kilimanjaro Guides'
  ],
  asia: [
    'Borneo Rainforest Research', 'Thai Elephant Sanctuary', 'Komodo Dragon Conservation',
    'Bali Sea Turtle Project', 'Malaysian Wildlife Rescue', 'Sumatra Orangutan Foundation',
    'Philippine Marine Sanctuary', 'Himalayan Snow Leopard Trust', 'Maldives Coral Restoration',
    'Sri Lankan Whale Watching', 'Nepal Tiger Conservation', 'Japanese Forest Bathing'
  ],
  americas: [
    'Amazon Rainforest Lodge', 'Costa Rica Sloth Sanctuary', 'Galapagos Research Station',
    'Patagonia Wildlife Tours', 'Yellowstone Wolf Project', 'Everglades Eco Adventures',
    'Canadian Polar Bear Watching', 'Mexican Sea Turtle Conservation', 'Brazilian Jaguar Project',
    'Ecuadorian Cloud Forest', 'Chilean Penguin Colony', 'Peruvian Llama Trekking'
  ],
  europe: [
    'Iceland Whale Research', 'Scottish Highland Conservation', 'Norwegian Arctic Expeditions',
    'Alpine Wildlife Sanctuary', 'Mediterranean Marine Project', 'Scandinavian Reindeer Herding',
    'Greek Island Biodiversity', 'Spanish Wolf Conservation', 'Italian Bear Sanctuary',
    'Romanian Carpathian Bears', 'Finnish Forest Research', 'Portuguese Cork Oak Project'
  ],
  oceania: [
    'Great Barrier Reef Research', 'New Zealand Kiwi Conservation', 'Tasmanian Devil Sanctuary',
    'Fiji Coral Restoration', 'Australian Koala Rescue', 'Papua New Guinea Biodiversity',
    'Solomon Islands Marine Project', 'Vanuatu Cultural Tourism', 'Samoa Turtle Conservation',
    'Tonga Whale Migration', 'Cook Islands Eco Lodge', 'Marshall Islands Climate Research'
  ]
};

async function massDiscovery() {
  console.log('🚀 Starting Mass Discovery for 1000+ Global Operators...');
  console.log(`Target: ${MASS_DISCOVERY_CONFIG.target_operators} operators`);
  
  let totalDiscovered = 0;
  let batchNumber = 1;
  
  try {
    while (totalDiscovered < MASS_DISCOVERY_CONFIG.target_operators) {
      console.log(`\n📡 Running Discovery Batch ${batchNumber}...`);
      
      // Create parallel discovery requests
      const promises = [];
      for (let i = 0; i < MASS_DISCOVERY_CONFIG.parallel_batches; i++) {
        promises.push(runDiscoveryBatch(batchNumber, i));
      }
      
      // Execute parallel batches
      const results = await Promise.allSettled(promises);
      
      // Count successful discoveries
      let batchTotal = 0;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const found = result.value.operators_found || 0;
          batchTotal += found;
          console.log(`  ✅ Parallel batch ${index + 1}: ${found} operators`);
        } else {
          console.log(`  ❌ Parallel batch ${index + 1}: Failed`);
        }
      });
      
      totalDiscovered += batchTotal;
      console.log(`📈 Total Progress: ${totalDiscovered}/${MASS_DISCOVERY_CONFIG.target_operators} operators`);
      
      // Break if target reached
      if (totalDiscovered >= MASS_DISCOVERY_CONFIG.target_operators) {
        break;
      }
      
      // Delay between batch rounds
      console.log(`⏳ Waiting ${MASS_DISCOVERY_CONFIG.delay_between_batches}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, MASS_DISCOVERY_CONFIG.delay_between_batches));
      
      batchNumber++;
    }
    
    console.log(`\n🎉 Mass Discovery Complete!`);
    console.log(`📊 Final Count: ${totalDiscovered} operators discovered`);
    console.log(`🎯 Target: ${MASS_DISCOVERY_CONFIG.target_operators} ${totalDiscovered >= MASS_DISCOVERY_CONFIG.target_operators ? '✅ REACHED' : '❌ NOT REACHED'}`);
    
  } catch (error) {
    console.error('❌ Mass Discovery Failed:', error.message);
  }
}

async function runDiscoveryBatch(batchNumber, parallelIndex) {
  try {
    const response = await axios.post(MASS_DISCOVERY_CONFIG.discovery_endpoint, {
      batch_size: MASS_DISCOVERY_CONFIG.batch_size,
      discovery_sources: ['tier1', 'tier2'],
      batch_id: `${batchNumber}-${parallelIndex}`,
      timestamp: new Date().toISOString()
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
    
  } catch (error) {
    console.error(`Discovery batch failed: ${error.message}`);
    return { operators_found: 0, operators: [] };
  }
}

// Alternative: Direct Database Seeding (if cloud functions are slow)
async function directDatabaseSeeding() {
  console.log('🔄 Alternative: Direct Database Seeding...');
  
  // This would directly populate the Firebase database
  // with realistic operator data for immediate use
  
  const allOperators = [];
  
  Object.entries(GLOBAL_OPERATORS_DATA).forEach(([region, operators]) => {
    operators.forEach((name, index) => {
      allOperators.push({
        id: `${region}-${index}-${Date.now()}`,
        name: name,
        region: region,
        tier: index % 3 === 0 ? 'tier1' : 'tier2',
        status: 'unvetted',
        discoveredAt: new Date().toISOString(),
        source: 'mass_discovery',
        conservation_focus: getRandomConservationFocus(),
        location: getRandomLocationForRegion(region),
        description: `${name} - Conservation-focused travel operator specializing in ${getRandomConservationFocus().join(', ')}`
      });
    });
  });
  
  console.log(`📝 Generated ${allOperators.length} operators for seeding`);
  return allOperators;
}

function getRandomConservationFocus() {
  const focuses = [
    ['wildlife', 'safari'], ['marine', 'coral'], ['forest', 'reforestation'],
    ['community', 'cultural'], ['research', 'education'], ['adventure', 'eco-tourism']
  ];
  return focuses[Math.floor(Math.random() * focuses.length)];
}

function getRandomLocationForRegion(region) {
  const locations = {
    africa: ['Kenya', 'Tanzania', 'South Africa', 'Botswana', 'Rwanda', 'Uganda'],
    asia: ['Thailand', 'Indonesia', 'Malaysia', 'Philippines', 'Nepal', 'Sri Lanka'],
    americas: ['Costa Rica', 'Ecuador', 'Brazil', 'Peru', 'Canada', 'USA'],
    europe: ['Iceland', 'Scotland', 'Norway', 'Switzerland', 'Spain', 'Romania'],
    oceania: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa', 'Tonga']
  };
  const regionLocations = locations[region] || ['Unknown'];
  return regionLocations[Math.floor(Math.random() * regionLocations.length)];
}

// Export functions for use
module.exports = {
  massDiscovery,
  directDatabaseSeeding,
  MASS_DISCOVERY_CONFIG,
  GLOBAL_OPERATORS_DATA
};

// Run if called directly
if (require.main === module) {
  console.log('🌍 Global Discovery System Activated');
  console.log('Choose discovery method:');
  console.log('1. Mass Discovery (Cloud Functions)');
  console.log('2. Direct Database Seeding');
  
  const method = process.argv[2] || '1';
  
  if (method === '1') {
    massDiscovery();
  } else if (method === '2') {
    directDatabaseSeeding().then(operators => {
      console.log(`🎯 Ready to seed ${operators.length} operators`);
    });
  } else {
    console.log('Usage: node mass-discovery.js [1|2]');
  }
}
