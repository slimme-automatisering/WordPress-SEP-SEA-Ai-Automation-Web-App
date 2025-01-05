import express from "express";
import seoRoutes from "./v1/seo.js";
import seaRoutes from "./v1/sea.js";
import analyticsRoutes from "./v1/analytics.js";
import wooCommerceRoutes from "./v1/woocommerce.js";

const router = express.Router();

// API versie 1 routes
router.use("/api/v1/seo", seoRoutes);
router.use("/api/v1/sea", seaRoutes);
router.use("/api/v1/analytics", analyticsRoutes);
router.use("/api/v1/woo", wooCommerceRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API documentatie redirect
router.get("/docs", (req, res) => {
  res.redirect("/api-docs");
});

// 404 handler voor onbekende routes
router.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route niet gevonden",
    path: req.originalUrl,
  });
});

export default router;
