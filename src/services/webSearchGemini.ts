import { PersonaDiscoveryEngine } from '../data/personaDiscoveryPrompts';

// Live Web Search with Gemini for Persona Planners
export class WebSearchGemini {
  private static readonly SEARCH_API_KEY = process.env.REACT_APP_SEARCH_API_KEY;
  private static readonly SEARCH_ENGINE_ID = process.env.REACT_APP_SEARCH_ENGINE_ID;
  private static readonly GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  // Search the web and process with Gemini
  static async searchWithPersona(
    personaId: string, 
    userQuery: string,
    searchTerms?: string[]
  ): Promise<{
    success: boolean;
    operators: any[];
    sources: string[];
    summary: string;
    error?: string;
  }> {
    try {
      console.log(`🔍 Starting web search for persona: ${personaId}`);
      
      // Get persona-specific search configuration
      const config = PersonaDiscoveryEngine.getDiscoveryConfig(personaId);
      if (!config) {
        throw new Error(`Persona configuration not found: ${personaId}`);
      }

      // Generate search terms based on persona and user query
      const searchQueries = this.generateSearchQueries(config, userQuery, searchTerms);
      
      // Search the web for each query
      const searchResults = await this.performWebSearches(searchQueries);
      
      // Process results with Gemini using persona prompts
      const processedResults = await this.processWithGemini(config, userQuery, searchResults);
      
      return {
        success: true,
        operators: processedResults.operators,
        sources: processedResults.sources,
        summary: processedResults.summary
      };

    } catch (error: any) {
      console.error('❌ Web search failed:', error);
      return {
        success: false,
        operators: [],
        sources: [],
        summary: 'Web search failed',
        error: error.message
      };
    }
  }

  // Generate search queries based on persona expertise
  private static generateSearchQueries(config: any, userQuery: string, customTerms?: string[]): string[] {
    const baseQueries = [
      `"${config.searchCriteria.operatorTypes.join('" OR "')}" conservation travel operators`,
      `${config.searchCriteria.keywords.join(' OR ')} conservation tourism`,
      `${userQuery} conservation travel operators`,
      `${config.searchCriteria.regions.join(' OR ')} conservation tourism operators`
    ];

    // Add custom search terms if provided
    if (customTerms) {
      customTerms.forEach(term => {
        baseQueries.push(`"${term}" conservation travel operators`);
      });
    }

    // Persona-specific searches
    switch (config.personaId) {
      case 'marine-biologist':
        baseQueries.push(
          'marine research stations conservation travel',
          'coral restoration conservation operators',
          'sea turtle monitoring conservation travel',
          'marine biology field research operators'
        );
        break;
      
      case 'green-beret':
        baseQueries.push(
          'anti-poaching conservation operators',
          'ranger training conservation travel',
          'wildlife security conservation operators',
          'community conservancy operators'
        );
        break;
      
      case 'luxury-curator':
        baseQueries.push(
          'ultra luxury eco lodges conservation',
          'exclusive conservation travel operators',
          'premium sustainable tourism operators',
          'luxury conservation concessions'
        );
        break;
      
      case 'wildlife-documentarian':
        baseQueries.push(
          'wildlife filming conservation operators',
          'rare wildlife conservation travel',
          'documentary conservation tourism',
          'wildlife research conservation operators'
        );
        break;
      
      case 'adventure-scientist':
        baseQueries.push(
          'extreme environment conservation research',
          'climate research conservation travel',
          'adventure science conservation operators',
          'remote conservation research expeditions'
        );
        break;
    }

    return baseQueries.slice(0, 8); // Limit to 8 searches to avoid rate limits
  }

  // Perform web searches using Google Custom Search API
  private static async performWebSearches(queries: string[]): Promise<any[]> {
    const allResults: any[] = [];

    for (const query of queries) {
      try {
        console.log(`🔍 Searching: ${query}`);
        
        // Use Google Custom Search API (or fallback to scraping)
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.SEARCH_API_KEY}&cx=${this.SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=10`;
        
        const response = await fetch(searchUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.items) {
            allResults.push(...data.items.map((item: any) => ({
              title: item.title,
              snippet: item.snippet,
              link: item.link,
              displayLink: item.displayLink,
              query: query
            })));
          }
        } else {
          console.warn(`⚠️ Search failed for: ${query}`);
          // Fallback: Use alternative search method
          const fallbackResults = await this.fallbackSearch(query);
          allResults.push(...fallbackResults);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Search error for "${query}":`, error);
      }
    }

    return allResults;
  }

  // Fallback search method (when Google API unavailable)
  private static async fallbackSearch(query: string): Promise<any[]> {
    try {
      // Use DuckDuckGo or other search engines as fallback
      console.log(`🔄 Using fallback search for: ${query}`);
      
      // Return mock results for demo (replace with actual fallback implementation)
      return [
        {
          title: `Conservation Operator - ${query}`,
          snippet: `Premium conservation travel operator specializing in ${query}`,
          link: `https://example.com/search/${encodeURIComponent(query)}`,
          displayLink: 'example.com',
          query: query
        }
      ];
    } catch (error) {
      console.error('❌ Fallback search failed:', error);
      return [];
    }
  }

  // Process search results with Gemini using persona prompts
  private static async processWithGemini(
    config: any, 
    userQuery: string, 
    searchResults: any[]
  ): Promise<{
    operators: any[];
    sources: string[];
    summary: string;
  }> {
    try {
      console.log(`🤖 Processing ${searchResults.length} results with Gemini`);

      // Prepare context from search results
      const searchContext = searchResults.map(result => 
        `SOURCE: ${result.displayLink}
TITLE: ${result.title}
DESCRIPTION: ${result.snippet}
URL: ${result.link}
SEARCH_QUERY: ${result.query}
---`
      ).join('\n');

      // Create Gemini prompt using persona configuration
      const geminiPrompt = `${config.discoveryPrompt}

USER REQUEST: "${userQuery}"

WEB SEARCH RESULTS:
${searchContext}

INSTRUCTIONS:
Based on the web search results above and my expertise as ${config.personaId}, analyze and extract REAL conservation travel operators that match my specialty.

For each operator found, provide:
1. **Operator Name**: Exact company/organization name
2. **Location**: Specific location/region
3. **Specialization**: What they offer that matches my expertise
4. **Conservation Impact**: Specific conservation work they do
5. **Contact/Website**: How to reach them
6. **Why Recommended**: Why this matches the user's request and my expertise
7. **Source**: Which search result this came from

REQUIREMENTS:
- Only include REAL operators (no generic recommendations)
- Focus on operators that match my ${config.searchCriteria.operatorTypes.join('/')} specialization
- Prioritize: ${config.scoringCriteria.must_have.join(', ')}
- Avoid: ${config.scoringCriteria.avoid.join(', ')}

FORMAT AS JSON:
{
  "operators": [
    {
      "name": "Operator Name",
      "location": "Location",
      "specialization": "What they offer",
      "conservation_impact": "Conservation work details", 
      "contact": "Website/contact info",
      "why_recommended": "Why this matches",
      "source_url": "Original search result URL",
      "confidence_score": 1-10
    }
  ],
  "summary": "Brief summary of findings as persona character",
  "total_found": 0
}`;

      // Call Gemini API
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: geminiPrompt
            }]
          }]
        })
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        
        return {
          operators: parsedResponse.operators || [],
          sources: Array.from(new Set(searchResults.map(r => r.displayLink))),
          summary: parsedResponse.summary || 'Analysis complete'
        };
      } else {
        // Fallback: Parse unstructured response
        return {
          operators: this.parseUnstructuredResponse(responseText),
          sources: Array.from(new Set(searchResults.map(r => r.displayLink))),
          summary: responseText.substring(0, 200) + '...'
        };
      }

    } catch (error) {
      console.error('❌ Gemini processing failed:', error);
      
      // Fallback: Return raw search results formatted as operators
      return {
        operators: this.formatRawResults(searchResults),
        sources: Array.from(new Set(searchResults.map(r => r.displayLink))),
        summary: 'Analysis completed with limited processing due to API issues'
      };
    }
  }

  // Parse unstructured Gemini response
  private static parseUnstructuredResponse(responseText: string): any[] {
    const operators: any[] = [];
    
    // Simple parsing logic for unstructured responses
    const lines = responseText.split('\n');
    let currentOperator: any = {};
    
    for (const line of lines) {
      if (line.includes('**') || line.includes('##')) {
        if (currentOperator.name) {
          operators.push(currentOperator);
          currentOperator = {};
        }
        currentOperator.name = line.replace(/[*#]/g, '').trim();
      } else if (line.toLowerCase().includes('location:')) {
        currentOperator.location = line.split(':')[1]?.trim() || '';
      } else if (line.toLowerCase().includes('website:') || line.includes('http')) {
        currentOperator.contact = line.split(':')[1]?.trim() || line.trim();
      }
    }
    
    if (currentOperator.name) {
      operators.push(currentOperator);
    }
    
    return operators.slice(0, 10); // Limit results
  }

  // Format raw search results as operators (fallback)
  private static formatRawResults(searchResults: any[]): any[] {
    return searchResults.slice(0, 10).map(result => ({
      name: result.title,
      location: 'Location from web search',
      specialization: result.snippet,
      conservation_impact: 'Conservation details from search',
      contact: result.link,
      why_recommended: 'Found through web search',
      source_url: result.link,
      confidence_score: 7
    }));
  }
}
