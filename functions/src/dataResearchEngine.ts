// SYSTEM 2 - DATA RESEARCH ENGINE
// Uses Gemini Pro for cost-effective bulk supplier data extraction
// Processes suppliers in batches, fully integrated with Google Cloud

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as functions from 'firebase-functions';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);

export interface SupplierDataExtraction {
  supplierId: string;
  rawData: {
    websiteContent?: string;
    description?: string;
    reviews?: string[];
    certificationClaims?: string[];
    sustainabilityStatements?: string[];
  };
  extractedData: {
    certifications: string[];
    conservationProjects: string[];
    sustainabilityPractices: string[];
    communityBenefits: string[];
    financialTransparency: {
      hasPublicFinancials: boolean;
      conservationSpendingMentioned: boolean;
      communityInvestmentMentioned: boolean;
    };
    riskFactors: string[];
    trustIndicators: string[];
  };
  confidence: number;
  extractionDate: string;
}

export interface BatchExtractionJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  supplierIds: string[];
  progress: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
  };
  startedAt: string;
  completedAt?: string;
  results: SupplierDataExtraction[];
  errors: Array<{
    supplierId: string;
    error: string;
  }>;
}

class DataResearchEngine {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Extract structured data from supplier information using Gemini Pro
   */
  async extractSupplierData(
    supplierId: string,
    rawData: SupplierDataExtraction['rawData']
  ): Promise<SupplierDataExtraction> {
    try {
      console.log(`🔍 Extracting data for supplier: ${supplierId}`);

      const prompt = this.buildExtractionPrompt(rawData);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      const extractedData = JSON.parse(jsonMatch[0]);

      return {
        supplierId,
        rawData,
        extractedData: {
          certifications: extractedData.certifications || [],
          conservationProjects: extractedData.conservationProjects || [],
          sustainabilityPractices: extractedData.sustainabilityPractices || [],
          communityBenefits: extractedData.communityBenefits || [],
          financialTransparency: extractedData.financialTransparency || {
            hasPublicFinancials: false,
            conservationSpendingMentioned: false,
            communityInvestmentMentioned: false
          },
          riskFactors: extractedData.riskFactors || [],
          trustIndicators: extractedData.trustIndicators || []
        },
        confidence: extractedData.confidence || 0.5,
        extractionDate: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Data extraction failed for ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Process multiple suppliers in batch for cost efficiency
   */
  async batchExtractSupplierData(
    supplierIds: string[],
    getRawDataFunction: (supplierId: string) => Promise<SupplierDataExtraction['rawData']>
  ): Promise<BatchExtractionJob> {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const job: BatchExtractionJob = {
      jobId,
      status: 'processing',
      supplierIds,
      progress: {
        total: supplierIds.length,
        processed: 0,
        successful: 0,
        failed: 0
      },
      startedAt: new Date().toISOString(),
      results: [],
      errors: []
    };

    console.log(`🚀 Starting batch extraction job ${jobId} for ${supplierIds.length} suppliers`);

    try {
      // Process suppliers in batches of 3 to avoid rate limits (Gemini has generous limits)
      const batchSize = 3;
      for (let i = 0; i < supplierIds.length; i += batchSize) {
        const batch = supplierIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (supplierId) => {
          try {
            const rawData = await getRawDataFunction(supplierId);
            const extraction = await this.extractSupplierData(supplierId, rawData);
            
            job.results.push(extraction);
            job.progress.successful++;
            console.log(`✅ Extracted data for ${supplierId}`);
            
          } catch (error) {
            job.errors.push({
              supplierId,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            job.progress.failed++;
            console.error(`❌ Failed to extract data for ${supplierId}:`, error);
          } finally {
            job.progress.processed++;
          }
        });

        await Promise.all(batchPromises);
        
        // Rate limiting: wait 500ms between batches (Gemini is more generous)
        if (i + batchSize < supplierIds.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      
      console.log(`🎉 Batch extraction job ${jobId} completed:`, {
        total: job.progress.total,
        successful: job.progress.successful,
        failed: job.progress.failed
      });

    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date().toISOString();
      console.error(`❌ Batch extraction job ${jobId} failed:`, error);
    }

    return job;
  }

  /**
   * Build extraction prompt for Gemini Pro
   */
  private buildExtractionPrompt(rawData: SupplierDataExtraction['rawData']): string {
    let prompt = `You are a data extraction specialist for conservation travel suppliers. Extract structured information from the provided supplier data and return it as valid JSON.

WEBSITE CONTENT:
${rawData.websiteContent || 'Not provided'}

DESCRIPTION:
${rawData.description || 'Not provided'}

REVIEWS:
${rawData.reviews?.join('\n') || 'Not provided'}

CERTIFICATION CLAIMS:
${rawData.certificationClaims?.join('\n') || 'Not provided'}

SUSTAINABILITY STATEMENTS:
${rawData.sustainabilityStatements?.join('\n') || 'Not provided'}

Extract and return ONLY the following JSON structure (no additional text):

{
  "certifications": ["List of verified certifications mentioned (e.g., Green Globe, Rainforest Alliance, B Corp)"],
  "conservationProjects": ["Specific conservation projects or initiatives mentioned"],
  "sustainabilityPractices": ["Environmental practices and sustainability measures"],
  "communityBenefits": ["Community involvement and local benefits mentioned"],
  "financialTransparency": {
    "hasPublicFinancials": false,
    "conservationSpendingMentioned": false,
    "communityInvestmentMentioned": false
  },
  "riskFactors": ["Any concerning practices or red flags mentioned"],
  "trustIndicators": ["Positive trust signals like awards, partnerships, transparency"],
  "confidence": 0.8
}

Guidelines:
- Only include information explicitly mentioned or strongly implied
- Be conservative with certifications - only include if clearly stated
- Rate confidence 0-1 based on data quality and completeness
- Focus on factual information, not marketing language
- Include specific project names, locations, or partnerships when mentioned
- Return ONLY valid JSON, no explanatory text`;

    return prompt;
  }

  /**
   * Enhance existing supplier data with research insights
   */
  async enhanceSupplierWithResearch(
    supplierId: string,
    existingData: any,
    extractedData: SupplierDataExtraction['extractedData']
  ): Promise<any> {
    try {
      const prompt = `Based on the extracted research data, enhance this supplier profile with insights and recommendations.

EXISTING SUPPLIER DATA:
${JSON.stringify(existingData, null, 2)}

EXTRACTED RESEARCH DATA:
${JSON.stringify(extractedData, null, 2)}

Provide enhanced supplier information. Return ONLY the following JSON structure:

{
  "enhancedCertifications": ["merged list of existing and extracted certifications"],
  "conservationImpactSummary": "enhanced description of conservation impact",
  "riskAssessment": {
    "level": "low",
    "factors": ["list of risk factors"],
    "mitigationRecommendations": ["recommendations"]
  },
  "trustScoreAdjustment": {
    "recommended": 8.5,
    "reasoning": "explanation for the score"
  },
  "verificationActions": ["recommended verification steps"],
  "confidence": 0.9
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in enhancement response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error(`❌ Enhancement failed for ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Generate supplier comparison insights
   */
  async generateComparisonInsights(
    suppliers: Array<{
      id: string;
      data: any;
      extractedData: SupplierDataExtraction['extractedData'];
    }>
  ): Promise<{
    marketAnalysis: any;
    competitivePositioning: any;
    recommendations: string[];
  }> {
    try {
      const prompt = `Analyze these conservation travel suppliers and provide market insights.

SUPPLIERS DATA:
${JSON.stringify(suppliers, null, 2)}

Provide comprehensive market analysis. Return ONLY the following JSON structure:

{
  "marketAnalysis": {
    "totalSuppliers": ${suppliers.length},
    "certificationTrends": ["most common certifications"],
    "conservationFocusAreas": ["popular conservation types"],
    "riskDistribution": {"low": 0, "medium": 0, "high": 0},
    "trustScoreDistribution": {"average": 0, "range": [0, 10]}
  },
  "competitivePositioning": [
    {
      "supplierId": "id",
      "strengths": ["key strengths"],
      "weaknesses": ["areas for improvement"],
      "marketPosition": "leader",
      "differentiators": ["unique selling points"]
    }
  ],
  "recommendations": [
    "Market-level recommendations for improvement",
    "Industry trends to watch",
    "Certification opportunities"
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in comparison response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('❌ Comparison analysis failed:', error);
      throw error;
    }
  }

  /**
   * Check if Gemini API is available and configured
   */
  isAvailable(): boolean {
    return !!functions.config().gemini?.api_key;
  }

  /**
   * Get cost estimate for batch processing (Gemini is very cost-effective)
   */
  estimateBatchCost(supplierCount: number): {
    estimatedTokens: number;
    estimatedCostUSD: number;
    processingTimeMinutes: number;
  } {
    // Gemini Pro pricing: Much more cost-effective than OpenAI
    const avgTokensPerSupplier = 1500; // Conservative estimate
    const estimatedTokens = supplierCount * avgTokensPerSupplier;
    const estimatedCostUSD = (estimatedTokens / 1000) * 0.0005; // Very low cost
    const processingTimeMinutes = Math.ceil(supplierCount / 3) * 1; // 3 per batch, 1 min per batch

    return {
      estimatedTokens,
      estimatedCostUSD: Math.round(estimatedCostUSD * 100) / 100,
      processingTimeMinutes
    };
  }
}

export const dataResearchEngine = new DataResearchEngine();
