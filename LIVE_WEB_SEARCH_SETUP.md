# 🔍 **LIVE WEB SEARCH SYSTEM**
*Real-time operator discovery with Gemini AI + Google Search*

## 🎯 **WHAT I'VE BUILT FOR YOU**

Your **persona planners now have live web search capabilities**! Each persona can search the internet in real-time using their specialized expertise and custom prompts.

### **Features**:
- 🔍 **Live Google Search** - Real-time web search using Google Custom Search API
- 🤖 **Gemini Processing** - AI analyzes results using persona-specific prompts
- 🎯 **Persona Expertise** - Each persona searches with their specialized knowledge
- 📊 **Structured Results** - Operators returned with detailed analysis
- 🔄 **Fallback Systems** - Works even if APIs are unavailable

## 🚀 **HOW TO USE RIGHT NOW**

### **1. Basic Usage (Works Immediately)**
1. Go to **Persona Planner** (`http://localhost:3000/persona-planner`)
2. Select any persona (Marine Biologist, Green Beret, etc.)
3. Type your search query (e.g., "coral restoration programs in Belize")
4. Click the **🔍 Search button** (blue button next to send)
5. **Watch the persona search the web and analyze results in real-time!**

### **2. Example Searches to Try**:
- **Marine Biologist**: "coral restoration programs in Caribbean"
- **Green Beret**: "anti-poaching operations in Kenya" 
- **Luxury Curator**: "ultra-luxury eco lodges in Botswana"
- **Wildlife Documentarian**: "rare wildlife filming opportunities"
- **Adventure Scientist**: "climate research expeditions in Antarctica"

## ⚙️ **SETUP FOR FULL FUNCTIONALITY**

### **Step 1: Get Google Search API Keys**

**Option A: Quick Setup (Recommended)**
1. Go to: https://developers.google.com/custom-search/v1/introduction
2. Click **"Get a Key"** → Create/select project
3. Copy your **API key**
4. Create a **Custom Search Engine**: https://cse.google.com/cse/
5. Add domains to search (or use * for all websites)
6. Copy your **Search Engine ID**

**Option B: Detailed Setup**
```bash
# 1. Enable APIs in Google Cloud Console
- Go to: https://console.cloud.google.com/apis/dashboard
- Enable "Custom Search API"
- Create API key with restrictions (recommended)

# 2. Create Custom Search Engine
- Go to: https://cse.google.com/cse/
- Click "Add" → "Search engine"
- Add sites to search (conservation, travel, etc.)
- Get your Search Engine ID from control panel
```

### **Step 2: Add API Keys to .env**
```bash
# Add these to your .env file:
REACT_APP_SEARCH_API_KEY=your_google_search_api_key_here
REACT_APP_SEARCH_ENGINE_ID=your_custom_search_engine_id_here
```

### **Step 3: Restart Your App**
```bash
npm start
```

## 🎨 **CUSTOMIZE PERSONA PROMPTS**

### **File Location**: `src/data/personaDiscoveryPrompts.ts`

**Each persona has customizable sections**:

```typescript
{
  personaId: 'marine-biologist',
  discoveryPrompt: `You are Dr. Marina Torres, a marine biologist specializing in...`,
  searchCriteria: {
    operatorTypes: ['Marine', 'Research', 'Educational'],
    keywords: ['coral restoration', 'marine protected areas'],
    regions: ['Caribbean', 'Indo-Pacific', 'Red Sea']
  },
  scoringCriteria: {
    must_have: ['Research partnerships', 'Data collection'],
    preferred: ['University collaborations', 'Citizen science'],
    avoid: ['Captive marine mammals', 'Invasive activities']
  }
}
```

### **How to Modify Prompts**:

**1. Make Marine Biologist More Specific**:
```typescript
discoveryPrompt: `You are Dr. Marina Torres, CORAL REEF RESTORATION specialist.

SEARCH PRIORITIES:
- Coral nursery programs
- Reef monitoring expeditions  
- Marine research stations
- University partnerships ONLY

AVOID completely:
- General diving tours
- Whale watching (unless research-based)
- Aquarium visits

Focus on: Great Barrier Reef, Caribbean, Red Sea, Raja Ampat`
```

**2. Make Green Beret More Tactical**:
```typescript
discoveryPrompt: `You are Colonel Jake Morrison, ANTI-POACHING specialist.

SEARCH PRIORITIES:
- Active ranger operations
- Community conservancy employment
- Anti-poaching statistics and metrics
- Tactical training opportunities

AVOID completely:
- Luxury lodges without ranger work
- No community impact metrics
- Pure tourism without conservation work

Focus on: Kenya, Botswana, Namibia, Zimbabwe`
```

## 📊 **HOW IT WORKS TECHNICALLY**

### **Search Process**:
1. **User Input** → "coral restoration in Belize"
2. **Persona Analysis** → Marine Biologist expertise applied
3. **Query Generation** → Multiple targeted search terms created
4. **Web Search** → Google Custom Search API called
5. **AI Processing** → Gemini analyzes results using persona prompts
6. **Structured Output** → Operators with details, analysis, sources

### **Search Queries Generated** (Example for Marine Biologist):
```
- "Marine research stations conservation travel"
- "Coral restoration conservation operators Belize"
- "Marine biology field research Belize"
- "Sea turtle monitoring conservation Belize"
```

### **Fallback Systems**:
- **No API keys** → Uses demo data with persona analysis
- **API errors** → Falls back to persona knowledge base
- **No results** → Persona provides alternative suggestions

## 🔧 **TECHNICAL ARCHITECTURE**

### **Core Components**:
- **`WebSearchGemini.ts`** - Main search service
- **`PersonaChat.tsx`** - UI integration with search button
- **`personaDiscoveryPrompts.ts`** - Persona configurations
- **Google Custom Search API** - Web search provider
- **Gemini API** - AI analysis and processing

### **API Endpoints Used**:
```javascript
// Google Custom Search
https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${ENGINE_ID}&q=${query}

// Gemini AI Processing  
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

## 🎯 **WHAT EACH PERSONA SEARCHES FOR**

### **Marine Biologist**:
- Marine research stations
- Coral restoration programs
- Sea turtle monitoring
- Marine protected areas

### **Green Beret**:
- Anti-poaching operations
- Ranger training programs
- Community conservancies
- Wildlife security metrics

### **Luxury Curator**:
- Ultra-luxury eco lodges
- Exclusive conservation concessions
- Premium sustainable operators
- High-end conservation experiences

### **Wildlife Documentarian**:
- Rare wildlife filming opportunities
- Documentary-friendly operators
- Wildlife behavior research
- Unique ecosystem access

### **Adventure Scientist**:
- Climate research expeditions
- Extreme environment studies
- Citizen science programs
- Adventure-based research

## ✅ **SUCCESS INDICATORS**

### **When Working Correctly**:
- 🔍 **Search button appears** next to send button
- ⏳ **"Searching the web..." indicator** shows while processing
- 📋 **Structured results** with operator names, locations, details
- 🎯 **Persona-specific analysis** and recommendations
- 📊 **Source attribution** showing websites searched

### **Example Successful Output**:
```
I've just searched the web for "coral restoration Belize" using my marine biology expertise!

Based on my analysis of current research programs...

🎯 Found 3 Operators:

1. **Fragments of Hope Belize**
📍 Location: Belize Barrier Reef
🎯 Specialization: Coral nursery and restoration
🌱 Conservation Impact: 50,000+ coral fragments planted
💡 Why I recommend: University of Belize partnership
🔗 Contact: fragmentsofhope.org
⭐ Confidence: 9/10
```

## 🚨 **TROUBLESHOOTING**

### **No Search Button?**
- Check if `SearchIcon` is imported correctly
- Verify `WebSearchGemini` service is imported
- Restart development server

### **Search Fails?**
- Add API keys to `.env` file
- Check Google Cloud Console for API quotas
- Verify Custom Search Engine is configured

### **No Results?**
- Try different search terms
- Check if Custom Search Engine includes relevant sites
- Review persona prompts for specificity

## 🎉 **READY TO USE!**

**Your personas now have live web search!** 

1. **Start app**: `npm start`
2. **Go to Persona Planner**: `/persona-planner` 
3. **Pick a persona** and start searching
4. **Click the blue search button** for live web results
5. **Watch your personas find real operators in real-time!**

The system works immediately with fallback data, and becomes even more powerful when you add the Google Search API keys!
