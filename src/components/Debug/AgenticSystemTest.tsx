import React, { useState } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
  tests?: Record<string, any>;
  database_stats?: Record<string, number>;
  error?: string;
}

const AgenticSystemTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const functions = getFunctions();

  const runTest = async (testName: string, functionName: string) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    
    try {
      // Call as HTTP endpoint instead of callable function
      const response = await fetch(`https://us-central1-travelconservation-b4f04.cloudfunctions.net/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [testName]: result as TestResult
      }));
    } catch (error) {
      console.error(`Error in ${testName}:`, error);
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          message: `Failed to call ${functionName}`,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const runAllTests = async () => {
    await runTest('database', 'testDatabaseConnection');
    await runTest('discovery', 'testDiscovery');
    await runTest('stats', 'getDatabaseStats');
  };

  const getStatusIcon = (result?: TestResult) => {
    if (!result) return '⏸️';
    return result.success ? '✅' : '❌';
  };

  const getStatusColor = (result?: TestResult) => {
    if (!result) return 'text-gray-500';
    return result.success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🤖 Agentic System Connection Test
        </h2>
        <p className="text-gray-600">
          Test the connection to Firebase Cloud Functions and the agentic vetting system.
        </p>
      </div>

      {/* Control Panel */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runAllTests}
            disabled={Object.values(loading).some(Boolean)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.values(loading).some(Boolean) ? '🔄 Testing...' : '🚀 Run All Tests'}
          </button>
          
          <button
            onClick={() => runTest('database', 'testDatabaseConnection')}
            disabled={loading.database}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading.database ? '⏳' : '🗄️'} Database Test
          </button>
          
          <button
            onClick={() => runTest('discovery', 'testDiscovery')}
            disabled={loading.discovery}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading.discovery ? '⏳' : '🔍'} Discovery Test
          </button>
          
          <button
            onClick={() => runTest('stats', 'getDatabaseStats')}
            disabled={loading.stats}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading.stats ? '⏳' : '📊'} Stats Test
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {/* Database Connection Test */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">{getStatusIcon(testResults.database)}</span>
              Database Connection Test
            </h3>
            <span className={`text-sm ${getStatusColor(testResults.database)}`}>
              {testResults.database?.timestamp && 
                new Date(testResults.database.timestamp).toLocaleTimeString()
              }
            </span>
          </div>
          
          {testResults.database && (
            <div className="space-y-2">
              <p className={`font-medium ${getStatusColor(testResults.database)}`}>
                {testResults.database.message}
              </p>
              
              {testResults.database.tests && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div className="font-medium mb-2">Test Details:</div>
                  {Object.entries(testResults.database.tests).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {testResults.database.error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                  <strong>Error:</strong> {testResults.database.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Discovery Test */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">{getStatusIcon(testResults.discovery)}</span>
              Operator Discovery Test
            </h3>
            <span className={`text-sm ${getStatusColor(testResults.discovery)}`}>
              {testResults.discovery?.timestamp && 
                new Date(testResults.discovery.timestamp).toLocaleTimeString()
              }
            </span>
          </div>
          
          {testResults.discovery && (
            <div className="space-y-2">
              <p className={`font-medium ${getStatusColor(testResults.discovery)}`}>
                {testResults.discovery.message}
              </p>
              
              {testResults.discovery.error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                  <strong>Error:</strong> {testResults.discovery.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Database Stats */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">{getStatusIcon(testResults.stats)}</span>
              Database Statistics
            </h3>
            <span className={`text-sm ${getStatusColor(testResults.stats)}`}>
              {testResults.stats?.timestamp && 
                new Date(testResults.stats.timestamp).toLocaleTimeString()
              }
            </span>
          </div>
          
          {testResults.stats && testResults.stats.database_stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(testResults.stats.database_stats).map(([key, value]) => (
                <div key={key} className="bg-blue-50 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-blue-600">{value}</div>
                  <div className="text-sm text-blue-800 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {testResults.stats && testResults.stats.error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
              <strong>Error:</strong> {testResults.stats.error}
            </div>
          )}
        </div>
      </div>

      {/* System Status Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📋 System Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon(testResults.database)}</span>
            <span>Database Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon(testResults.discovery)}</span>
            <span>Discovery System</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon(testResults.stats)}</span>
            <span>Statistics API</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticSystemTest;
