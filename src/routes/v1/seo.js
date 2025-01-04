import express from 'express';
import { authenticateUser } from '../../middleware/auth.js';
import * as seoController from '../../controllers/seoController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/seo/audit:
 *   get:
 *     summary: Voer een SEO audit uit op een website
 *     tags: [SEO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: SEO audit resultaten
 *       401:
 *         description: Niet geautoriseerd
 */
router.get('/audit', authenticateUser, seoController.runAudit);

/**
 * @swagger
 * /api/v1/seo/keywords:
 *   get:
 *     summary: Analyseer keywords voor een website
 *     tags: [SEO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Keyword analyse resultaten
 *       401:
 *         description: Niet geautoriseerd
 */
router.get('/keywords', authenticateUser, seoController.analyzeKeywords);

/**
 * @swagger
 * /api/v1/seo/content/optimize:
 *   post:
 *     summary: Optimaliseer content voor SEO
 *     tags: [SEO]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Geoptimaliseerde content
 *       401:
 *         description: Niet geautoriseerd
 */
router.post('/content/optimize', authenticateUser, seoController.optimizeContent);

/**
 * @swagger
 * /api/v1/seo/performance:
 *   get:
 *     summary: Haal SEO performance metrics op
 *     tags: [SEO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Performance metrics
 *       401:
 *         description: Niet geautoriseerd
 */
router.get('/performance', authenticateUser, seoController.getPerformanceMetrics);

export default router;
