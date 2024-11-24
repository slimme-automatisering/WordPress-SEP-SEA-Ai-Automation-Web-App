import { describe, it, expect, beforeEach, vi } from 'vitest';
import licenseService from '../../src/services/licenseService.js';

describe('LicenseService', () => {
  const mockClientData = {
    domain: 'test.nl',
    email: 'test@test.nl',
    accountId: 'ACC123',
    purchaseDate: new Date()
  };

  beforeEach(() => {
    process.env.LICENSE_SECRET_KEY = 'test_secret_key';
  });

  it('moet een geldige licentie genereren', () => {
    const license = licenseService.generateLicense(mockClientData);
    
    expect(license).toHaveProperty('licenseKey');
    expect(license.domain).toBe(mockClientData.domain);
    expect(license.email).toBe(mockClientData.email);
  });

  it('moet een geldige licentie verifiëren', () => {
    const license = licenseService.generateLicense(mockClientData);
    const isValid = licenseService.verifyLicense(license.licenseKey, mockClientData.domain);
    
    expect(isValid).toBe(true);
  });

  it('moet ongeldige domeinen afwijzen', () => {
    const license = licenseService.generateLicense(mockClientData);
    const isValid = licenseService.verifyLicense(license.licenseKey, 'wrong-domain.nl');
    
    expect(isValid).toBe(false);
  });
}); 