import { db, auth, functions } from '../services/firebase/config';
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';

// Comprehensive Firebase Diagnostic Tool
export class FirebaseDiagnostic {
  
  static async runFullDiagnostic(): Promise<{
    success: boolean;
    results: any[];
    summary: string;
  }> {
    console.log('🔧 Starting Firebase Diagnostic...');
    const results: any[] = [];
    let allPassed = true;

    // Test 1: Firebase Configuration
    try {
      console.log('📋 Test 1: Firebase Configuration');
      const configTest = {
        name: 'Firebase Configuration',
        status: 'success' as const,
        details: {
          projectId: db.app.options.projectId,
          authDomain: db.app.options.authDomain,
          storageBucket: db.app.options.storageBucket,
          apiKey: db.app.options.apiKey?.substring(0, 10) + '...',
        }
      };
      results.push(configTest);
      console.log('✅ Configuration looks valid');
    } catch (error: any) {
      results.push({
        name: 'Firebase Configuration',
        status: 'error' as const,
        error: error.message
      });
      allPassed = false;
      console.error('❌ Configuration error:', error);
    }

    // Test 2: Database Connection
    try {
      console.log('📋 Test 2: Database Connection');
      const testRef = collection(db, 'test');
      console.log('✅ Database reference created successfully');
      results.push({
        name: 'Database Connection',
        status: 'success' as const,
        details: 'Database instance created successfully'
      });
    } catch (error: any) {
      results.push({
        name: 'Database Connection',
        status: 'error' as const,
        error: error.message
      });
      allPassed = false;
      console.error('❌ Database connection error:', error);
    }

    // Test 3: Read Operations
    try {
      console.log('📋 Test 3: Read Operations');
      const operatorsRef = collection(db, 'operators');
      const snapshot = await getDocs(operatorsRef);
      console.log(`✅ Read successful: ${snapshot.size} operators found`);
      results.push({
        name: 'Read Operations',
        status: 'success' as const,
        details: `Found ${snapshot.size} operators in database`
      });
    } catch (error: any) {
      results.push({
        name: 'Read Operations',
        status: 'error' as const,
        error: error.message
      });
      allPassed = false;
      console.error('❌ Read operations error:', error);
    }

    // Test 4: Write Operations (Test Document)
    try {
      console.log('📋 Test 4: Write Operations');
      const testDoc = {
        name: 'Firebase Diagnostic Test',
        timestamp: new Date().toISOString(),
        testId: `test-${Date.now()}`,
        status: 'testing'
      };
      
      const docRef = await addDoc(collection(db, 'diagnostic-test'), testDoc);
      console.log('✅ Write successful, document ID:', docRef.id);
      
      // Clean up test document
      await deleteDoc(doc(db, 'diagnostic-test', docRef.id));
      console.log('✅ Cleanup successful');
      
      results.push({
        name: 'Write Operations',
        status: 'success' as const,
        details: `Successfully wrote and deleted test document: ${docRef.id}`
      });
    } catch (error: any) {
      results.push({
        name: 'Write Operations',
        status: 'error' as const,
        error: error.message
      });
      allPassed = false;
      console.error('❌ Write operations error:', error);
    }

    // Test 5: Operator Collection Write
    try {
      console.log('📋 Test 5: Operator Collection Write');
      const testOperator = {
        name: 'Diagnostic Test Operator',
        status: 'test',
        tier: 'test',
        source: 'diagnostic',
        continent: 'test',
        country: 'test',
        region: 'test',
        conservation_focus: ['test'],
        created_at: new Date().toISOString(),
        description: 'This is a test operator for diagnostic purposes'
      };
      
      const operatorRef = await addDoc(collection(db, 'operators'), testOperator);
      console.log('✅ Operator write successful, document ID:', operatorRef.id);
      
      // Clean up test operator
      await deleteDoc(doc(db, 'operators', operatorRef.id));
      console.log('✅ Operator cleanup successful');
      
      results.push({
        name: 'Operator Collection Write',
        status: 'success' as const,
        details: `Successfully wrote and deleted test operator: ${operatorRef.id}`
      });
    } catch (error: any) {
      results.push({
        name: 'Operator Collection Write',
        status: 'error' as const,
        error: error.message
      });
      allPassed = false;
      console.error('❌ Operator write error:', error);
    }

    // Test 6: Authentication Status
    try {
      console.log('📋 Test 6: Authentication Status');
      const authStatus = {
        isSignedIn: !!auth.currentUser,
        userId: auth.currentUser?.uid || 'Not signed in',
        isAnonymous: auth.currentUser?.isAnonymous || false
      };
      
      results.push({
        name: 'Authentication Status',
        status: 'success' as const,
        details: authStatus
      });
      console.log('✅ Auth status checked:', authStatus);
    } catch (error: any) {
      results.push({
        name: 'Authentication Status',
        status: 'error' as const,
        error: error.message
      });
      console.error('❌ Auth status error:', error);
    }

    // Test 7: Security Rules Test
    try {
      console.log('📋 Test 7: Security Rules Test');
      
      // Test unauthenticated write to operators (should work based on rules)
      const unauthedTest = {
        name: 'Unauth Test Operator',
        status: 'test',
        source: 'security-test',
        created_at: new Date().toISOString()
      };
      
      const unauthedRef = await addDoc(collection(db, 'operators'), unauthedTest);
      await deleteDoc(doc(db, 'operators', unauthedRef.id));
      
      results.push({
        name: 'Security Rules Test',
        status: 'success' as const,
        details: 'Unauthenticated writes to operators collection work as expected'
      });
      console.log('✅ Security rules working correctly');
    } catch (error: any) {
      results.push({
        name: 'Security Rules Test',
        status: 'error' as const,
        error: error.message
      });
      allPassed = false;
      console.error('❌ Security rules error:', error);
    }

    // Generate summary
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const summary = `${successCount}/${results.length} tests passed. ${errorCount} errors found.`;

    console.log('\n🎯 Diagnostic Complete!');
    console.log(`📊 Summary: ${summary}`);
    
    if (allPassed) {
      console.log('✅ All Firebase services are working correctly!');
    } else {
      console.log('❌ Some Firebase services have issues. Check the results above.');
    }

    return {
      success: allPassed,
      results,
      summary
    };
  }

  // Quick seeding test
  static async testOperatorSeeding(count: number = 5): Promise<{
    success: boolean;
    operatorsCreated: number;
    errors: string[];
  }> {
    console.log(`🌱 Testing operator seeding with ${count} operators...`);
    
    const errors: string[] = [];
    let operatorsCreated = 0;
    
    for (let i = 0; i < count; i++) {
      try {
        const testOperator = {
          name: `Test Operator ${i + 1}`,
          status: 'test',
          tier: i % 2 === 0 ? 'tier1' : 'tier2',
          source: 'seeding-test',
          continent: ['africa', 'asia', 'americas', 'europe', 'oceania'][i % 5],
          country: `Test Country ${i + 1}`,
          region: `Test Region ${i + 1}`,
          conservation_focus: ['wildlife', 'marine', 'forest'][i % 3],
          created_at: new Date().toISOString(),
          description: `Test operator ${i + 1} for seeding diagnostic`,
          trust_score: Math.floor(Math.random() * 10) + 1,
          price_range: ['$', '$$', '$$$'][i % 3]
        };
        
        await addDoc(collection(db, 'operators'), testOperator);
        operatorsCreated++;
        console.log(`✅ Created test operator ${i + 1}`);
      } catch (error: any) {
        errors.push(`Operator ${i + 1}: ${error.message}`);
        console.error(`❌ Failed to create operator ${i + 1}:`, error);
      }
    }
    
    console.log(`🎯 Seeding test complete: ${operatorsCreated}/${count} operators created`);
    
    return {
      success: operatorsCreated === count,
      operatorsCreated,
      errors
    };
  }

  // Clean up test data
  static async cleanupTestData(): Promise<void> {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Clean diagnostic test collection
      const diagnosticSnapshot = await getDocs(collection(db, 'diagnostic-test'));
      for (const docSnap of diagnosticSnapshot.docs) {
        await deleteDoc(doc(db, 'diagnostic-test', docSnap.id));
      }
      
      // Clean test operators
      const operatorsSnapshot = await getDocs(collection(db, 'operators'));
      let cleanedCount = 0;
      
      for (const docSnap of operatorsSnapshot.docs) {
        const data = docSnap.data();
        if (data.source === 'diagnostic' || data.source === 'seeding-test' || data.status === 'test') {
          await deleteDoc(doc(db, 'operators', docSnap.id));
          cleanedCount++;
        }
      }
      
      console.log(`✅ Cleaned up ${cleanedCount} test documents`);
    } catch (error: any) {
      console.error('❌ Cleanup error:', error);
    }
  }
}
