import express from "express";
import { authenticateUser } from "../../middleware/auth.js";
import * as seaController from "../../controllers/seaController.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/sea/campaigns:
 *   get:
 *     summary: Haal alle advertentie campagnes op
 *     tags: [SEA]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lijst van campagnes
 *       401:
 *         description: Niet geautoriseerd
 */
router.get("/campaigns", authenticateUser, seaController.getCampaigns);

/**
 * @swagger
 * /api/v1/sea/campaign:
 *   post:
 *     summary: Maak een nieuwe advertentie campagne aan
 *     tags: [SEA]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - budget
 *             properties:
 *               name:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       201:
 *         description: Campagne aangemaakt
 *       401:
 *         description: Niet geautoriseerd
 */
router.post("/campaign", authenticateUser, seaController.createCampaign);

/**
 * @swagger
 * /api/v1/sea/metrics:
 *   get:
 *     summary: Haal advertentie metrics op
 *     tags: [SEA]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Advertentie metrics
 *       401:
 *         description: Niet geautoriseerd
 */
router.get("/metrics", authenticateUser, seaController.getMetrics);

export default router;
