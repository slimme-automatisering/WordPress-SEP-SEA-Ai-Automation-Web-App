import express from 'express';
import { SeoAuditService } from '../services/seoAudit.js';
import { KeywordResearchService } from '../services/keywordResearch.js';
import { ContentOptimizationService } from '../services/contentOptimization.js';
import { XmlSitemapService } from '../services/xmlSitemap.js';
import { LinkBuildingService } from '../services/linkBuilding.js';
import { PerformanceOptimizationService } from '../services/performanceOptimization.js';
import { authMiddleware } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

export const router = express.Router();

const seoAudit = new SeoAuditService();
const keywordResearch = new KeywordResearchService();
const contentOptimization = new ContentOptimizationService();
const xmlSitemap = new XmlSitemapService();
const linkBuilding = new LinkBuildingService();
const performanceOptimization = new PerformanceOptimizationService();

router.use(authMiddleware);

// SEO Audit endpoints
router.post('/audit', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await seoAudit.performSiteAudit(url);
    res.json(result);
  } catch (error) {
    logger.error('Audit API error:', error);
    res.status(500).json({ error: 'Audit failed' });
  }
});

// Keyword Research endpoints
router.post('/keywords/analyze', async (req, res) => {
  try {
    const { keywords } = req.body;
    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }
    const result = await keywordResearch.analyzeKeywords(keywords);
    res.json(result);
  } catch (error) {
    logger.error('Keyword analysis API error:', error);
    res.status(500).json({ error: 'Keyword analysis failed' });
  }
});

// Content Optimization endpoints
router.post('/content/optimize', async (req, res) => {
  try {
    const { content, keywords } = req.body;
    if (!content || !keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: 'Content and keywords array are required' });
    }
    const result = await contentOptimization.optimizeContent(content, keywords);
    res.json(result);
  } catch (error) {
    logger.error('Content optimization API error:', error);
    res.status(500).json({ error: 'Content optimization failed' });
  }
});

// XML Sitemap endpoints
router.post('/sitemap/generate', async (req, res) => {
  try {
    const { urls, outputPath } = req.body;
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' });
    }
    const result = await xmlSitemap.generateSitemap(urls, outputPath);
    res.json({ success: true, sitemap: result });
  } catch (error) {
    logger.error('Sitemap generation API error:', error);
    res.status(500).json({ error: 'Sitemap generation failed' });
  }
});

// Link Building endpoints
router.post('/backlinks/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await linkBuilding.analyzeBacklinks(url);
    res.json(result);
  } catch (error) {
    logger.error('Backlink analysis API error:', error);
    res.status(500).json({ error: 'Backlink analysis failed' });
  }
});

router.post('/outreach/send', async (req, res) => {
  try {
    const { contact, template } = req.body;
    if (!contact || !template) {
      return res.status(400).json({ error: 'Contact and template are required' });
    }
    const result = await linkBuilding.sendOutreachEmail(contact, template);
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    logger.error('Outreach email API error:', error);
    res.status(500).json({ error: 'Outreach email failed' });
  }
});

// Performance Optimization endpoints
router.post('/performance/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await performanceOptimization.generateOptimizationReport(url);
    res.json(result);
  } catch (error) {
    logger.error('Performance analysis API error:', error);
    res.status(500).json({ error: 'Performance analysis failed' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});