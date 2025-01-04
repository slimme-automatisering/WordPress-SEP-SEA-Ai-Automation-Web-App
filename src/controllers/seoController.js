import Joi from 'joi';
import { BaseController } from './baseController.js';
import { SeoAuditService } from '../services/seoAudit.js';
import { KeywordService } from '../services/keywordResearch.js';
import { ContentService } from '../services/contentOptimization.js';
import OpenAI from 'openai';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import logger from '../utils/logger.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Input validatie schemas
const schemas = {
  audit: Joi.object({
    url: Joi.string().uri().required(),
    depth: Joi.number().integer().min(1).max(10).default(3),
    checkBrokenLinks: Joi.boolean().default(true)
  }),

  keywords: Joi.object({
    query: Joi.string().required().min(3),
    language: Joi.string().length(2).default('nl'),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  content: Joi.object({
    content: Joi.string().required().min(10),
    keywords: Joi.array().items(Joi.string()).min(1).required(),
    language: Joi.string().length(2).default('nl')
  }),

  performance: Joi.object({
    url: Joi.string().uri().required(),
    mobile: Joi.boolean().default(true)
  })
};

class SeoController extends BaseController {
  constructor() {
    super();
    this.seoAudit = new SeoAuditService();
    this.keywordService = new KeywordService();
    this.contentService = new ContentService();
  }

  /**
   * Voer een SEO audit uit
   */
  runAudit = BaseController.asyncHandler(async (req, res) => {
    try {
      const { url } = req.query;
      const browser = await puppeteer.launch({ 
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
      });
      const page = await browser.newPage();
      await page.goto(url);

      const html = await page.content();
      const $ = cheerio.load(html);

      const audit = {
        meta: {
          title: $('title').text(),
          description: $('meta[name="description"]').attr('content'),
        },
        headings: {
          h1: $('h1').length,
          h2: $('h2').length,
        },
        images: $('img').length,
        imagesWithoutAlt: $('img:not([alt])').length,
        links: $('a').length,
        performance: await page.metrics(),
      };

      await browser.close();
      res.json(audit);
    } catch (error) {
      logger.error('SEO Audit error:', error);
      res.status(500).json({ error: 'Audit uitvoering mislukt' });
    }
  });

  /**
   * Analyseer keywords
   */
  analyzeKeywords = BaseController.asyncHandler(async (req, res) => {
    const data = this.validateRequest(schemas.keywords, req.body);
    const results = await this.keywordService.analyzeKeywords(data);
    
    return this.sendResponse(res, 200, 'Keyword analyse succesvol uitgevoerd', results, {
      query: data.query,
      language: data.language,
      resultCount: results.keywords.length
    });
  });

  /**
   * Optimaliseer content
   */
  optimizeContent = BaseController.asyncHandler(async (req, res) => {
    try {
      const { content, keywords } = req.body;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "Je bent een SEO expert die content optimaliseert."
        }, {
          role: "user",
          content: `Optimaliseer deze content voor de volgende keywords: ${keywords}\n\nContent: ${content}`
        }],
      });

      res.json({ 
        optimizedContent: completion.choices[0].message.content,
        suggestions: completion.choices[0].message.content.split('\n\n')[0]
      });
    } catch (error) {
      logger.error('Content optimalisatie error:', error);
      res.status(500).json({ error: 'Content optimalisatie mislukt' });
    }
  });

  /**
   * Haal performance metrics op
   */
  getPerformanceMetrics = BaseController.asyncHandler(async (req, res) => {
    const data = this.validateRequest(schemas.performance, req.query);
    const results = await this.seoAudit.getPerformanceMetrics(data);
    
    return this.sendResponse(res, 200, 'Performance metrics succesvol opgehaald', results, {
      url: data.url,
      mobile: data.mobile,
      timestamp: new Date().toISOString()
    });
  });
}

export default new SeoController();