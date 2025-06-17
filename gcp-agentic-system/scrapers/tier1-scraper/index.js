const express = require('express');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const winston = require('winston');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

// Tier 1 scraping configuration - Premium operators
const TIER1_SCRAPING_CONFIG = {
  timeout: 30000, // 30 seconds
  waitForSelector: 3000,
  maxRetries: 3,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  
  // Premium operator specific selectors
  selectors: {
    sustainability: [
      '[data-testid*="sustainability"]',
      '.sustainability',
      '.conservation',
      '.environmental',
      '.carbon',
      '.impact',
      '#sustainability',
      '#conservation'
    ],
    certifications: [
      '.certification',
      '.accreditation',
      '.award',
      '.badge',
      '[data-testid*="certification"]',
      '.b-corp',
      '.gstc'
    ],
    partnerships: [
      '.partnership',
      '.collaboration',
      '.research',
      '.university',
      '.government',
      '[data-testid*="partner"]'
    ],
    reports: [
      'a[href*="report"]',
      'a[href*="impact"]',
      'a[href*="sustainability"]',
      'a[href*=".pdf"]',
      '.annual-report',
      '.impact-report'
    ],
    contact: [
      '.contact',
      '.about',
      '.team',
      '[data-testid*="contact"]'
    ]
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'tier1-scraper',
    timestamp: new Date().toISOString()
  });
});

// Main scraping endpoint
app.post('/scrape', rateLimitMiddleware, async (req, res) => {
  const startTime = Date.now();
  let browser = null;
  
  try {
    const { operator_id, operator_url, tier, priority, task_id } = req.body;
    
    if (!operator_id || !operator_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: operator_id, operator_url'
      });
    }
    
    logger.info(`🔍 Starting Tier 1 scraping for ${operator_id}`, {
      operator_id,
      operator_url,
      task_id
    });
    
    // Update task status to processing
    await updateTaskStatus(task_id, 'processing');
    
    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: TIER1_SCRAPING_CONFIG.userAgent,
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Set timeouts
    page.setDefaultTimeout(TIER1_SCRAPING_CONFIG.timeout);
    page.setDefaultNavigationTimeout(TIER1_SCRAPING_CONFIG.timeout);
    
    // Perform comprehensive scraping
    const scrapedData = await performTier1Scraping(page, operator_url, operator_id);
    
    // Close browser
    await browser.close();
    browser = null;
    
    const processingTime = Date.now() - startTime;
    
    logger.info(`✅ Tier 1 scraping completed for ${operator_id}`, {
      operator_id,
      processing_time_ms: processingTime,
      data_points: Object.keys(scrapedData).length
    });
    
    // Update task status to completed
    await updateTaskStatus(task_id, 'completed', scrapedData);
    
    res.json({
      success: true,
      operator_id,
      task_id,
      scraped_data: scrapedData,
      processing_time_ms: processingTime,
      data_quality: assessDataQuality(scrapedData)
    });
    
  } catch (error) {
    logger.error(`❌ Tier 1 scraping failed for ${req.body.operator_id}`, {
      error: error.message,
      stack: error.stack,
      operator_id: req.body.operator_id
    });
    
    // Clean up browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        logger.error('Error closing browser:', closeError);
      }
    }
    
    // Update task status to failed
    if (req.body.task_id) {
      await updateTaskStatus(req.body.task_id, 'failed', null, error.message);
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      operator_id: req.body.operator_id
    });
  }
});

/**
 * Perform comprehensive Tier 1 scraping for premium operators
 */
async function performTier1Scraping(page, url, operatorId) {
  const scrapedData = {
    operator_id: operatorId,
    url: url,
    scraped_at: new Date().toISOString(),
    tier: 'tier1'
  };
  
  try {
    // Navigate to main page
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Extract basic information
    scrapedData.basic_info = await extractBasicInfo(page);
    
    // Extract sustainability information
    scrapedData.sustainability = await extractSustainabilityInfo(page);
    
    // Extract certifications and awards
    scrapedData.certifications = await extractCertifications(page);
    
    // Extract partnerships and collaborations
    scrapedData.partnerships = await extractPartnerships(page);
    
    // Find and download reports
    scrapedData.reports = await extractReports(page);
    
    // Extract contact and team information
    scrapedData.contact_info = await extractContactInfo(page);
    
    // Extract social media presence
    scrapedData.social_media = await extractSocialMedia(page);
    
    // Perform deep content analysis
    scrapedData.content_analysis = await performContentAnalysis(page);
    
    // Check for red flags
    scrapedData.red_flags = await checkRedFlags(page);
    
    logger.info(`📊 Tier 1 data extraction completed for ${operatorId}`, {
      sections_extracted: Object.keys(scrapedData).length
    });
    
  } catch (error) {
    logger.error(`Error in Tier 1 scraping for ${operatorId}:`, error);
    scrapedData.scraping_error = error.message;
  }
  
  return scrapedData;
}

/**
 * Extract basic operator information
 */
async function extractBasicInfo(page) {
  try {
    return await page.evaluate(() => {
      const info = {};
      
      // Company name
      info.company_name = document.title || 
        document.querySelector('h1')?.textContent?.trim() ||
        document.querySelector('.company-name')?.textContent?.trim();
      
      // Description/About
      const aboutSelectors = ['.about', '.description', '.overview', '#about'];
      for (const selector of aboutSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          info.description = element.textContent?.trim();
          break;
        }
      }
      
      // Location information
      const locationSelectors = ['.location', '.address', '.headquarters'];
      for (const selector of locationSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          info.location = element.textContent?.trim();
          break;
        }
      }
      
      // Founded/established date
      const foundedText = document.body.textContent;
      const foundedMatch = foundedText.match(/(?:founded|established|since)\s+(\d{4})/i);
      if (foundedMatch) {
        info.founded_year = foundedMatch[1];
      }
      
      return info;
    });
  } catch (error) {
    logger.error('Error extracting basic info:', error);
    return {};
  }
}

/**
 * Extract sustainability and conservation information
 */
async function extractSustainabilityInfo(page) {
  try {
    const sustainability = {};
    
    // Look for sustainability pages/sections
    const sustainabilityLinks = await page.$$eval('a', links => 
      links.filter(link => 
        /sustainability|conservation|environmental|impact|carbon/i.test(link.textContent || link.href)
      ).map(link => ({ text: link.textContent?.trim(), href: link.href }))
    );
    
    sustainability.sustainability_links = sustainabilityLinks;
    
    // Extract sustainability content from current page
    sustainability.sustainability_content = await page.evaluate(() => {
      const selectors = [
        '.sustainability', '.conservation', '.environmental', 
        '.carbon', '.impact', '#sustainability', '#conservation'
      ];
      
      const content = [];
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el.textContent?.trim()) {
            content.push(el.textContent.trim());
          }
        });
      }
      
      return content;
    });
    
    // Look for carbon-related information
    sustainability.carbon_info = await page.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      const carbonKeywords = [
        'carbon neutral', 'carbon negative', 'carbon footprint',
        'scope 1', 'scope 2', 'scope 3', 'net zero', 'carbon offset'
      ];
      
      return carbonKeywords.filter(keyword => text.includes(keyword));
    });
    
    return sustainability;
  } catch (error) {
    logger.error('Error extracting sustainability info:', error);
    return {};
  }
}

/**
 * Extract certifications and awards
 */
async function extractCertifications(page) {
  try {
    return await page.evaluate(() => {
      const certifications = [];
      
      // Look for certification badges/images
      const certImages = document.querySelectorAll('img');
      certImages.forEach(img => {
        const alt = img.alt?.toLowerCase() || '';
        const src = img.src?.toLowerCase() || '';
        
        if (alt.includes('certification') || alt.includes('certified') || 
            alt.includes('b-corp') || alt.includes('gstc') ||
            src.includes('certification') || src.includes('badge')) {
          certifications.push({
            type: 'image',
            alt: img.alt,
            src: img.src
          });
        }
      });
      
      // Look for certification text
      const text = document.body.textContent.toLowerCase();
      const certKeywords = [
        'b-corporation', 'b corp', 'gstc certified', 'rainforest alliance',
        'fair trade', 'iso 14001', 'leed certified', 'green key'
      ];
      
      const foundCerts = certKeywords.filter(keyword => text.includes(keyword));
      foundCerts.forEach(cert => {
        certifications.push({
          type: 'text',
          certification: cert
        });
      });
      
      return certifications;
    });
  } catch (error) {
    logger.error('Error extracting certifications:', error);
    return [];
  }
}

/**
 * Extract partnerships and collaborations
 */
async function extractPartnerships(page) {
  try {
    return await page.evaluate(() => {
      const partnerships = [];
      
      // Look for partner logos/mentions
      const partnerSelectors = ['.partners', '.collaboration', '.research'];
      partnerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el.textContent?.trim()) {
            partnerships.push({
              type: 'section',
              content: el.textContent.trim()
            });
          }
        });
      });
      
      // Look for university/research partnerships
      const text = document.body.textContent.toLowerCase();
      const partnerKeywords = [
        'university partnership', 'research collaboration', 
        'national geographic', 'smithsonian', 'wwf', 'conservation international'
      ];
      
      const foundPartnerships = partnerKeywords.filter(keyword => text.includes(keyword));
      foundPartnerships.forEach(partnership => {
        partnerships.push({
          type: 'keyword',
          partnership: partnership
        });
      });
      
      return partnerships;
    });
  } catch (error) {
    logger.error('Error extracting partnerships:', error);
    return [];
  }
}

/**
 * Extract reports and documents
 */
async function extractReports(page) {
  try {
    const reports = await page.$$eval('a[href*=".pdf"], a[href*="report"], a[href*="impact"]', links =>
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.href,
        type: link.href.includes('.pdf') ? 'pdf' : 'page'
      }))
    );
    
    // Try to download and analyze key reports (limit to prevent timeout)
    const keyReports = reports.filter(report => 
      /sustainability|impact|annual|conservation/i.test(report.text || '')
    ).slice(0, 3);
    
    for (const report of keyReports) {
      if (report.type === 'pdf') {
        try {
          const response = await axios.get(report.href, { 
            responseType: 'arraybuffer',
            timeout: 10000 
          });
          const pdfData = await pdfParse(response.data);
          report.content_preview = pdfData.text.substring(0, 1000);
        } catch (pdfError) {
          logger.warn(`Could not download PDF: ${report.href}`, pdfError.message);
        }
      }
    }
    
    return reports;
  } catch (error) {
    logger.error('Error extracting reports:', error);
    return [];
  }
}

/**
 * Extract contact and team information
 */
async function extractContactInfo(page) {
  try {
    return await page.evaluate(() => {
      const contact = {};
      
      // Email addresses
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = document.body.textContent.match(emailRegex) || [];
      contact.emails = [...new Set(emails)];
      
      // Phone numbers
      const phoneRegex = /[\+]?[1-9]?[\-\.\s]?\(?[0-9]{3}\)?[\-\.\s]?[0-9]{3}[\-\.\s]?[0-9]{4}/g;
      const phones = document.body.textContent.match(phoneRegex) || [];
      contact.phones = [...new Set(phones)];
      
      // Team/leadership information
      const teamSelectors = ['.team', '.leadership', '.management', '.founders'];
      const teamInfo = [];
      teamSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el.textContent?.trim()) {
            teamInfo.push(el.textContent.trim());
          }
        });
      });
      contact.team_info = teamInfo;
      
      return contact;
    });
  } catch (error) {
    logger.error('Error extracting contact info:', error);
    return {};
  }
}

/**
 * Extract social media presence
 */
async function extractSocialMedia(page) {
  try {
    return await page.$$eval('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"], a[href*="youtube"]', links =>
      links.map(link => ({
        platform: link.href.includes('facebook') ? 'facebook' :
                 link.href.includes('twitter') ? 'twitter' :
                 link.href.includes('instagram') ? 'instagram' :
                 link.href.includes('linkedin') ? 'linkedin' :
                 link.href.includes('youtube') ? 'youtube' : 'other',
        url: link.href
      }))
    );
  } catch (error) {
    logger.error('Error extracting social media:', error);
    return [];
  }
}

/**
 * Perform deep content analysis
 */
async function performContentAnalysis(page) {
  try {
    return await page.evaluate(() => {
      const analysis = {};
      
      // Word count and content depth
      const textContent = document.body.textContent || '';
      analysis.word_count = textContent.split(/\s+/).length;
      analysis.content_length = textContent.length;
      
      // Sustainability keyword density
      const sustainabilityKeywords = [
        'sustainable', 'conservation', 'environmental', 'eco-friendly',
        'carbon', 'renewable', 'biodiversity', 'ecosystem', 'wildlife'
      ];
      
      const keywordCounts = {};
      sustainabilityKeywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = textContent.match(regex) || [];
        keywordCounts[keyword] = matches.length;
      });
      
      analysis.sustainability_keywords = keywordCounts;
      
      // Page structure analysis
      analysis.structure = {
        headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        images: document.querySelectorAll('img').length,
        links: document.querySelectorAll('a').length,
        forms: document.querySelectorAll('form').length
      };
      
      return analysis;
    });
  } catch (error) {
    logger.error('Error in content analysis:', error);
    return {};
  }
}

/**
 * Check for red flags
 */
async function checkRedFlags(page) {
  try {
    return await page.evaluate(() => {
      const redFlags = [];
      const text = document.body.textContent.toLowerCase();
      
      // Animal exploitation red flags
      const animalFlags = [
        'elephant ride', 'elephant riding', 'captive wildlife', 
        'dolphin encounter', 'tiger selfie', 'wildlife petting'
      ];
      
      animalFlags.forEach(flag => {
        if (text.includes(flag)) {
          redFlags.push({
            category: 'animal_exploitation',
            flag: flag,
            severity: 'high'
          });
        }
      });
      
      // Greenwashing indicators
      const greenwashingFlags = [
        'eco-friendly' // without specific evidence
      ];
      
      // Check for vague sustainability claims
      if (text.includes('eco-friendly') && 
          !text.includes('certified') && 
          !text.includes('verified')) {
        redFlags.push({
          category: 'greenwashing',
          flag: 'vague eco-friendly claims',
          severity: 'medium'
        });
      }
      
      // Overtourism indicators
      const overtourismFlags = [
        'mass tourism', 'large groups', 'bus tours'
      ];
      
      overtourismFlags.forEach(flag => {
        if (text.includes(flag)) {
          redFlags.push({
            category: 'overtourism',
            flag: flag,
            severity: 'medium'
          });
        }
      });
      
      return redFlags;
    });
  } catch (error) {
    logger.error('Error checking red flags:', error);
    return [];
  }
}

/**
 * Assess data quality of scraped information
 */
function assessDataQuality(scrapedData) {
  let score = 0;
  let maxScore = 0;
  
  // Basic info quality
  maxScore += 20;
  if (scrapedData.basic_info?.company_name) score += 5;
  if (scrapedData.basic_info?.description) score += 10;
  if (scrapedData.basic_info?.location) score += 5;
  
  // Sustainability info quality
  maxScore += 30;
  if (scrapedData.sustainability?.sustainability_content?.length > 0) score += 15;
  if (scrapedData.sustainability?.carbon_info?.length > 0) score += 15;
  
  // Certifications quality
  maxScore += 20;
  if (scrapedData.certifications?.length > 0) score += 20;
  
  // Partnerships quality
  maxScore += 15;
  if (scrapedData.partnerships?.length > 0) score += 15;
  
  // Reports quality
  maxScore += 15;
  if (scrapedData.reports?.length > 0) score += 15;
  
  const qualityScore = Math.round((score / maxScore) * 100);
  
  return {
    score: qualityScore,
    level: qualityScore >= 80 ? 'high' : 
           qualityScore >= 60 ? 'medium' : 
           qualityScore >= 40 ? 'low' : 'very_low',
    details: {
      total_score: score,
      max_score: maxScore,
      sections_with_data: Object.keys(scrapedData).filter(key => 
        scrapedData[key] && 
        (Array.isArray(scrapedData[key]) ? scrapedData[key].length > 0 : Object.keys(scrapedData[key]).length > 0)
      ).length
    }
  };
}

/**
 * Update task status via Cloud Function
 */
async function updateTaskStatus(taskId, status, resultData = null, errorMessage = null) {
  try {
    const updateData = {
      task_id: taskId,
      status: status
    };
    
    if (resultData) {
      updateData.result_data = resultData;
    }
    
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }
    
    const response = await axios.post(
      `https://us-central1-${process.env.GOOGLE_CLOUD_PROJECT}.cloudfunctions.net/updateTaskStatus`,
      updateData,
      { timeout: 10000 }
    );
    
    logger.info(`Task status updated: ${taskId} -> ${status}`);
    
  } catch (error) {
    logger.error(`Failed to update task status for ${taskId}:`, error.message);
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Tier 1 Scraper service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
