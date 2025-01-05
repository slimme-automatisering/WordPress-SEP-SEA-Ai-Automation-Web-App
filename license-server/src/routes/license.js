const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  verifyLicense,
  activateLicense,
  deactivateLicense,
  getLicenseStatus,
  upgradeLicense,
} = require("../controllers/license");

// Public routes (geen authenticatie nodig)
router.post("/verify", verifyLicense);
router.get("/status/:key", getLicenseStatus);

// Beveiligde routes (authenticatie vereist)
router.post("/activate", verifyToken, activateLicense);
router.put("/deactivate", verifyToken, deactivateLicense);
router.post("/upgrade", verifyToken, upgradeLicense);

module.exports = router;
