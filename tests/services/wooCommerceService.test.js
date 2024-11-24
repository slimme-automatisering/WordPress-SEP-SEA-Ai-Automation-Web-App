import { describe, it, expect, beforeEach, vi } from 'vitest';
import wooCommerceService from '../../src/services/wooCommerceService.js';
import licenseService from '../../src/services/licenseService.js';

vi.mock('../../src/services/licenseService.js');

describe('WooCommerceService', () => {
  const mockConfig = {
    domain: 'shop.test.nl',
    consumerKey: 'test_key',
    consumerSecret: 'test_secret'
  };
  
  const mockLicenseKey = 'valid_license_key';

  beforeEach(() => {
    licenseService.verifyLicense.mockReset();
  });

  it('moet initialiseren met geldige licentie', () => {
    licenseService.verifyLicense.mockReturnValue(true);
    
    expect(() => {
      wooCommerceService.initialize(mockConfig, mockLicenseKey);
    }).not.toThrow();
    
    expect(wooCommerceService.initialized).toBe(true);
  });

  it('moet falen bij ongeldige licentie', () => {
    licenseService.verifyLicense.mockReturnValue(false);
    
    expect(() => {
      wooCommerceService.initialize(mockConfig, 'invalid_key');
    }).toThrow('Ongeldige licentie');
  });
}); 