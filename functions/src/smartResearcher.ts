import * as functions from 'firebase-functions';
import { VertexAI } from '@google-cloud/vertexai';
import axios from 'axios';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Initialize Vertex AI
const vertex_ai = new VertexAI({
  project: process.env.GCLOUD_PROJECT || 'travelconservation-b4f04',
  location: 'us-central1'
});

const model = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.1,
  },
});

const secretClient = new SecretManagerServiceClient();

interface OperatorData {
  name: string;
  website?: string;
  location?: string;
  type?: string;
}

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  search_query: string;
}

interface ResearchData {
  operator: OperatorData;
  search_results: SearchResult[];
  total_results: number;
}

interface AnalysisResult {
  operator_name: string;
  website: string;
  sustainability_score: number;
  certifications_found: string[];
  conservation_projects: string[];
  research_partnerships: string[];
  community_impact: string[];
  carbon_practices: string[];
  awards_recognition: string[];
  red_flags: string[];
  evidence_quality: 'high' | 'medium' | 'low';
  confidence_score: number;
  key_evidence: string[];
  data_sources: string[];
}

async function getSecret(secretName: string): Promise<string> {
  const name = `projects/${process.env.GCLOUD_PROJECT}/secrets/${secretName}/versions/latest`;
  const [version] = await secretClient.accessSecretVersion({ name });
  return version.payload?.data?.toString() || '';
}

async function researchOperatorWithSearch(operator: OperatorData): Promise<ResearchData> {
  try {
    const apiKey = await getSecret('google-search-api-key');
    const searchEngineId = await getSecret('search-engine-id');
    
    const operatorName = operator.name;
    const searches = [
      `"${operatorName}" sustainability certification`,
      `"${operatorName}" B-Corp GSTC carbon neutral`,
      `"${operatorName}" conservation project partnership`,
      `"${operatorName}" reviews responsible travel`,
      `"${operatorName}" university research collaboration`
    ];
    
    const allResults: SearchResult[] = [];
    
    for (const searchQuery of searches) {
      try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: {
            key: apiKey,
            cx: searchEngineId,
            q: searchQuery,
            num: 5 // Top 5 results per search
          }
        });
        
        if (response.status === 200 && response.data.items) {
          const results = response.data.items;
          for (const result of results) {
            allResults.push({
              title: result.title || '',
              snippet: result.snippet || '',
              link: result.link || '',
              search_query: searchQuery
            });
          }
        }
      } catch (searchError) {
        console.error(`Search failed for query: ${searchQuery}`, searchError);
      }
    }
    
    return {
      operator,
      search_results: allResults,
      total_results: allResults.length
    };
  } catch (error) {
    console.error('Research failed:', error);
    return {
      operator,
      search_results: [],
      total_results: 0
    };
  }
}

async function analyzeWithGemini(researchData: ResearchData): Promise<AnalysisResult> {
  const prompt = `
    Analyze this travel operator based on comprehensive search results:
    
    Operator: ${researchData.operator.name}
    Website: ${researchData.operator.website || 'Unknown'}
    
    Search Results:
    ${JSON.stringify(researchData.search_results, null, 2)}
    
    Extract and return ONLY valid JSON analysis (no other text):
    {
        "operator_name": "verified name",
        "website": "official website if found",
        "sustainability_score": 0,
        "certifications_found": [],
        "conservation_projects": [],
        "research_partnerships": [],
        "community_impact": [],
        "carbon_practices": [],
        "awards_recognition": [],
        "red_flags": [],
        "evidence_quality": "high",
        "confidence_score": 0,
        "key_evidence": [],
        "data_sources": []
    }
    
    Base the sustainability score on:
    - Verified certifications (B-Corp=25pts, GSTC=20pts, etc.)
    - Specific conservation projects (not vague claims)
    - Research/university partnerships
    - Community impact evidence
    - Carbon reduction initiatives
    
    Penalize for:
    - Vague sustainability claims without evidence
    - Animal exploitation indicators
    - Greenwashing language
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return {
      operator_name: researchData.operator.name,
      website: researchData.operator.website || '',
      sustainability_score: 0,
      certifications_found: [],
      conservation_projects: [],
      research_partnerships: [],
      community_impact: [],
      carbon_practices: [],
      awards_recognition: [],
      red_flags: ['Analysis failed'],
      evidence_quality: 'low' as const,
      confidence_score: 0,
      key_evidence: [],
      data_sources: []
    };
  }
}

async function queueVettingTask(analysis: AnalysisResult): Promise<void> {
  // TODO: Queue for human vetting if needed
  console.log(`Queued vetting for ${analysis.operator_name} (score: ${analysis.sustainability_score})`);
}

export const smartResearcher = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { operator } = req.body;
    
    if (!operator || !operator.name) {
      res.status(400).json({ error: 'Missing operator data' });
      return;
    }
    
    // Research operator using Google Search API
    const researchData = await researchOperatorWithSearch(operator);
    
    // Analyze findings with Gemini
    const analysis = await analyzeWithGemini(researchData);
    
    // Queue for vetting if needed
    await queueVettingTask(analysis);
    
    res.json({
      status: 'success',
      analysis,
      research_data: {
        total_results: researchData.total_results,
        search_queries_used: [...new Set(researchData.search_results.map(r => r.search_query))]
      }
    });
    
  } catch (error) {
    console.error('Smart researcher error:', error);
    res.status(500).json({ 
      error: 'Research failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
