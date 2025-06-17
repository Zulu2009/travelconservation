# 🧪 AGENTIC VETTING SYSTEM - TESTING GUIDE

## Quick Start Testing

Once the Cloud Functions are deployed, you can test the system immediately using these URLs:

### 1. Test Database Connection
```
https://us-central1-travelconservation-b4f04.cloudfunctions.net/testDatabaseConnection
```

**What it does:**
- Tests basic Firestore connection
- Creates a sample operator (like your example)
- Tests discovery queue functionality
- Returns database statistics

**Expected Response:**
```json
{
  "success": true,
  "message": "All database tests passed!",
  "tests": {
    "firestore_connection": "✅ Connected",
    "operator_creation": "✅ Working",
    "operator_count": 5,
    "discovery_queue": "✅ Working"
  },
  "timestamp": "2025-01-06T..."
}
```

### 2. Test Operator Discovery
```
https://us-central1-travelconservation-b4f04.cloudfunctions.net/testDiscovery
```

**What it does:**
- Simulates discovering 3 test operators
- Adds them to your operators collection
- Tests the processNewOperator function (your example code)

**Expected Response:**
```json
{
  "success": true,
  "message": "Discovery test completed!",
  "operators_processed": [
    {
      "name": "Costa Rica Wildlife Lodge",
      "website": "https://costa-rica-wildlife.com",
      "status": "processed"
    },
    // ... more operators
  ]
}
```

### 3. Get Database Statistics
```
https://us-central1-travelconservation-b4f04.cloudfunctions.net/getDatabaseStats
```

**What it does:**
- Counts documents in all collections
- Shows current database state

**Expected Response:**
```json
{
  "success": true,
  "database_stats": {
    "operators": 8,
    "discovery_queue": 1,
    "operator_analysis": 0,
    "scraping_tasks": 0
  }
}
```

## Testing the Full Agentic System

### 4. Test Operator Discovery (Full System)
```
https://us-central1-travelconservation-b4f04.cloudfunctions.net/discoverOperators
```

**POST Request Body:**
```json
{
  "sources": ["b_corp", "gstc"],
  "tier": "tier1",
  "limit": 10
}
```

### 5. Test AI Analysis
```
https://us-central1-travelconservation-b4f04.cloudfunctions.net/analyzeOperator
```

**POST Request Body:**
```json
{
  "operator_id": "test-operator-123",
  "operator_url": "https://example-eco-lodge.com",
  "tier": "tier1",
  "scraped_data": {
    "basic_info": {
      "company_name": "Example Eco Lodge",
      "description": "Sustainable wildlife conservation lodge"
    },
    "sustainability": {
      "sustainability_content": [
        "We support local wildlife conservation",
        "Carbon neutral certified operations"
      ]
    },
    "certifications": ["B-Corp", "Rainforest Alliance"]
  },
  "task_id": "test-task-123"
}
```

## Viewing Results in Firebase Console

1. **Go to Firebase Console:** https://console.firebase.google.com/
2. **Select your project:** travelconservation-b4f04
3. **Navigate to Firestore Database**
4. **Check these collections:**
   - `operators` - New operators added by the system
   - `discovery-queue` - Operators waiting to be processed
   - `operator-analysis` - AI analysis results
   - `test` - Test connection data

## Integration with Your Web App

### Add Test Button to Admin Dashboard

Add this to your admin dashboard component:

```typescript
const testDatabaseConnection = async () => {
  try {
    const response = await fetch(
      'https://us-central1-travelconservation-b4f04.cloudfunctions.net/testDatabaseConnection'
    );
    const result = await response.json();
    console.log('Database test result:', result);
    alert('Database test completed! Check console for details.');
  } catch (error) {
    console.error('Test failed:', error);
    alert('Test failed! Check console for details.');
  }
};

// In your JSX:
<button onClick={testDatabaseConnection}>
  Test Database Connection
</button>
```

### View Operators in Your App

The test functions will create operators that should appear in your existing directory:

```typescript
// This should now show test operators created by the system
const { listings } = useListings();
```

## Expected Data Flow

1. **Discovery Agent** finds new operators → adds to `operators` collection
2. **Your Web App** displays them in the directory
3. **Analysis Agent** processes them → adds scores to `operator-analysis`
4. **Analytics Engine** calculates metrics → updates operator records
5. **Your Web App** shows updated scores and analysis

## Troubleshooting

### If Tests Fail:

1. **Check Function Logs:**
   ```bash
   cd travelconservation
   firebase functions:log
   ```

2. **Verify Firestore Rules:**
   - Make sure your Firestore rules allow the functions to read/write

3. **Check API Keys:**
   - Ensure Gemini API key is configured in Firebase Functions config

### Common Issues:

- **403 Errors:** Firestore security rules too restrictive
- **500 Errors:** Missing API keys or dependencies
- **Timeout:** Functions taking too long (increase timeout in firebase.json)

## Next Steps After Testing

1. **Verify operators appear in your web app directory**
2. **Test the AI analysis results**
3. **Check that metrics are calculated correctly**
4. **Set up automated scheduling (Cloud Scheduler)**
5. **Deploy Cloud Run scrapers for full automation**

## Cost Monitoring

- **Firestore:** ~$0.01 per 1000 operations
- **Cloud Functions:** ~$0.40 per million invocations
- **Vertex AI (Gemini):** ~$0.50 per million tokens
- **Expected monthly cost:** $50-200 for moderate usage

Monitor usage in Google Cloud Console → Billing.
