const express = require("express");
const seaController = require("../controllers/seaController.js");
const { analysisLimiter } = require("../middleware/rateLimiter.js");

const router = express.Router();

/**
 * @swagger
 * /sea/campaigns/{campaignId}/analyze:
 *   get:
 *     tags:
 *       - SEA
 *     summary: Analyseer een campagne
 *     description: Analyseer de performance van een specifieke Google Ads campagne
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID van de Google Ads campagne
 *         example: 123456789
 *     responses:
 *       200:
 *         description: Campagne succesvol geanalyseerd
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: ['success']
 *                 data:
 *                   type: object
 *                   properties:
 *                     campaignId:
 *                       type: string
 *                     analysis:
 *                       type: string
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
router.get(
  "/campaigns/:campaignId/analyze",
  analysisLimiter,
  seaController.analyzeCampaign.bind(seaController),
);

/**
 * @swagger
 * /sea/ads/{adId}/performance:
 *   get:
 *     tags:
 *       - SEA
 *     summary: Krijg advertentie performance
 *     description: Haal performance metrics op voor een specifieke advertentie
 *     parameters:
 *       - in: path
 *         name: adId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID van de advertentie
 *         example: 987654321
 *     responses:
 *       200:
 *         description: Performance metrics succesvol opgehaald
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: ['success']
 *                 data:
 *                   type: object
 *                   properties:
 *                     adId:
 *                       type: string
 *                     performance:
 *                       type: object
 *                       properties:
 *                         clicks:
 *                           type: integer
 *                         impressions:
 *                           type: integer
 *                         ctr:
 *                           type: number
 *                         conversions:
 *                           type: integer
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
router.get(
  "/ads/:adId/performance",
  analysisLimiter,
  seaController.getAdPerformance.bind(seaController),
);

/**
 * @swagger
 * /sea/campaigns/{campaignId}/optimize:
 *   post:
 *     tags:
 *       - SEA
 *     summary: Optimaliseer campagne budget
 *     description: Optimaliseer het budget van een specifieke Google Ads campagne
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID van de Google Ads campagne
 *         example: 123456789
 *     responses:
 *       200:
 *         description: Budget succesvol geoptimaliseerd
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: ['success']
 *                 data:
 *                   type: object
 *                   properties:
 *                     campaignId:
 *                       type: string
 *                     recommendations:
 *                       type: string
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
router.post(
  "/campaigns/:campaignId/optimize",
  analysisLimiter,
  seaController.optimizeBudget.bind(seaController),
);

module.exports = router;
