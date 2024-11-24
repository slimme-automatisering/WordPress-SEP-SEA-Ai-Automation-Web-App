import crypto from 'crypto-js';
import jwt from 'jsonwebtoken';

class LicenseService {
  constructor() {
    this.secretKey = process.env.LICENSE_SECRET_KEY;
  }

  generateLicense(clientData) {
    const {
      domain,
      email,
      accountId,
      purchaseDate
    } = clientData;

    const licenseData = {
      domain,
      email,
      accountId,
      purchaseDate,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 jaar
    };

    // Genereer unieke license key
    const licenseKey = crypto.AES.encrypt(
      JSON.stringify(licenseData),
      this.secretKey
    ).toString();

    return {
      licenseKey,
      ...licenseData
    };
  }

  verifyLicense(licenseKey, domain) {
    try {
      const decrypted = crypto.AES.decrypt(licenseKey, this.secretKey);
      const licenseData = JSON.parse(decrypted.toString(crypto.enc.Utf8));

      if (licenseData.domain !== domain) {
        throw new Error('Ongeldige domeinnaam voor deze licentie');
      }

      if (new Date(licenseData.expiryDate) < new Date()) {
        throw new Error('Verlopen licentie');
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new LicenseService(); 