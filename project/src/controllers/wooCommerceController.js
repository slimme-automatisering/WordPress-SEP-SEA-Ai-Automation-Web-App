import wooCommerceService from '../services/wooCommerceService.js';
import logger from '../utils/logger.js';

export const getProducts = async (req, res) => {
  try {
    const products = await wooCommerceService.syncProducts();
    res.json(products);
  } catch (error) {
    logger.error('WooCommerce products fetch error:', error);
    res.status(500).json({ error: 'Producten ophalen mislukt' });
  }
};

export const syncProducts = async (req, res) => {
  try {
    const { products } = req.body;
    const results = await Promise.all(products.map(async (product) => {
      try {
        return await wooCommerceService.api.post('products', product);
      } catch (error) {
        return { error: error.message, product };
      }
    }));

    res.json({ results });
  } catch (error) {
    logger.error('WooCommerce sync error:', error);
    res.status(500).json({ error: 'Synchronisatie mislukt' });
  }
}; 