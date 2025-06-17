import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (this is already done in index.ts, but safe to call multiple times)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Test function to verify Firebase database connection and create sample operator
 */
export const testDatabaseConnection = functions.https.onRequest(async (request, response) => {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test 1: Basic Firestore connection
    const testDoc = await db.collection('test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Database connection successful!',
      test_id: Math.random().toString(36).substring(7)
    });
    
    console.log('✅ Basic Firestore connection successful');
    
    // Test 2: Create a sample operator (like your example)
    const operatorName = 'Test Eco Lodge';
    const operatorWebsite = 'https://test-eco-lodge.com';
    
    await processNewOperator(operatorName, operatorWebsite);
    
    // Test 3: Query operators collection
    const operatorsSnapshot = await db.collection('operators').limit(5).get();
    const operatorCount = operatorsSnapshot.size;
    
    console.log(`📊 Found ${operatorCount} operators in database`);
    
    // Test 4: Test the discovery queue
    await db.collection('discovery-queue').add({
      operator_id: 'test-operator-' + Date.now(),
      name: 'Test Discovery Operator',
      url: 'https://test-discovery.com',
      tier: 'tier2',
      priority: 5,
      source: 'manual-test',
      discoveredAt: new Date().toISOString(),
      status: 'discovered',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Discovery queue test successful');
    
    response.json({
      success: true,
      message: 'All database tests passed!',
      tests: {
        firestore_connection: '✅ Connected',
        operator_creation: '✅ Working',
        operator_count: operatorCount,
        discovery_queue: '✅ Working'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Process new operator (based on your example)
 */
async function processNewOperator(operatorName: string, operatorWebsite: string): Promise<void> {
  try {
    // Check if operator already exists by website URL
    const operatorsRef = db.collection('operators');
    const snapshot = await operatorsRef.where('website', '==', operatorWebsite).get();

    if (snapshot.empty) {
      // Operator does not exist, add it
      console.log(`New operator found: ${operatorName} - ${operatorWebsite}`);
      await operatorsRef.add({
        name: operatorName,
        website: operatorWebsite,
        status: 'new',
        hq_location: null,
        overall_impact_score: null,
        summary_ai: null,
        conservation_category: [],
        experience_type: [],
        proof_of_impact_links: [],
        certifications: [],
        last_vetted_date: null,
        human_verified: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Operator added to Firestore.');
    } else {
      console.log(`ℹ️ Operator already exists: ${operatorWebsite}`);
    }
  } catch (error) {
    console.error('❌ Error processing operator:', error);
    throw error;
  }
}

/**
 * Simple discovery test function
 */
export const testDiscovery = functions.https.onRequest(async (request, response) => {
  try {
    console.log('🔍 Testing operator discovery...');
    
    // Simulate discovering 3 test operators
    const testOperators = [
      { name: 'Costa Rica Wildlife Lodge', website: 'https://costa-rica-wildlife.com', tier: 'tier1' },
      { name: 'Kenya Conservation Camp', website: 'https://kenya-conservation.com', tier: 'tier2' },
      { name: 'Amazon Research Station', website: 'https://amazon-research.com', tier: 'tier1' }
    ];
    
    const results = [];
    
    for (const operator of testOperators) {
      await processNewOperator(operator.name, operator.website);
      results.push({
        name: operator.name,
        website: operator.website,
        status: 'processed'
      });
    }
    
    console.log(`✅ Processed ${results.length} test operators`);
    
    response.json({
      success: true,
      message: 'Discovery test completed!',
      operators_processed: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Discovery test failed:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get database stats
 */
export const getDatabaseStats = functions.https.onRequest(async (request, response) => {
  try {
    const stats = {
      operators: 0,
      discovery_queue: 0,
      operator_analysis: 0,
      scraping_tasks: 0
    };
    
    // Count documents in each collection
    const operatorsSnapshot = await db.collection('operators').get();
    stats.operators = operatorsSnapshot.size;
    
    const discoverySnapshot = await db.collection('discovery-queue').get();
    stats.discovery_queue = discoverySnapshot.size;
    
    const analysisSnapshot = await db.collection('operator-analysis').get();
    stats.operator_analysis = analysisSnapshot.size;
    
    const tasksSnapshot = await db.collection('scraping-tasks').get();
    stats.scraping_tasks = tasksSnapshot.size;
    
    response.json({
      success: true,
      database_stats: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
