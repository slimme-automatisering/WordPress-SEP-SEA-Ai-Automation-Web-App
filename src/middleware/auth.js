import jwt from "jsonwebtoken";
import { licenseService } from "../services/licenseService.js";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Geen token gevonden" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Ongeldige authenticatie" });
  }
};

export const validateLicense = async (req, res, next) => {
  try {
    const { licenseKey } = req.user;
    const domain = req.headers["x-client-domain"];

    if (!licenseKey || !domain) {
      return res.status(403).json({ error: "Licentie informatie ontbreekt" });
    }

    const isValid = await licenseService.verifyLicense(licenseKey, domain);
    if (!isValid) {
      return res.status(403).json({ error: "Ongeldige licentie" });
    }

    next();
  } catch (error) {
    res.status(403).json({ error: "Licentie validatie mislukt" });
  }
};
