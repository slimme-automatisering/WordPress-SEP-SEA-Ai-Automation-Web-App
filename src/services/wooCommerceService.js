import { BaseService } from "./baseService.js";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export class WooCommerceService extends BaseService {
  constructor() {
    super();
    this.api = new WooCommerceRestApi({
      url: process.env.WOOCOMMERCE_URL,
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
      version: "wc/v3",
    });
  }

  /**
   * Haal producten op
   */
  async getProducts(options) {
    const cacheKey = this.createCacheKey("woo:products", options);

    return this.getCached(
      cacheKey,
      async () => {
        const response = await this.api.get("products", {
          per_page: options.perPage,
          page: options.page,
          status: options.status,
          category: options.category,
          tag: options.tag,
          search: options.search,
          orderby: options.orderBy,
          order: options.order,
        });

        return {
          products: this.validateApiResponse(response.data, "WooCommerce"),
          total: parseInt(response.headers["x-wp-total"]),
          totalPages: parseInt(response.headers["x-wp-totalpages"]),
        };
      },
      300,
    ); // Cache voor 5 minuten
  }

  /**
   * Haal bestellingen op
   */
  async getOrders(options) {
    const cacheKey = this.createCacheKey("woo:orders", {
      ...options,
      startDate: options.dateRange?.startDate,
      endDate: options.dateRange?.endDate,
    });

    return this.getCached(
      cacheKey,
      async () => {
        const response = await this.api.get("orders", {
          per_page: options.perPage,
          page: options.page,
          status: options.status,
          customer: options.customer,
          product: options.product,
          after: options.dateRange?.startDate,
          before: options.dateRange?.endDate,
        });

        const orders = this.validateApiResponse(response.data, "WooCommerce");
        const totalRevenue = orders.reduce(
          (sum, order) => sum + parseFloat(order.total),
          0,
        );

        return {
          orders,
          total: parseInt(response.headers["x-wp-total"]),
          totalPages: parseInt(response.headers["x-wp-totalpages"]),
          totalRevenue,
        };
      },
      300,
    ); // Cache voor 5 minuten
  }

  /**
   * Haal klanten op
   */
  async getCustomers(options) {
    const cacheKey = this.createCacheKey("woo:customers", options);

    return this.getCached(
      cacheKey,
      async () => {
        const response = await this.api.get("customers", {
          per_page: options.perPage,
          page: options.page,
          role: options.role,
          search: options.search,
        });

        const customers = this.validateApiResponse(
          response.data,
          "WooCommerce",
        );

        // Filter op basis van order count en total spent als opgegeven
        const filteredCustomers = customers.filter((customer) => {
          const orderCount = parseInt(customer.orders_count);
          const totalSpent = parseFloat(customer.total_spent);

          const meetsOrderCount =
            !options.orderCount ||
            (orderCount >= options.orderCount.min &&
              orderCount <= options.orderCount.max);

          const meetsTotalSpent =
            !options.totalSpent ||
            (totalSpent >= options.totalSpent.min &&
              totalSpent <= options.totalSpent.max);

          return meetsOrderCount && meetsTotalSpent;
        });

        return {
          customers: filteredCustomers,
          total: filteredCustomers.length,
          totalPages: Math.ceil(filteredCustomers.length / options.perPage),
        };
      },
      300,
    ); // Cache voor 5 minuten
  }

  /**
   * Synchroniseer data
   */
  async syncData(options) {
    // Rate limiting voor sync operaties
    await this.checkRateLimit("woo:sync", 5); // 5 requests per minuut

    const startTime = Date.now();
    const results = {
      totalSynced: 0,
      errors: [],
      details: {},
    };

    // Verwerk elke entity type
    for (const entity of options.entities) {
      try {
        switch (entity) {
          case "products":
            results.details.products = await this.syncProducts(options.options);
            break;
          case "orders":
            results.details.orders = await this.syncOrders(options.options);
            break;
          case "customers":
            results.details.customers = await this.syncCustomers(
              options.options,
            );
            break;
          case "categories":
            results.details.categories = await this.syncCategories(
              options.options,
            );
            break;
          case "coupons":
            results.details.coupons = await this.syncCoupons(options.options);
            break;
        }

        results.totalSynced++;
      } catch (error) {
        results.errors.push({
          entity,
          error: error.message,
        });
      }
    }

    results.duration = Date.now() - startTime;
    return results;
  }

  /**
   * Synchroniseer producten
   */
  async syncProducts(options) {
    const products = await this.getProducts({ per_page: 100 });

    return this.processBatch(products.products, async (product) => {
      if (options.syncImages) {
        await this.syncProductImages(product);
      }
      if (options.syncMetadata) {
        await this.syncProductMetadata(product);
      }
      return this.api.put(`products/${product.id}`, product);
    });
  }

  /**
   * Synchroniseer product afbeeldingen
   */
  async syncProductImages(product) {
    // Implementeer image sync logica
    return Promise.resolve();
  }

  /**
   * Synchroniseer product metadata
   */
  async syncProductMetadata(product) {
    // Implementeer metadata sync logica
    return Promise.resolve();
  }

  /**
   * Synchroniseer bestellingen
   */
  async syncOrders(options) {
    const orders = await this.getOrders({ per_page: 100 });

    return this.processBatch(orders.orders, async (order) => {
      return this.api.put(`orders/${order.id}`, order);
    });
  }

  /**
   * Synchroniseer klanten
   */
  async syncCustomers(options) {
    const customers = await this.getCustomers({ per_page: 100 });

    return this.processBatch(customers.customers, async (customer) => {
      return this.api.put(`customers/${customer.id}`, customer);
    });
  }

  /**
   * Synchroniseer categorieën
   */
  async syncCategories(options) {
    const response = await this.api.get("products/categories", {
      per_page: 100,
    });
    const categories = this.validateApiResponse(response.data, "WooCommerce");

    return this.processBatch(categories, async (category) => {
      return this.api.put(`products/categories/${category.id}`, category);
    });
  }

  /**
   * Synchroniseer kortingscodes
   */
  async syncCoupons(options) {
    const response = await this.api.get("coupons", { per_page: 100 });
    const coupons = this.validateApiResponse(response.data, "WooCommerce");

    return this.processBatch(coupons, async (coupon) => {
      return this.api.put(`coupons/${coupon.id}`, coupon);
    });
  }
}
