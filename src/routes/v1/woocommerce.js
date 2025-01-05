import express from "express";
import { authenticateUser, validateLicense } from "../../middleware/auth.js";
import * as wooController from "../../controllers/wooCommerceController.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/woo/products:
 *   get:
 *     summary: Haal WooCommerce producten op (Pro feature)
 *     tags: [WooCommerce]
 *     security:
 *       - BearerAuth: []
 *       - LicenseKey: []
 *     responses:
 *       200:
 *         description: Lijst van producten
 *       401:
 *         description: Niet geautoriseerd
 *       403:
 *         description: Pro licentie vereist
 */
router.get(
  "/products",
  [authenticateUser, validateLicense],
  wooController.getProducts,
);

/**
 * @swagger
 * /api/v1/woo/orders:
 *   get:
 *     summary: Haal WooCommerce bestellingen op (Pro feature)
 *     tags: [WooCommerce]
 *     security:
 *       - BearerAuth: []
 *       - LicenseKey: []
 *     responses:
 *       200:
 *         description: Lijst van bestellingen
 *       401:
 *         description: Niet geautoriseerd
 *       403:
 *         description: Pro licentie vereist
 */
router.get(
  "/orders",
  [authenticateUser, validateLicense],
  wooController.getOrders,
);

/**
 * @swagger
 * /api/v1/woo/customers:
 *   get:
 *     summary: Haal WooCommerce klanten op (Pro feature)
 *     tags: [WooCommerce]
 *     security:
 *       - BearerAuth: []
 *       - LicenseKey: []
 *     responses:
 *       200:
 *         description: Lijst van klanten
 *       401:
 *         description: Niet geautoriseerd
 *       403:
 *         description: Pro licentie vereist
 */
router.get(
  "/customers",
  [authenticateUser, validateLicense],
  wooController.getCustomers,
);

/**
 * @swagger
 * /api/v1/woo/sync:
 *   post:
 *     summary: Synchroniseer WooCommerce data (Pro feature)
 *     tags: [WooCommerce]
 *     security:
 *       - BearerAuth: []
 *       - LicenseKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entities
 *             properties:
 *               entities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [products, orders, customers]
 *     responses:
 *       200:
 *         description: Data gesynchroniseerd
 *       401:
 *         description: Niet geautoriseerd
 *       403:
 *         description: Pro licentie vereist
 */
router.post(
  "/sync",
  [authenticateUser, validateLicense],
  wooController.syncData,
);

export default router;
