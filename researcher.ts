import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface SupplierInfo {
  name: string;
  website?: string;
  location: string;
  operationType: 'accommodation' | 'transport' | 'tour' | 'activity';
}

interface SustainabilityMetrics {
  carbonFootprint?: number; // kg CO2 per unit
  renewableEnergyPercent?: number;
  wasteReductionPrograms?: string[];
  localCommunitySupport?: string[];
  biodiversityImpact?: 'positive' | 'neutral' | 'negative';
  waterConservation?: boolean;
  sustainabilityScore?: number; // 1-100
}

interface CertificationInfo {
  name: string;
  issuingBody: string;
  validUntil?: Date;
  verifiedDate: Date;
  credibilityScore: number; // 1-10
}

interface ResearchMetadata {
  dataSource: string[];
  researchDate: Date;
  needsVerification: boolean;
  confidenceScore: number; // 1-100
  lastUpdated: Date;
  researchMethod: string;
}

interface SustainableTravelSupplierData {
  supplierId: string;
  researchMetadata: ResearchMetadata;
  basicInfo: {
    name: string;
    location: string;
    operationType: string;
    website?: string;
    description?: string;
  };
  sustainabilityMetrics: SustainabilityMetrics;
  certifications: CertificationInfo[];
  pricingTier: 'budget' | 'mid-range' | 'luxury';
  accessibilityFeatures: string[];
  localImpactStory?: string;
  alternativesToHighCarbon?: string[];
  seasonalConsiderations?: string[];
  userReviewsSummary?: {
    sustainabilityRating: number;
    commonPraise: string[];
    commonConcerns: string[];
  };
}

class SustainableTravelResearcher {
  private openai: OpenAI;
  private rateLimitDelay: number = 2000;
  private knownCertifications: Map<string, number>;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.initializeCertificationDatabase();
  }

  private initializeCertificationDatabase() {
    this.knownCertifications = new Map([
      ['LEED', 9],
      ['Green Key', 8],
      ['EarthCheck', 8],
      ['B Corporation', 9],
      ['Green Tourism', 7],
      ['Rainforest Alliance', 8],
      ['Fair Trade', 7],
      ['GTBS (Global Sustainable Tourism Council)', 9],
      ['ISO 14001', 8],
      ['Carbon Neutral Certification', 8],
      ['Travelife', 7],
      ['Green Globe', 6],
    ]);
  }

  async researchSupplier(supplierInfo: SupplierInfo): Promise<SustainableTravelSupplierData | null> {
    console.log(`🌱 Researching sustainable travel supplier: ${supplierInfo.name}`);
    
    try {
      // Step 1: Gather research sources
      const researchSources = await this.gatherResearchSources(supplierInfo);
      
      // Step 2: Build comprehensive research prompt
      const researchPrompt = this.buildSustainabilityResearchPrompt(supplierInfo, researchSources);
      
      // Step 3: AI analysis
      const extractedData = await this.performSustainabilityAnalysis(researchPrompt);
      
      // Step 4: Validate and enrich data
      const validatedData = await this.validateSustainabilityData(extractedData, supplierInfo);
      
      await this.delay(this.rateLimitDelay);
      return validatedData;
      
    } catch (error) {
      console.error(`❌ Research failed for ${supplierInfo.name}:`, error);
      return null;
    }
  }

  private async gatherResearchSources(supplierInfo: SupplierInfo): Promise<string[]> {
    const sources: string[] = [];
    
    try {
      // Official website content (if available)
      if (supplierInfo.website) {
        const websiteContent = await this.scrapeWebsiteContent(supplierInfo.website);
        if (websiteContent) sources.push(`Official Website: ${websiteContent}`);
      }

      // Search for sustainability reports and certifications
      const sustainabilityInfo = await this.searchSustainabilityInfo(supplierInfo);
      if (sustainabilityInfo) sources.push(`Sustainability Research: ${sustainabilityInfo}`);

      // Review sites focused on eco-travel
      const reviewData = await this.searchEcoTravelReviews(supplierInfo);
      if (reviewData) sources.push(`Eco-Travel Reviews: ${reviewData}`);

    } catch (error) {
      console.warn(`⚠️ Could not gather all sources for ${supplierInfo.name}`);
    }

    return sources;
  }

  private async scrapeWebsiteContent(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SustainableTravelBot/1.0)'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Look for sustainability-related content
      const sustainabilityKeywords = [
        'sustainability', 'sustainable', 'eco-friendly', 'carbon neutral',
        'renewable energy', 'green practices', 'environmental impact',
        'conservation', 'local community', 'responsible travel'
      ];

      let relevantContent = '';
      
      // Search in specific sections that might contain sustainability info
      $('section, div, p').each((_, element) => {
        const text = $(element).text().toLowerCase();
        if (sustainabilityKeywords.some(keyword => text.includes(keyword))) {
          relevantContent += $(element).text() + ' ';
        }
      });

      return relevantContent.slice(0, 2000); // Limit content length
    } catch (error) {
      console.warn(`Could not scrape website: ${url}`);
      return null;
    }
  }

  private async searchSustainabilityInfo(supplierInfo: SupplierInfo): Promise<string | null> {
    // In a real implementation, this would search through:
    // - B Corp directory
    // - LEED database
    // - Green Key listings
    // - Local tourism board sustainability listings
    // - Carbon offset program databases
    
    // For now, return placeholder that shows the structure
    return `Placeholder: Search results for ${supplierInfo.name} sustainability certifications and practices`;
  }

  private async searchEcoTravelReviews(supplierInfo: SupplierInfo): Promise<string | null> {
    // Would search:
    // - TripAdvisor eco-reviews
    // - Responsible Travel reviews
    // - Green Travel Media
    // - BookDifferent.com
    
    return `Placeholder: Eco-travel review aggregation for ${supplierInfo.name}`;
  }

  private buildSustainabilityResearchPrompt(supplierInfo: SupplierInfo, sources: string[]): string {
    return `
Analyze the following travel supplier for sustainability metrics and environmental impact:

SUPPLIER: ${supplierInfo.name}
LOCATION: ${supplierInfo.location}
TYPE: ${supplierInfo.operationType}

RESEARCH SOURCES:
${sources.join('\n\n')}

Please extract and analyze the following information:

1. SUSTAINABILITY METRICS:
   - Carbon footprint (estimate kg CO2 per guest/day or per trip)
   - Renewable energy usage percentage
   - Waste reduction programs
   - Water conservation efforts
   - Local community support initiatives
   - Biodiversity impact (positive/neutral/negative)

2. CERTIFICATIONS:
   - List all environmental certifications
   - Verify against known standards (LEED, Green Key, B Corp, etc.)
   - Note expiration dates if available

3. ENVIRONMENTAL IMPACT STORY:
   - How does this supplier reduce travel carbon footprint?
   - What makes them more sustainable than typical alternatives?
   - Local community benefits

4. PRACTICAL INFORMATION:
   - Price tier (budget/mid-range/luxury)
   - Accessibility features
   - Seasonal considerations for sustainability
   - What travelers should know to maximize positive impact

5. VERIFICATION NEEDS:
   - What claims need independent verification?
   - Confidence level in the data (1-100)
   - Red flags or greenwashing concerns

Return as structured JSON matching the interface requirements.
    `;
  }

  private async performSustainabilityAnalysis(prompt: string): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in sustainable travel and environmental impact assessment. Provide detailed, accurate analysis with specific metrics where possible. Be critical of greenwashing and focus on measurable impact."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      // Try to parse as JSON, fallback to structured text parsing
      try {
        return JSON.parse(content);
      } catch {
        return this.parseUnstructuredResponse(content);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    }
  }

  private parseUnstructuredResponse(content: string): any {
    // Fallback parser for when AI doesn't return valid JSON
    // This would contain logic to extract structured data from text
    return {
      needsManualReview: true,
      rawContent: content,
      extractedData: {} // Would contain parsed fields
    };
  }

  private async validateSustainabilityData(
    extractedData: any, 
    supplierInfo: SupplierInfo
  ): Promise<SustainableTravelSupplierData> {
    
    // Validate certifications against known database
    const validatedCertifications = extractedData.certifications?.map((cert: any) => ({
      ...cert,
      credibilityScore: this.knownCertifications.get(cert.name) || 5
    })) || [];

    // Calculate overall confidence score
    const confidenceScore = this.calculateConfidenceScore(extractedData);

    return {
      supplierId: this.generateSupplierId(supplierInfo),
      researchMetadata: {
        dataSource: ['AI Analysis', 'Web Scraping'],
        researchDate: new Date(),
        needsVerification: confidenceScore < 70,
        confidenceScore,
        lastUpdated: new Date(),
        researchMethod: 'automated-ai-analysis'
      },
      basicInfo: {
        name: supplierInfo.name,
        location: supplierInfo.location,
        operationType: supplierInfo.operationType,
        website: supplierInfo.website,
        description: extractedData.description
      },
      sustainabilityMetrics: extractedData.sustainabilityMetrics || {},
      certifications: validatedCertifications,
      pricingTier: extractedData.pricingTier || 'mid-range',
      accessibilityFeatures: extractedData.accessibilityFeatures || [],
      localImpactStory: extractedData.localImpactStory,
      alternativesToHighCarbon: extractedData.alternativesToHighCarbon || [],
      seasonalConsiderations: extractedData.seasonalConsiderations || [],
      userReviewsSummary: extractedData.userReviewsSummary
    };
  }

  private calculateConfidenceScore(data: any): number {
    let score = 50; // Base score
    
    // Add points for verified certifications
    if (data.certifications?.length > 0) score += 20;
    
    // Add points for specific metrics
    if (data.sustainabilityMetrics?.carbonFootprint) score += 15;
    if (data.sustainabilityMetrics?.renewableEnergyPercent) score += 10;
    
    // Subtract points for missing key data
    if (!data.sustainabilityMetrics) score -= 20;
    if (!data.localImpactStory) score -= 10;

    return Math.min(100, Math.max(10, score));
  }

  private generateSupplierId(supplierInfo: SupplierInfo): string {
    return `${supplierInfo.operationType}-${supplierInfo.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch research method for multiple suppliers
  async researchMultipleSuppliers(suppliers: SupplierInfo[]): Promise<SustainableTravelSupplierData[]> {
    const results: SustainableTravelSupplierData[] = [];
    
    console.log(`🚀 Starting batch research for ${suppliers.length} suppliers`);
    
    for (let i = 0; i < suppliers.length; i++) {
      const supplier = suppliers[i];
      console.log(`Processing ${i + 1}/${suppliers.length}: ${supplier.name}`);
      
      const result = await this.researchSupplier(supplier);
      if (result) {
        results.push(result);
      }
      
      // Progress update
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Completed ${i + 1}/${suppliers.length} suppliers`);
      }
    }
    
    return results;
  }
}

// Usage example
async function main() {
  const researcher = new SustainableTravelResearcher(process.env.OPENAI_API_KEY!);
  
  // Example suppliers to research
  const testSuppliers: SupplierInfo[] = [
    {
      name: "Patagonia Camp",
      website: "https://www.ecocamp.travel",
      location: "Torres del Paine, Chile",
      operationType: "accommodation"
    },
    {
      name: "Flixbus",
      website: "https://www.flixbus.com",
      location: "Europe",
      operationType: "transport"
    },
    {
      name: "Responsible Travel Costa Rica",
      location: "Costa Rica",
      operationType: "tour"
    }
  ];

  try {
    const results = await researcher.researchMultipleSuppliers(testSuppliers);
    
    console.log(`\n🎉 Research completed! Found data for ${results.length} suppliers`);
    
    // Save results (implement your preferred storage method)
    console.log('Sample result:', JSON.stringify(results[0], null, 2));
    
  } catch (error) {
    console.error('Research failed:', error);
  }
}

// Export for use in other modules
export { SustainableTravelResearcher, type SustainableTravelSupplierData, type SupplierInfo };