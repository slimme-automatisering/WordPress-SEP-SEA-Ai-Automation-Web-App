import { BaseMiddleware } from './baseMiddleware.js';
import Joi from 'joi';

export class ValidationMiddleware extends BaseMiddleware {
  constructor() {
    super();
  }

  /**
   * Validatie schema's voor SEO endpoints
   */
  seoSchemas = {
    audit: Joi.object({
      url: Joi.string().uri().required(),
      depth: Joi.number().integer().min(1).max(10).default(3),
      checkLinks: Joi.boolean().default(true),
      checkImages: Joi.boolean().default(true),
      checkPerformance: Joi.boolean().default(true)
    }),

    keywords: Joi.object({
      query: Joi.string().required().min(2),
      language: Joi.string().length(2).default('nl'),
      location: Joi.string().default('NL'),
      limit: Joi.number().integer().min(1).max(100).default(10)
    }),

    content: Joi.object({
      text: Joi.string().required().min(10),
      keywords: Joi.array().items(Joi.string()).min(1).required(),
      language: Joi.string().length(2).default('nl')
    }),

    performance: Joi.object({
      url: Joi.string().uri().required(),
      strategy: Joi.string().valid('mobile', 'desktop').default('mobile'),
      locale: Joi.string().default('nl')
    })
  };

  /**
   * Validatie schema's voor SEA endpoints
   */
  seaSchemas = {
    campaign: Joi.object({
      name: Joi.string().required().min(3),
      budget: Joi.number().positive().required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
      targeting: Joi.object({
        locations: Joi.array().items(Joi.string()).min(1),
        languages: Joi.array().items(Joi.string()).min(1),
        devices: Joi.array().items(
          Joi.string().valid('mobile', 'desktop', 'tablet')
        )
      }).required()
    }),

    adGroup: Joi.object({
      campaignId: Joi.string().required(),
      name: Joi.string().required().min(3),
      bidAmount: Joi.number().positive().required(),
      keywords: Joi.array().items(
        Joi.object({
          text: Joi.string().required(),
          matchType: Joi.string().valid('exact', 'phrase', 'broad').required()
        })
      ).min(1)
    }),

    ad: Joi.object({
      adGroupId: Joi.string().required(),
      headline: Joi.string().required().max(30),
      description: Joi.string().required().max(90),
      finalUrl: Joi.string().uri().required(),
      displayUrl: Joi.string().required()
    })
  };

  /**
   * Validatie schema's voor Analytics endpoints
   */
  analyticsSchemas = {
    initialize: Joi.object({
      propertyId: Joi.string().required(),
      viewId: Joi.string().required(),
      timezone: Joi.string().default('Europe/Amsterdam')
    }),

    report: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
      metrics: Joi.array().items(
        Joi.string().valid(
          'users',
          'sessions',
          'pageviews',
          'bounceRate',
          'avgSessionDuration'
        )
      ).min(1).required(),
      dimensions: Joi.array().items(
        Joi.string().valid(
          'date',
          'source',
          'medium',
          'campaign',
          'keyword',
          'device'
        )
      )
    })
  };

  /**
   * Validatie schema's voor WooCommerce endpoints
   */
  wooSchemas = {
    product: Joi.object({
      name: Joi.string().required(),
      type: Joi.string().valid('simple', 'variable').default('simple'),
      regular_price: Joi.number().positive().required(),
      sale_price: Joi.number().positive().less(Joi.ref('regular_price')),
      description: Joi.string(),
      short_description: Joi.string(),
      categories: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().positive()
        })
      ),
      images: Joi.array().items(
        Joi.object({
          src: Joi.string().uri()
        })
      )
    }),

    order: Joi.object({
      payment_method: Joi.string().required(),
      payment_method_title: Joi.string().required(),
      customer_id: Joi.number().integer().positive(),
      billing: Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string(),
        address_1: Joi.string().required(),
        city: Joi.string().required(),
        postcode: Joi.string().required(),
        country: Joi.string().length(2).required()
      }).required(),
      shipping: Joi.object({
        first_name: Joi.string(),
        last_name: Joi.string(),
        address_1: Joi.string(),
        city: Joi.string(),
        postcode: Joi.string(),
        country: Joi.string().length(2)
      }),
      line_items: Joi.array().items(
        Joi.object({
          product_id: Joi.number().integer().positive().required(),
          quantity: Joi.number().integer().positive().required()
        })
      ).min(1).required()
    })
  };

  /**
   * Valideer SEO request
   */
  validateSeoRequest(type) {
    return this.validateBody(this.seoSchemas[type]);
  }

  /**
   * Valideer SEA request
   */
  validateSeaRequest(type) {
    return this.validateBody(this.seaSchemas[type]);
  }

  /**
   * Valideer Analytics request
   */
  validateAnalyticsRequest(type) {
    return this.validateBody(this.analyticsSchemas[type]);
  }

  /**
   * Valideer WooCommerce request
   */
  validateWooRequest(type) {
    return this.validateBody(this.wooSchemas[type]);
  }
}
