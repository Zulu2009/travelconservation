import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
const LOCATION = 'us-central1';

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.0-pro',
});

interface AnalysisRequest {
  operator_id: string;
  operator_url: string;
  tier: 'tier1' | 'tier2';
  scraped_data: any;
  task_id: string;
}

interface AnalysisResult {
  summary_ai: string;
  conservation_category: string[];
  experience_type: string[];
  proof_of_impact_links: string[];
  certifications: string[];
  overall_score: number;
  tier_score: number;
  category_scores: {
    [category: string]: number;
  };
  red_flags: string[];
  positive_indicators: string[];
  confidence_level: number;
  analysis_summary: string;
}

// Comprehensive scoring keywords from the framework
const SCORING_KEYWORDS = {
  tier1_indicators: {
    carbon_reporting: {
      keywords: ['scope 1', 'scope 2', 'scope 3', 'carbon neutral certified', 'carbon negative', 'gold standard', 'verra', 'carbon footprint report'],
      max_points: 25,
      weights: { high: 10, medium: 6, low: 3 }
    },
    research_partnerships: {
      keywords: ['university partnership', 'research collaboration', 'citizen science', 'published research', 'peer-reviewed', 'data collection'],
      max_points: 25,
      weights: { high: 12, medium: 8, low: 5 }
    },
    government_partnerships: {
      keywords: ['national park partnership', 'government conservation', 'anti-poaching', 'protected area', 'conservation agreement'],
      max_points: 20,
      weights: { high: 10, medium: 6, low: 4 }
    },
    certifications: {
      keywords: ['b-corporation', 'gstc certified', 'rainforest alliance', 'fair trade tourism', 'atta membership'],
      max_points: 15,
      weights: { high: 8, medium: 5, low: 2 }
    },
    transparency: {
      keywords: ['annual sustainability report', 'impact dashboard', 'financial transparency', 'third-party audit', 'independent verification'],
      max_points: 15,
      weights: { high: 8, medium: 4, low: 2 }
    }
  },
  
  tier2_indicators: {
    grassroots_innovation: {
      keywords: ['community-led', 'locally-owned', 'social enterprise', 'cooperative', 'youth programs', 'volunteer opportunities'],
      max_points: 20,
      weights: { high: 10, medium: 6, low: 4 }
    },
    affordable_access: {
      keywords: ['budget conservation', 'volunteer program', 'homestay', 'affordable', 'student discount', 'group pricing'],
      max_points: 15,
      weights: { high: 8, medium: 4, low: 2 }
    },
    experiential_learning: {
      keywords: ['wildlife research', 'hands-on conservation', 'cultural immersion', 'wilderness skills', 'traditional skills'],
      max_points: 15,
      weights: { high: 8, medium: 4, low: 2 }
    }
  },
  
  red_flags: {
    animal_exploitation: {
      keywords: ['elephant ride', 'captive wildlife', 'dolphin encounter', 'tiger selfie', 'wildlife petting'],
      penalty: -20
    },
    greenwashing: {
      keywords: ['eco-friendly without specifics', 'green tourism vague', 'sustainable without evidence'],
      penalty: -8
    },
    overtourism: {
      keywords: ['mass tourism', 'large groups', 'crowded destinations', 'overtourism'],
      penalty: -15
    },
    lack_transparency: {
      keywords: ['no sustainability information', 'unclear partnerships', 'no local hiring data'],
      penalty: -10
    }
  }
};

/**
 * AI Analysis Agent - Analyzes scraped operator data using Vertex AI
 */
export const analyzeOperator = functions.https.onRequest(async (request, response) => {
  try {
    const analysisRequest: AnalysisRequest = request.body;
    
    if (!analysisRequest.operator_id || !analysisRequest.scraped_data) {
      response.status(400).json({
        success: false,
        error: 'Missing required fields: operator_id, scraped_data'
      });
      return;
    }
    
    console.log(`🧠 Starting AI analysis for operator: ${analysisRequest.operator_id}`);
    
    // Perform comprehensive analysis using Vertex AI
    const analysisResult = await performVertexAIAnalysis(analysisRequest);
    
    // Store analysis results
    await storeAnalysisResults(analysisRequest.operator_id, analysisResult);
    
    // Update operator record with scores
    await updateOperatorWithScores(analysisRequest.operator_id, analysisResult);
    
    console.log(`✅ Analysis complete for ${analysisRequest.operator_id}: Score ${analysisResult.overall_score}/100`);
    
    response.json({
      success: true,
      operator_id: analysisRequest.operator_id,
      analysis_result: analysisResult
    });
    
  } catch (error) {
    console.error('❌ Analysis agent failed:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Perform comprehensive analysis using Vertex AI (like your Python example)
 */
async function performVertexAIAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
  const { operator_id, scraped_data, tier } = request;
  
  // Extract text content from scraped data
  const textContent = extractTextContent(scraped_data);
  const operatorName = scraped_data.basic_info?.company_name || operator_id;
  
  // Build the analysis prompt (similar to your Python version)
  const prompt = `
    You are an expert analyst for travelconservation.com.
    Analyze the following text from the website '${operatorName}'.
    Populate the following JSON object based ONLY on information found in the text.
    If information is not present, use "null" or an empty array [].

    - For 'conservation_category', choose from: ['Wildlife Protection', 'Reforestation', 'Marine Research', 'Community Development', 'Habitat Restoration', 'Anti-Poaching'].
    - For 'experience_type', choose from: ['Luxury Lodge', 'Research Expedition', 'High Adventure', 'Cultural Immersion', 'Philanthropic Journey'].

    Output ONLY the JSON object.

    JSON Structure:
    {
      "summary_ai": "A 200-word summary of their mission, values, and what they do...",
      "conservation_category": [],
      "experience_type": [],
      "proof_of_impact_links": [],
      "certifications": []
    }

    Text to analyze:
    ---
    ${textContent}
    ---
  `;

  try {
    // Use Vertex AI to analyze the content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Vertex AI response');
    }
    
    const aiAnalysis = JSON.parse(jsonMatch[0]);
    
    // Perform keyword-based scoring
    const keywordScores = performKeywordScoring(scraped_data, tier);
    
    // Detect red flags
    const redFlags = detectRedFlags(scraped_data);
    
    // Calculate final scores
    const finalScores = calculateFinalScores(aiAnalysis, keywordScores, redFlags, tier);
    
    // Combine AI analysis with scoring results
    return {
      summary_ai: aiAnalysis.summary_ai || 'Analysis completed.',
      conservation_category: aiAnalysis.conservation_category || [],
      experience_type: aiAnalysis.experience_type || [],
      proof_of_impact_links: aiAnalysis.proof_of_impact_links || [],
      certifications: aiAnalysis.certifications || [],
      ...finalScores
    };
    
  } catch (error) {
    console.error('Error in Vertex AI analysis:', error);
    throw new Error(`Vertex AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text content from scraped data
 */
function extractTextContent(scrapedData: any): string {
  const textParts: string[] = [];
  
  // Basic info
  if (scrapedData.basic_info) {
    textParts.push(JSON.stringify(scrapedData.basic_info));
  }
  
  // Sustainability content
  if (scrapedData.sustainability?.sustainability_content) {
    textParts.push(...scrapedData.sustainability.sustainability_content);
  }
  
  // Certifications
  if (scrapedData.certifications) {
    textParts.push(JSON.stringify(scrapedData.certifications));
  }
  
  // Partnerships
  if (scrapedData.partnerships) {
    textParts.push(JSON.stringify(scrapedData.partnerships));
  }
  
  // Reports content
  if (scrapedData.reports) {
    scrapedData.reports.forEach((report: any) => {
      if (report.content_preview) {
        textParts.push(report.content_preview);
      }
    });
  }
  
  // Content analysis
  if (scrapedData.content_analysis) {
    textParts.push(JSON.stringify(scrapedData.content_analysis));
  }
  
  return textParts.join('\n\n').substring(0, 8000); // Limit to 8000 chars for API
}

/**
 * Keyword-based scoring using the comprehensive framework
 */
function performKeywordScoring(scrapedData: any, tier: 'tier1' | 'tier2'): any {
  const content = JSON.stringify(scrapedData).toLowerCase();
  const scores: any = {};
  
  const indicators = tier === 'tier1' ? SCORING_KEYWORDS.tier1_indicators : SCORING_KEYWORDS.tier2_indicators;
  
  for (const [category, config] of Object.entries(indicators)) {
    let categoryScore = 0;
    const foundKeywords: string[] = [];
    
    for (const keyword of config.keywords) {
      if (content.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        
        // Determine keyword strength and assign points
        const strength = determineKeywordStrength(keyword, content);
        categoryScore += config.weights[strength] || config.weights.low;
      }
    }
    
    scores[category] = {
      score: Math.min(categoryScore, config.max_points),
      max_points: config.max_points,
      keywords_found: foundKeywords
    };
  }
  
  return scores;
}

/**
 * Determine keyword strength based on context
 */
function determineKeywordStrength(keyword: string, content: string): 'high' | 'medium' | 'low' {
  const keywordIndex = content.indexOf(keyword.toLowerCase());
  if (keywordIndex === -1) return 'low';
  
  // Check surrounding context for strength indicators
  const contextStart = Math.max(0, keywordIndex - 100);
  const contextEnd = Math.min(content.length, keywordIndex + 100);
  const context = content.substring(contextStart, contextEnd);
  
  const strongIndicators = ['certified', 'verified', 'official', 'partnership', 'collaboration', 'award'];
  const mediumIndicators = ['program', 'initiative', 'project', 'commitment'];
  
  if (strongIndicators.some(indicator => context.includes(indicator))) {
    return 'high';
  } else if (mediumIndicators.some(indicator => context.includes(indicator))) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Detect red flags in content
 */
function detectRedFlags(scrapedData: any): string[] {
  const content = JSON.stringify(scrapedData).toLowerCase();
  const detectedFlags: string[] = [];
  
  for (const [category, config] of Object.entries(SCORING_KEYWORDS.red_flags)) {
    for (const keyword of config.keywords) {
      if (content.includes(keyword.toLowerCase())) {
        detectedFlags.push(`${category}: ${keyword}`);
      }
    }
  }
  
  return detectedFlags;
}

/**
 * Calculate final scores combining AI and keyword analysis
 */
function calculateFinalScores(
  aiAnalysis: any, 
  keywordScores: any, 
  redFlags: string[], 
  tier: 'tier1' | 'tier2'
): any {
  
  let totalScore = 0;
  const categoryScores: any = {};
  
  // Calculate scores from keyword analysis
  for (const [category, keywordData] of Object.entries(keywordScores)) {
    const keywordScore = (keywordData as any).score;
    categoryScores[category] = keywordScore;
    totalScore += keywordScore;
  }
  
  // Apply red flag penalties
  let penalties = 0;
  for (const flag of redFlags) {
    const flagCategory = flag.split(':')[0];
    const penaltyConfig = SCORING_KEYWORDS.red_flags[flagCategory as keyof typeof SCORING_KEYWORDS.red_flags];
    if (penaltyConfig) {
      penalties += Math.abs(penaltyConfig.penalty);
    }
  }
  
  const finalScore = Math.max(0, Math.min(100, totalScore - penalties));
  
  // Determine tier classification
  let tierClassification = 'Tier 4: Basic Operators';
  if (finalScore >= 80) tierClassification = 'Tier 1: Conservation Leaders';
  else if (finalScore >= 60) tierClassification = 'Tier 2: Committed Operators';
  else if (finalScore >= 40) tierClassification = 'Tier 3: Emerging Operators';
  else if (finalScore < 20) tierClassification = 'Tier 5: Problematic Operators';
  
  return {
    overall_score: finalScore,
    tier_score: totalScore,
    category_scores: categoryScores,
    red_flags: redFlags,
    positive_indicators: aiAnalysis.certifications || [],
    confidence_level: 0.8, // High confidence with Vertex AI
    analysis_summary: `${tierClassification}. Total penalties: ${penalties} points.`
  };
}

/**
 * Store analysis results in Firestore
 */
async function storeAnalysisResults(operatorId: string, results: AnalysisResult): Promise<void> {
  await admin.firestore().collection('operator-analysis').doc(operatorId).set({
    ...results,
    analyzed_at: admin.firestore.FieldValue.serverTimestamp(),
    version: '2.0',
    analysis_method: 'vertex_ai'
  });
}

/**
 * Update operator record with calculated scores
 */
async function updateOperatorWithScores(operatorId: string, results: AnalysisResult): Promise<void> {
  const operatorRef = admin.firestore().collection('operators').doc(operatorId);
  
  await operatorRef.update({
    'analysis.overall_score': results.overall_score,
    'analysis.category_scores': results.category_scores,
    'analysis.red_flags': results.red_flags,
    'analysis.confidence_level': results.confidence_level,
    'analysis.conservation_category': results.conservation_category,
    'analysis.experience_type': results.experience_type,
    'analysis.summary_ai': results.summary_ai,
    'analysis.last_analyzed': admin.firestore.FieldValue.serverTimestamp(),
    'verification.ai_verified': true,
    'verification.needs_human_review': results.overall_score < 60 || results.red_flags.length > 0
  });
}

/**
 * Batch analyze multiple operators
 */
export const batchAnalyzeOperators = functions.https.onRequest(async (request, response) => {
  try {
    const { operator_ids, force_reanalysis = false } = request.body;
    
    if (!operator_ids || !Array.isArray(operator_ids)) {
      response.status(400).json({
        success: false,
        error: 'operator_ids must be an array'
      });
      return;
    }
    
    console.log(`🔄 Starting batch analysis for ${operator_ids.length} operators`);
    
    const results = [];
    
    for (const operatorId of operator_ids) {
      try {
        // Check if already analyzed (unless force reanalysis)
        if (!force_reanalysis) {
          const existingAnalysis = await admin.firestore()
            .collection('operator-analysis')
            .doc(operatorId)
            .get();
          
          if (existingAnalysis.exists) {
            console.log(`⏭️ Skipping ${operatorId} - already analyzed`);
            continue;
          }
        }
        
        // Get operator data
        const operatorDoc = await admin.firestore().collection('operators').doc(operatorId).get();
        if (!operatorDoc.exists) {
          console.log(`❌ Operator ${operatorId} not found`);
          continue;
        }
        
        const operatorData = operatorDoc.data();
        
        // Simulate analysis request
        const analysisRequest: AnalysisRequest = {
          operator_id: operatorId,
          operator_url: operatorData?.website || operatorData?.url,
          tier: operatorData?.tier || 'tier2',
          scraped_data: operatorData,
          task_id: `batch-${Date.now()}`
        };
        
        const analysisResult = await performVertexAIAnalysis(analysisRequest);
        await storeAnalysisResults(operatorId, analysisResult);
        await updateOperatorWithScores(operatorId, analysisResult);
        
        results.push({
          operator_id: operatorId,
          score: analysisResult.overall_score,
          status: 'completed'
        });
        
        console.log(`✅ Analyzed ${operatorId}: ${analysisResult.overall_score}/100`);
        
        // Rate limiting for Vertex AI
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error analyzing ${operatorId}:`, error);
        results.push({
          operator_id: operatorId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`🎉 Batch analysis complete: ${results.length} operators processed`);
    
    response.json({
      success: true,
      processed_count: results.length,
      results
    });
    
  } catch (error) {
    console.error('❌ Batch analysis failed:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
