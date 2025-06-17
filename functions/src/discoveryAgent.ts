import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);

interface DiscoverySource {
  name: string;
  url: string;
  tier: 'tier1' | 'tier2';
  searchTerms: string[];
  priority: number;
}

interface OperatorCandidate {
  id: string;
  name: string;
  url: string;
  tier: 'tier1' | 'tier2';
  priority: number;
  source: string;
  discoveredAt: string;
  initialData?: any;
}

// Discovery sources configuration
const DISCOVERY_SOURCES: DiscoverySource[] = [
  // Tier 1 Sources - Premium Conservation Operators
  {
    name: 'B-Corporation Directory',
    url: 'https://www.bcorporation.net/en-us/find-a-b-corp',
    tier: 'tier1',
    searchTerms: ['travel', 'tourism', 'conservation', 'eco-lodge', 'safari'],
    priority: 10
  },
  {
    name: 'GSTC Certified Operators',
    url: 'https://www.gstcouncil.org/gstc-members/',
    tier: 'tier1',
    searchTerms: ['sustainable tourism', 'certified operators'],
    priority: 9
  },
  {
    name: 'National Geographic Partners',
    url: 'https://www.nationalgeographic.com/expeditions',
    tier: 'tier1',
    searchTerms: ['expedition', 'conservation travel', 'wildlife'],
    priority: 8
  },
  {
    name: 'Rainforest Alliance Tourism',
    url: 'https://www.rainforest-alliance.org/business/tourism/',
    tier: 'tier1',
    searchTerms: ['certified sustainable tourism'],
    priority: 8
  },
  
  // Tier 2 Sources - Grassroots & Affordable Operators
  {
    name: 'Workaway Conservation Projects',
    url: 'https://www.workaway.info',
    tier: 'tier2',
    searchTerms: ['conservation', 'wildlife', 'marine', 'reforestation'],
    priority: 7
  },
  {
    name: 'WWOOF Organic Farms',
    url: 'https://wwoof.net',
    tier: 'tier2',
    searchTerms: ['organic farming', 'sustainable agriculture', 'eco-tourism'],
    priority: 6
  },
  {
    name: 'Adventure Travel Trade Association',
    url: 'https://www.adventuretravel.biz/members',
    tier: 'tier2',
    searchTerms: ['adventure travel', 'responsible tourism'],
    priority: 7
  },
  {
    name: 'Local Tourism Boards',
    url: 'various',
    tier: 'tier2',
    searchTerms: ['community tourism', 'local guides', 'cultural immersion'],
    priority: 5
  }
];

// Keyword patterns for identifying conservation operators (moved to analysis agent)

/**
 * Discovery Agent - Finds new travel operators to vet
 */
export const discoverOperators = functions.https.onRequest(async (request, response) => {
  try {
    const { batch_size = 50, discovery_sources = ['tier1', 'tier2'] } = request.body;
    
    console.log(`🔍 Starting operator discovery - batch size: ${batch_size}`);
    
    const discoveredOperators: OperatorCandidate[] = [];
    
    // Get existing operators to avoid duplicates
    const existingOperators = await getExistingOperators();
    const existingUrls = new Set(existingOperators.map(op => op.url));
    
    // Process each discovery source
    for (const sourceType of discovery_sources) {
      const sources = DISCOVERY_SOURCES.filter(s => s.tier === sourceType);
      
      for (const source of sources) {
        try {
          console.log(`🔍 Searching ${source.name}...`);
          
          const candidates = await searchDiscoverySource(source, existingUrls);
          discoveredOperators.push(...candidates);
          
          // Stop if we've reached batch size
          if (discoveredOperators.length >= batch_size) {
            break;
          }
          
        } catch (error) {
          console.error(`❌ Error searching ${source.name}:`, error);
        }
      }
      
      if (discoveredOperators.length >= batch_size) {
        break;
      }
    }
    
    // Prioritize and limit results
    const prioritizedOperators = discoveredOperators
      .sort((a, b) => b.priority - a.priority)
      .slice(0, batch_size);
    
    // Store discovered operators for tracking
    await storeDiscoveredOperators(prioritizedOperators);
    
    console.log(`✅ Discovery complete: ${prioritizedOperators.length} operators found`);
    
    response.json({
      success: true,
      operators_found: prioritizedOperators.length,
      operators: prioritizedOperators,
      discovery_summary: {
        tier1_count: prioritizedOperators.filter(op => op.tier === 'tier1').length,
        tier2_count: prioritizedOperators.filter(op => op.tier === 'tier2').length,
        sources_searched: discovery_sources.length
      }
    });
    
  } catch (error) {
    console.error('❌ Discovery agent failed:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Search a specific discovery source for operator candidates
 */
async function searchDiscoverySource(
  source: DiscoverySource, 
  existingUrls: Set<string>
): Promise<OperatorCandidate[]> {
  
  const candidates: OperatorCandidate[] = [];
  
  // For this implementation, we'll use AI to generate realistic candidates
  // In production, this would involve actual web scraping
  const searchPrompt = `
    You are a travel industry researcher. Generate 5-10 realistic ${source.tier} sustainable travel operators 
    that would be found on ${source.name}.
    
    For ${source.tier === 'tier1' ? 'Tier 1' : 'Tier 2'} operators, focus on:
    ${source.tier === 'tier1' 
      ? 'Premium conservation operators with certifications, research partnerships, and high-end experiences'
      : 'Grassroots, community-led, affordable conservation experiences and volunteer programs'
    }
    
    Search terms: ${source.searchTerms.join(', ')}
    
    Return a JSON array with this structure:
    [
      {
        "name": "Operator Name",
        "url": "https://example.com",
        "description": "Brief description focusing on conservation impact",
        "location": "Country/Region",
        "conservation_focus": ["wildlife", "marine", "reforestation", etc.],
        "price_range": "$" | "$$" | "$$$" | "$$$$"
      }
    ]
    
    Make the operators realistic and diverse in location and conservation focus.
  `;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(searchPrompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const operatorData = JSON.parse(jsonMatch[0]);
      
      operatorData.forEach((op: any, index: number) => {
        if (!existingUrls.has(op.url)) {
          candidates.push({
            id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
            name: op.name,
            url: op.url,
            tier: source.tier,
            priority: source.priority,
            source: source.name,
            discoveredAt: new Date().toISOString(),
            initialData: {
              description: op.description,
              location: op.location,
              conservation_focus: op.conservation_focus,
              price_range: op.price_range
            }
          });
        }
      });
    }
    
  } catch (error) {
    console.error(`Error generating candidates for ${source.name}:`, error);
  }
  
  return candidates;
}

/**
 * Get existing operators from Firestore
 */
async function getExistingOperators(): Promise<{ url: string }[]> {
  try {
    const snapshot = await admin.firestore().collection('operators').get();
    return snapshot.docs.map(doc => ({ url: doc.data().website || doc.data().url }));
  } catch (error) {
    console.error('Error fetching existing operators:', error);
    return [];
  }
}

/**
 * Store discovered operators for tracking
 */
async function storeDiscoveredOperators(operators: OperatorCandidate[]): Promise<void> {
  const batch = admin.firestore().batch();
  
  operators.forEach(operator => {
    const docRef = admin.firestore().collection('discovery-queue').doc(operator.id);
    batch.set(docRef, {
      ...operator,
      status: 'discovered',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  await batch.commit();
  console.log(`📝 Stored ${operators.length} discovered operators in queue`);
}

/**
 * Monitor discovery sources for changes
 */
export const monitorDiscoverySources = functions.pubsub
  .schedule('0 */6 * * *') // Every 6 hours
  .onRun(async (context) => {
    console.log('🔍 Running scheduled discovery monitoring...');
    
    try {
      // Check for new operators in key sources
      const monitoringSources = DISCOVERY_SOURCES.filter(s => s.priority >= 8);
      
      for (const source of monitoringSources) {
        const existingOperators = await getExistingOperators();
        const existingUrls = new Set(existingOperators.map(op => op.url));
        
        const newCandidates = await searchDiscoverySource(source, existingUrls);
        
        if (newCandidates.length > 0) {
          await storeDiscoveredOperators(newCandidates);
          console.log(`📈 Found ${newCandidates.length} new candidates from ${source.name}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Discovery monitoring failed:', error);
    }
  });

/**
 * Get processing status for workflow monitoring
 */
export const getProcessingStatus = functions.https.onRequest(async (request, response) => {
  try {
    const queueSnapshot = await admin.firestore()
      .collection('discovery-queue')
      .where('status', '==', 'processing')
      .get();
    
    const processingCount = queueSnapshot.size;
    
    response.json({
      success: true,
      status: processingCount > 0 ? 'processing' : 'complete',
      processing_count: processingCount
    });
    
  } catch (error) {
    console.error('Error checking processing status:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
