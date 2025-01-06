import express from "express";
import { authMiddleware, validateLicense } from "../middleware/auth.js";
import * as seoController from "../controllers/seoController.js";
import * as seaController from "../controllers/seaController.js";
import * as wooController from "../controllers/wooCommerceController.js";
import * as analyticsController from "../controllers/analyticsController.js";
import scriptsRouter from './v1/scripts.js';

const router = express.Router();

// SEO endpoints
router.get("/audit", authMiddleware, seoController.runAudit);
router.get("/keywords", authMiddleware, seoController.analyzeKeywords);
router.post(
  "/content/optimize",
  authMiddleware,
  seoController.optimizeContent,
);
router.get(
  "/performance",
  authMiddleware,
  seoController.getPerformanceMetrics,
);

// SEA endpoints
router.get("/ads/campaigns", authMiddleware, seaController.getCampaigns);
router.post("/ads/campaign", authMiddleware, seaController.createCampaign);
router.get("/ads/metrics", authMiddleware, seaController.getMetrics);

// Analytics endpoints
router.post(
  "/analytics/initialize",
  authMiddleware,
  analyticsController.initializeAnalytics,
);
router.get(
  "/analytics/realtime",
  authMiddleware,
  analyticsController.getRealtimeData,
);
router.post(
  "/analytics/data",
  authMiddleware,
  analyticsController.getAnalyticsData,
);
router.post(
  "/analytics/export",
  authMiddleware,
  analyticsController.exportAnalyticsData,
);

// WooCommerce endpoints (Pro features)
router.get(
  "/woo/products",
  [authMiddleware, validateLicense],
  wooController.getProducts,
);
router.post(
  "/woo/sync",
  [authMiddleware, validateLicense],
  wooController.syncProducts,
);

router.use('/v1/scripts', scriptsRouter);

export default router;
