import crypto from "crypto-js";
import jwt from "jsonwebtoken";

export class LicenseService {
  constructor() {
    this.secretKey = process.env.LICENSE_SECRET_KEY;
  }

  generateLicense(clientData) {
    const { domain, email, accountId, purchaseDate } = clientData;

    const licenseData = {
      domain,
      email,
      accountId,
      purchaseDate,
      expiryDate: new Date(purchaseDate).setFullYear(
        new Date(purchaseDate).getFullYear() + 1,
      ),
    };

    const encryptedData = crypto.AES.encrypt(
      JSON.stringify(licenseData),
      this.secretKey,
    ).toString();

    return encryptedData;
  }

  validateLicense(licenseKey) {
    try {
      const decrypted = crypto.AES.decrypt(licenseKey, this.secretKey);
      const licenseData = JSON.parse(decrypted.toString(crypto.enc.Utf8));

      const now = new Date();
      const expiryDate = new Date(licenseData.expiryDate);

      return {
        isValid: now < expiryDate,
        licenseData,
      };
    } catch (error) {
      return {
        isValid: false,
        error: "Invalid license key",
      };
    }
  }
}

export const licenseService = new LicenseService();
