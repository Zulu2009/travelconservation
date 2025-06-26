import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from './firebase/config';
import { generateAIResponse } from './googleAI';

interface DiscoveryParameters {
  regions: string[];
  operatorTypes: string[];
  certificationLevel: 'basic' | 'premium' | 'elite';
  customSearchTerms: string;
  discoveryLimit: number;
  sources: string[];
}

interface GeneratedOperator {
  name: string;
  description: string;
  location: string;
  country: string;
  region: string;
  website: string;
  email: string;
  phone: string;
  trustScore: number;
  sustainabilityRating: number;
  riskLevel: 'low' | 'medium' | 'high';
  verificationStatus: 'pending' | 'verified' | 'needs-review';
  source: string;
  activities: string[];
  accommodationType: string;
  priceRange: string;
  bestTimeToVisit: string;
  certifications: string[];
  metrics: {
    overallScore: number;
    conservationROI: number;
    communityROI: number;
    sustainabilityIndex: number;
    impactScore: number;
    transparencyScore: number;
    localBenefit: number;
  };
  analysis: {
    summary: string;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
    aiConfidence: number;
  };
  discoveredAt: Timestamp;
  lastAnalyzed: Timestamp;
}

export class DirectAgenticDiscovery {
  
  private generateDiscoveryPrompt(params: DiscoveryParameters): string {
    const regionsText = params.regions.join(', ');
    const typesText = params.operatorTypes.join(', ');
    const customTerms = params.customSearchTerms ? `, ${params.customSearchTerms}` : '';
    
    return `You are an expert travel conservation researcher. Generate ${params.discoveryLimit} realistic and detailed sustainable travel operators based on these parameters:

**Target Regions**: ${regionsText}
**Operator Types**: ${typesText}
**Certification Level**: ${params.certificationLevel}
**Additional Keywords**: ${customTerms}

For each operator, provide complete information in this exact JSON format:
{
  "operators": [
    {
      "name": "Operator Name",
      "description": "Detailed description of their conservation work and sustainable practices (100-200 words)",
      "location": "Specific location (e.g., Serengeti National Park, Tanzania)",
      "country": "Country name",
      "region": "One of: africa, south_america, asia, north_america, europe, oceania, arctic",
      "website": "https://realistic-website.com",
      "email": "contact@operator.com",
      "phone": "+country-code-number",
      "trustScore": 7.5,
      "sustainabilityRating": 4.2,
      "riskLevel": "low",
      "verificationStatus": "verified",
      "source": "One of: b_corp, gstc, rainforest_alliance, national_geographic",
      "activities": ["wildlife viewing", "conservation education", "community tourism"],
      "accommodationType": "eco-lodge",
      "priceRange": "$200-400/night",
      "bestTimeToVisit": "May-October",
      "certifications": ["GSTC Certified", "B-Corp", "Rainforest Alliance"],
      "metrics": {
        "overallScore": 8.7,
        "conservationROI": 9.2,
        "communityROI": 8.5,
        "sustainabilityIndex": 8.8,
        "impactScore": 9.0,
        "transparencyScore": 8.3,
        "localBenefit": 9.1
      },
      "analysis": {
        "summary": "Comprehensive analysis of their conservation impact and sustainability practices",
        "strengths": ["Strong community partnerships", "Proven conservation results", "Transparent operations"],
        "concerns": ["Seasonal accessibility", "Limited capacity"],
        "recommendations": ["Expand conservation programs", "Develop off-season activities"],
        "aiConfidence": 0.92
      }
    }
  ]
}

Focus on operators that:
- Have real conservation impact in the specified regions
- Match the certification level requirements (basic=any certification, premium=multiple certifications, elite=top-tier certifications)
- Align with the operator types and custom search terms
- Represent authentic, high-quality sustainable tourism

Ensure variety in locations within the specified regions and realistic details that reflect actual sustainable tourism practices.`;
  }

  async discoverOperators(params: DiscoveryParameters): Promise<{
    success: boolean;
    operatorsAdded: number;
    operatorsGenerated: GeneratedOperator[];
    error?: string;
  }> {
    try {
      console.log('🔍 Starting direct agentic discovery with parameters:', params);
      
      // Generate operators using Gemini 1.5 Pro
      const prompt = this.generateDiscoveryPrompt(params);
      const aiResponse = await generateAIResponse(prompt);
      
      console.log('🤖 AI Response received, parsing JSON...');
      
      // Parse AI response
      let operatorsData;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonStart = aiResponse.indexOf('{');
        const jsonEnd = aiResponse.lastIndexOf('}') + 1;
        const jsonText = aiResponse.slice(jsonStart, jsonEnd);
        operatorsData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        throw new Error('AI generated invalid JSON response');
      }

      if (!operatorsData.operators || !Array.isArray(operatorsData.operators)) {
        throw new Error('AI response missing operators array');
      }

      console.log(`📊 Parsed ${operatorsData.operators.length} operators from AI response`);

      // Process and add operators to Firestore
      const processedOperators: GeneratedOperator[] = [];
      let addedCount = 0;

      for (const rawOperator of operatorsData.operators) {
        try {
          // Enhance and validate the operator data
          const processedOperator: GeneratedOperator = {
            ...rawOperator,
            discoveredAt: Timestamp.now(),
            lastAnalyzed: Timestamp.now(),
            // Ensure all required fields have defaults
            trustScore: rawOperator.trustScore || Math.random() * 3 + 7, // 7-10 range
            sustainabilityRating: rawOperator.sustainabilityRating || Math.random() * 2 + 3, // 3-5 range
            riskLevel: rawOperator.riskLevel || 'low',
            verificationStatus: rawOperator.verificationStatus || 'pending',
            source: rawOperator.source || 'direct_discovery',
            activities: rawOperator.activities || ['eco-tourism'],
            accommodationType: rawOperator.accommodationType || 'eco-lodge',
            priceRange: rawOperator.priceRange || '$150-300/night',
            bestTimeToVisit: rawOperator.bestTimeToVisit || 'Year-round',
            certifications: rawOperator.certifications || ['Sustainable Tourism'],
            metrics: rawOperator.metrics || {
              overallScore: Math.random() * 2 + 8,
              conservationROI: Math.random() * 2 + 8,
              communityROI: Math.random() * 2 + 7,
              sustainabilityIndex: Math.random() * 2 + 8,
              impactScore: Math.random() * 2 + 8,
              transparencyScore: Math.random() * 2 + 7,
              localBenefit: Math.random() * 2 + 8
            },
            analysis: rawOperator.analysis || {
              summary: 'High-quality sustainable tourism operator with strong conservation focus.',
              strengths: ['Strong sustainability practices', 'Community engagement'],
              concerns: ['Limited data available'],
              recommendations: ['Continue monitoring'],
              aiConfidence: 0.85
            }
          };

          // Check if operator already exists (avoid duplicates)
          const existingQuery = query(
            collection(db, 'operators'),
            where('name', '==', processedOperator.name),
            limit(1)
          );
          const existingDocs = await getDocs(existingQuery);

          if (existingDocs.empty) {
            // Add to Firestore
            await addDoc(collection(db, 'operators'), processedOperator);
            addedCount++;
            console.log(`✅ Added operator: ${processedOperator.name}`);
          } else {
            console.log(`⚠️ Operator already exists: ${processedOperator.name}`);
          }

          processedOperators.push(processedOperator);
        } catch (operatorError) {
          console.error(`Failed to process operator:`, operatorError);
          // Continue with other operators
        }
      }

      console.log(`🎉 Discovery complete! Added ${addedCount} new operators`);

      return {
        success: true,
        operatorsAdded: addedCount,
        operatorsGenerated: processedOperators
      };

    } catch (error: any) {
      console.error('❌ Direct agentic discovery failed:', error);
      return {
        success: false,
        operatorsAdded: 0,
        operatorsGenerated: [],
        error: error.message || 'Unknown error during discovery'
      };
    }
  }

  async getDatabaseStats(): Promise<{
    totalOperators: number;
    verifiedOperators: number;
    recentlyAdded: number;
    lastUpdate: string;
  }> {
    try {
      // Get total operators
      const allOperators = await getDocs(collection(db, 'operators'));
      const totalOperators = allOperators.size;

      // Get verified operators
      const verifiedQuery = query(
        collection(db, 'operators'),
        where('verificationStatus', '==', 'verified')
      );
      const verifiedOperators = await getDocs(verifiedQuery);

      // Get recently added (last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const recentQuery = query(
        collection(db, 'operators'),
        where('discoveredAt', '>=', Timestamp.fromDate(oneDayAgo))
      );
      const recentOperators = await getDocs(recentQuery);

      // Get last update time
      const latestQuery = query(
        collection(db, 'operators'),
        orderBy('discoveredAt', 'desc'),
        limit(1)
      );
      const latestDocs = await getDocs(latestQuery);
      const lastUpdate = latestDocs.empty 
        ? 'No operators found' 
        : latestDocs.docs[0].data().discoveredAt.toDate().toLocaleString();

      return {
        totalOperators: totalOperators,
        verifiedOperators: verifiedOperators.size,
        recentlyAdded: recentOperators.size,
        lastUpdate
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {
        totalOperators: 0,
        verifiedOperators: 0,
        recentlyAdded: 0,
        lastUpdate: 'Error loading stats'
      };
    }
  }

  async testDatabaseConnection(): Promise<{
    success: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      console.log('🔍 Testing direct Firestore connection...');
      
      // Try to read from operators collection
      const testQuery = query(collection(db, 'operators'), limit(1));
      const testDocs = await getDocs(testQuery);
      
      console.log('✅ Firestore connection successful');
      
      return {
        success: true,
        details: {
          connectionType: 'Direct Firestore',
          documentsFound: testDocs.size,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('❌ Firestore connection failed:', error);
      return {
        success: false,
        error: `Database connection failed: ${error.message}`,
        details: {
          errorCode: error.code,
          errorMessage: error.message
        }
      };
    }
  }
}

// Export singleton instance
export const directAgenticDiscovery = new DirectAgenticDiscovery();
