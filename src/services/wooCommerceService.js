import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import licenseService from './licenseService.js';

class WooCommerceService {
  constructor() {
    this.initialized = false;
  }

  initialize(config, licenseKey) {
    if (!licenseService.verifyLicense(licenseKey, config.domain)) {
      throw new Error('Ongeldige licentie voor WooCommerce integratie');
    }

    this.api = new WooCommerceRestApi({
      url: config.domain,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      version: 'wc/v3'
    });

    this.initialized = true;
  }

  async syncProducts() {
    if (!this.initialized) {
      throw new Error('WooCommerce service niet geïnitialiseerd');
    }

    try {
      const products = await this.api.get('products');
      return products.data;
    } catch (error) {
      throw new Error(`WooCommerce sync fout: ${error.message}`);
    }
  }

  // Voeg hier meer WooCommerce gerelateerde functies toe
}

export default new WooCommerceService(); 