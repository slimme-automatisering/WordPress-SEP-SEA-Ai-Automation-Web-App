import express from 'express';
import { authenticateUser, validateLicense } from '../middleware/auth.js';
import * as seoController from '../controllers/seoController.js';
import * as seaController from '../controllers/seaController.js';
import * as wooController from '../controllers/wooCommerceController.js';

const router = express.Router();

// SEO endpoints
router.get('/audit', authenticateUser, seoController.runAudit);
router.get('/keywords', authenticateUser, seoController.analyzeKeywords);
router.post('/content/optimize', authenticateUser, seoController.optimizeContent);
router.get('/performance', authenticateUser, seoController.getPerformanceMetrics);

// SEA endpoints
router.get('/ads/campaigns', authenticateUser, seaController.getCampaigns);
router.post('/ads/campaign', authenticateUser, seaController.createCampaign);
router.get('/ads/metrics', authenticateUser, seaController.getMetrics);

// WooCommerce endpoints (Pro features)
router.get('/woo/products', [authenticateUser, validateLicense], wooController.getProducts);
router.post('/woo/sync', [authenticateUser, validateLicense], wooController.syncProducts);

export default router; 