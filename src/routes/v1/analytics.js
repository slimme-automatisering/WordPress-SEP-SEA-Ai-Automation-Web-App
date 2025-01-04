import express from 'express';
import { authenticateUser } from '../../middleware/auth.js';
import * as analyticsController from '../../controllers/analyticsController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/analytics/initialize:
 *   post:
 *     summary: Initialiseer analytics tracking
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - websiteUrl
 *             properties:
 *               websiteUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analytics geïnitialiseerd
 *       401:
 *         description: Niet geautoriseerd
 */
router.post('/initialize', authenticateUser, analyticsController.initializeAnalytics);

/**
 * @swagger
 * /api/v1/analytics/realtime:
 *   get:
 *     summary: Haal realtime analytics data op
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Realtime analytics data
 *       401:
 *         description: Niet geautoriseerd
 */
router.get('/realtime', authenticateUser, analyticsController.getRealtimeData);

/**
 * @swagger
 * /api/v1/analytics/data:
 *   post:
 *     summary: Haal historische analytics data op
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Historische analytics data
 *       401:
 *         description: Niet geautoriseerd
 */
router.post('/data', authenticateUser, analyticsController.getAnalyticsData);

/**
 * @swagger
 * /api/v1/analytics/export:
 *   post:
 *     summary: Exporteer analytics data
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - format
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, pdf, xlsx]
 *     responses:
 *       200:
 *         description: Geëxporteerde data
 *       401:
 *         description: Niet geautoriseerd
 */
router.post('/export', authenticateUser, analyticsController.exportAnalyticsData);

export default router;
