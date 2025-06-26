import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase/config';

export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Test write capability
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Firebase connection test',
      timestamp: new Date(),
      testId: Math.random().toString(36).substring(7)
    });
    
    console.log('✅ Write test successful, document created:', testDoc.id);
    
    // Test read capability
    const snapshot = await getDocs(collection(db, 'test'));
    console.log('✅ Read test successful, found', snapshot.size, 'test documents');
    
    // Clean up test document
    await deleteDoc(testDoc);
    console.log('✅ Cleanup successful, test document deleted');
    
    console.log('🎉 Firebase connection test PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection test FAILED:', error);
    
    // Provide specific error guidance
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('permission')) {
        console.error('🔒 Permission error - check Firestore security rules');
      } else if (errorMessage.includes('network')) {
        console.error('🌐 Network error - check internet connection');
      } else if (errorMessage.includes('configuration')) {
        console.error('⚙️ Configuration error - check Firebase config');
      } else if (errorMessage.includes('quota')) {
        console.error('📊 Quota exceeded - check Firebase usage limits');
      }
    }
    
    return false;
  }
};

export const getFirestoreStatus = async (): Promise<{
  connected: boolean;
  operatorCount: number;
  error?: string;
}> => {
  try {
    const operatorsSnapshot = await getDocs(collection(db, 'operators'));
    
    return {
      connected: true,
      operatorCount: operatorsSnapshot.size
    };
  } catch (error) {
    return {
      connected: false,
      operatorCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
