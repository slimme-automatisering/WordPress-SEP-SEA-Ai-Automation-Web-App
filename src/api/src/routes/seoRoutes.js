const express = require('express');
const seoController = require('../controllers/seoController.js');
const { analysisLimiter, suggestionsLimiter } = require('../middleware/rateLimiter.js');

const router = express.Router();

/**
 * @swagger
 * /seo/analyze:
 *   post:
 *     tags:
 *       - SEO
 *     summary: Analyseer keywords
 *     description: Analyseer een lijst van keywords voor SEO optimalisatie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keywords
 *             properties:
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['seo', 'optimization']
 *     responses:
 *       200:
 *         description: Keywords succesvol geanalyseerd
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KeywordAnalysis'
 *       429:
 *         description: Te veel requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/analyze', analysisLimiter, seoController.analyzeKeywords.bind(seoController));

/**
 * @swagger
 * /seo/suggestions:
 *   get:
 *     tags:
 *       - SEO
 *     summary: Krijg keyword suggesties
 *     description: Krijg suggesties voor een specifiek keyword
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Het keyword waarvoor suggesties nodig zijn
 *         example: seo
 *     responses:
 *       200:
 *         description: Suggesties succesvol opgehaald
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KeywordSuggestions'
 *       429:
 *         description: Te veel requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/suggestions', suggestionsLimiter, seoController.getKeywordSuggestions.bind(seoController));

module.exports = router;
