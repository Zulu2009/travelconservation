import { smartAI } from './geminiAI';
import { 
  searchSuppliers, 
  searchProjects, 
  getSuppliersByLocation,
  getTopSuppliers,
  getMetricsByCategory,
  getFactsByCategory,
  verifiedSuppliers,
  researchMetrics,
  VerifiedSupplier,
  ResearchProject,
  ResearchMetric,
  ConservationFact
} from '../data/researchDatabase';

export interface ResearchContext {
  suppliers: VerifiedSupplier[];
  projects: ResearchProject[];
  metrics: ResearchMetric[];
  facts: ConservationFact[];
}

export interface ResearchResponse {
  response: string;
  provider: string;
  researchSources: string[];
  supplierRecommendations: VerifiedSupplier[];
  metrics: ResearchMetric[];
  confidence: number;
}

class ResearchAI {
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    try {
      await smartAI.initialize();
      this.isInitialized = true;
      console.log('🔬 Research AI initialized successfully');
    } catch (error) {
      console.error('❌ Research AI initialization failed:', error);
      this.isInitialized = false;
    }
  }

  private analyzeQuery(userMessage: string): {
    keywords: string[];
    location?: string;
    type?: string;
    priceRange?: string;
    interests: string[];
  } {
    const lowerMessage = userMessage.toLowerCase();
    
    // Extract keywords
    const keywords = lowerMessage.split(' ').filter(word => word.length > 3);
    
    // Detect location mentions
    const locations = ['kenya', 'ecuador', 'galapagos', 'costa rica', 'amboseli', 'monteverde', 'australia', 'namibia'];
    const location = locations.find(loc => lowerMessage.includes(loc));
    
    // Detect conservation type
    let type: string | undefined;
    if (lowerMessage.includes('marine') || lowerMessage.includes('ocean') || lowerMessage.includes('coral')) {
      type = 'marine';
    } else if (lowerMessage.includes('elephant') || lowerMessage.includes('wildlife') || lowerMessage.includes('safari')) {
      type = 'wildlife';
    } else if (lowerMessage.includes('forest') || lowerMessage.includes('biodiversity')) {
      type = 'forest';
    }
    
    // Detect price preferences
    let priceRange: string | undefined;
    if (lowerMessage.includes('luxury') || lowerMessage.includes('high-end')) {
      priceRange = '$$$$';
    } else if (lowerMessage.includes('budget') || lowerMessage.includes('affordable')) {
      priceRange = '$';
    }
    
    // Extract interests
    const interests: string[] = [];
    if (lowerMessage.includes('research')) interests.push('research');
    if (lowerMessage.includes('luxury')) interests.push('luxury');
    if (lowerMessage.includes('community')) interests.push('community');
    if (lowerMessage.includes('education')) interests.push('education');
    
    return { keywords, location, type, priceRange, interests };
  }

  private gatherResearchContext(userMessage: string): ResearchContext {
    const analysis = this.analyzeQuery(userMessage);
    
    // Search suppliers based on query
    let suppliers: VerifiedSupplier[] = [];
    
    if (analysis.location) {
      suppliers = getSuppliersByLocation(analysis.location);
    } else {
      // Search by keywords
      for (const keyword of analysis.keywords) {
        const found = searchSuppliers(keyword);
        suppliers = [...suppliers, ...found];
      }
    }
    
    // Remove duplicates and get top suppliers
    suppliers = Array.from(new Set(suppliers.map(s => s.id)))
      .map(id => suppliers.find(s => s.id === id)!)
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, 3);
    
    // If no specific suppliers found, get top rated ones
    if (suppliers.length === 0) {
      suppliers = getTopSuppliers(3);
    }
    
    // Search projects
    let projects: ResearchProject[] = [];
    if (analysis.type) {
      projects = searchProjects('', analysis.type);
    } else {
      for (const keyword of analysis.keywords) {
        const found = searchProjects(keyword);
        projects = [...projects, ...found];
      }
    }
    projects = projects.slice(0, 2);
    
    // Get relevant metrics
    const metrics = analysis.type ? getMetricsByCategory(analysis.type) : researchMetrics.slice(0, 2);
    
    // Get relevant facts
    const facts = analysis.type ? getFactsByCategory(analysis.type) : [];
    
    return { suppliers, projects, metrics, facts };
  }

  private formatResearchPrompt(
    personaPrompt: string,
    userMessage: string,
    context: ResearchContext,
    conversationHistory: string[]
  ): string {
    const supplierData = context.suppliers.map(s => 
      `${s.name} (Trust Score: ${s.trustScore}/10, ${s.location}): ${s.specialization.join(', ')}. 
       Conservation Impact: ${s.conservationImpact.fundsRaised}, ${s.conservationImpact.projectsSupported} projects.
       ROI: ${s.roi.conservationROI}. Recent review: "${s.clientReviews.recentFeedback[0]}"`
    ).join('\n');

    const metricsData = context.metrics.map(m => 
      `${m.metric}: ${m.value} (Source: ${m.source}, Reliability: ${m.reliability})`
    ).join('\n');

    const projectData = context.projects.map(p => 
      `${p.title} in ${p.location}: ${p.description} Cost: ${p.cost}, Duration: ${p.duration}`
    ).join('\n');

    const factsData = context.facts.map(f => 
      `${f.fact} (Source: ${f.source})`
    ).join('\n');

    return `${personaPrompt}

VERIFIED RESEARCH DATA:

TOP VERIFIED SUPPLIERS:
${supplierData}

CURRENT RESEARCH METRICS:
${metricsData}

ACTIVE RESEARCH PROJECTS:
${projectData}

CONSERVATION FACTS:
${factsData}

CONVERSATION HISTORY:
${conversationHistory.slice(-4).join('\n')}

USER MESSAGE: ${userMessage}

INSTRUCTIONS:
- Use ONLY the verified data provided above in your response
- Include specific trust scores, ROI figures, and metrics
- Cite sources for all claims (e.g., "According to [Source]...")
- Recommend specific suppliers with exact data points
- Compare options using real metrics
- Be precise with numbers and dates
- Sound like a professional research consultant with access to comprehensive data

RESPONSE:`;
  }

  async generateResearchResponse(
    personaPrompt: string,
    userMessage: string,
    conversationHistory: string[] = []
  ): Promise<ResearchResponse> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Gather research context
      const context = this.gatherResearchContext(userMessage);
      
      // Format research-enhanced prompt
      const enhancedPrompt = this.formatResearchPrompt(
        personaPrompt,
        userMessage,
        context,
        conversationHistory
      );

      // Generate AI response with research context
      const { response, provider } = await smartAI.generatePersonaResponse(
        enhancedPrompt,
        userMessage,
        conversationHistory
      );

      // Extract research sources
      const researchSources = [
        ...context.metrics.map(m => m.source),
        ...context.facts.map(f => f.source),
        ...context.suppliers.map(s => `${s.name} (Verified ${s.verificationDate})`)
      ];

      // Calculate confidence based on data availability
      const confidence = Math.min(
        0.7 + (context.suppliers.length * 0.1) + (context.metrics.length * 0.05),
        1.0
      );

      return {
        response,
        provider,
        researchSources: Array.from(new Set(researchSources)),
        supplierRecommendations: context.suppliers,
        metrics: context.metrics,
        confidence
      };

    } catch (error) {
      console.error('❌ Research AI generation failed:', error);
      
      // Fallback with research data
      const context = this.gatherResearchContext(userMessage);
      const fallbackResponse = this.generateResearchFallback(userMessage, context);
      
      return {
        response: fallbackResponse,
        provider: 'Research Fallback',
        researchSources: ['TravelConservation Verified Database'],
        supplierRecommendations: context.suppliers,
        metrics: context.metrics,
        confidence: 0.6
      };
    }
  }

  private generateResearchFallback(userMessage: string, context: ResearchContext): string {
    const analysis = this.analyzeQuery(userMessage);
    
    if (context.suppliers.length > 0) {
      const topSupplier = context.suppliers[0];
      return `Based on our verified supplier database, I recommend ${topSupplier.name} in ${topSupplier.location}.

**Trust Score: ${topSupplier.trustScore}/10** - One of our highest-rated partners

**Conservation Impact:**
- ${topSupplier.conservationImpact.projectsSupported} active conservation projects
- ${topSupplier.conservationImpact.fundsRaised} raised for conservation annually
- ROI: ${topSupplier.roi.conservationROI}

**Client Feedback (${topSupplier.clientReviews.totalReviews} reviews, ${topSupplier.clientReviews.averageRating}/5):**
"${topSupplier.clientReviews.recentFeedback[0]}"

**Specialization:** ${topSupplier.specialization.join(', ')}
**Price Range:** ${topSupplier.priceRange}
**Capacity:** ${topSupplier.capacity} guests

This recommendation is based on verified data from our research database, last audited ${topSupplier.lastAudit}.

Would you like specific details about their conservation programs or pricing?`;
    }

    return `I have access to our comprehensive conservation travel database with verified suppliers, research metrics, and project data. However, I need more specific information about your interests to provide the most relevant recommendations.

Could you tell me:
- What type of conservation work interests you most? (marine, wildlife, forest)
- Your preferred destination or region?
- Your experience level and budget range?

This will help me search our verified supplier database and provide specific recommendations with trust scores, ROI data, and conservation impact metrics.`;
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  getAvailableServices(): string[] {
    const services = ['Research Database'];
    if (smartAI.isAIAvailable()) {
      services.push('Gemini AI');
    }
    return services;
  }
}

// Export singleton instance
export const researchAI = new ResearchAI();
