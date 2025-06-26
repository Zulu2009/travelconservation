import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, addDoc, deleteDoc } from 'firebase/firestore';

// Test Firebase API Key Validity
export const testFirebaseApiKey = async (apiKey: string): Promise<{
  valid: boolean;
  error?: string;
  details?: any;
}> => {
  try {
    console.log('🔑 Testing Firebase API Key...', apiKey.substring(0, 20) + '...');
    
    // Create temporary Firebase config with new API key
    const testConfig = {
      apiKey: apiKey,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'travelconservation-b4f04.firebaseapp.com',
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'travelconservation-b4f04',
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'travelconservation-b4f04.firebasestorage.app',
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '1076018123076',
      appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:1076018123076:web:8cf0799de2408810a50711',
    };

    // Initialize temporary Firebase app
    const testApp = initializeApp(testConfig, 'api-key-test');
    const testDb = getFirestore(testApp);
    
    // Test connection by creating and deleting a document
    console.log('📝 Testing Firestore write access...');
    const testDoc = await addDoc(collection(testDb, 'api-key-test'), {
      message: 'API Key Test',
      timestamp: new Date(),
      testId: Math.random().toString(36).substring(7)
    });
    
    console.log('✅ Write successful, document ID:', testDoc.id);
    
    // Clean up test document
    await deleteDoc(testDoc);
    console.log('🗑️ Test document cleaned up');
    
    // Clean up test app
    await deleteApp(testApp);
    
    return {
      valid: true,
      details: {
        projectId: testConfig.projectId,
        authDomain: testConfig.authDomain
      }
    };
    
  } catch (error) {
    console.error('❌ API Key test failed:', error);
    
    let errorMessage = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide specific guidance based on error type
      if (errorMessage.includes('API key not valid')) {
        errorMessage = 'API key is invalid or malformed';
      } else if (errorMessage.includes('Permission denied')) {
        errorMessage = 'API key lacks required permissions';
      } else if (errorMessage.includes('Project not found')) {
        errorMessage = 'Project ID not found or inaccessible';
      } else if (errorMessage.includes('Quota exceeded')) {
        errorMessage = 'Firebase quota exceeded';
      } else if (errorMessage.includes('API key restrictions')) {
        errorMessage = 'API key has restrictions that block Firebase APIs';
      }
    }
    
    return {
      valid: false,
      error: errorMessage,
      details: error
    };
  }
};

// Test current environment API key
export const testCurrentApiKey = async (): Promise<{
  valid: boolean;
  error?: string;
  currentKey?: string;
}> => {
  const currentKey = process.env.REACT_APP_FIREBASE_API_KEY;
  
  if (!currentKey) {
    return {
      valid: false,
      error: 'No API key found in environment variables'
    };
  }
  
  const result = await testFirebaseApiKey(currentKey);
  
  return {
    ...result,
    currentKey: currentKey.substring(0, 20) + '...'
  };
};

// Quick connection test for debugging
export const quickConnectionTest = async (): Promise<void> => {
  console.log('🔍 Quick Firebase Connection Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Test current API key
  const result = await testCurrentApiKey();
  
  if (result.valid) {
    console.log('✅ SUCCESS: Current API key is working!');
    console.log(`🔑 Key: ${result.currentKey}`);
  } else {
    console.log('❌ FAILED: Current API key is not working');
    console.log(`🔑 Key: ${result.currentKey}`);
    console.log(`💥 Error: ${result.error}`);
    console.log('');
    console.log('🛠️ NEXT STEPS:');
    console.log('1. Get new API key from Firebase Console');
    console.log('2. Update REACT_APP_FIREBASE_API_KEY in .env file');
    console.log('3. Restart development server');
    console.log('4. Run this test again');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

export default testFirebaseApiKey;
