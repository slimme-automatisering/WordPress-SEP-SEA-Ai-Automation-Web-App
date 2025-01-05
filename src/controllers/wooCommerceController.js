import Joi from "joi";
import { BaseController } from "./baseController.js";
import { WooCommerceService } from "../services/wooCommerceService.js";

// Input validatie schemas
const schemas = {
  products: Joi.object({
    status: Joi.string()
      .valid("publish", "draft", "private")
      .default("publish"),
    category: Joi.string(),
    tag: Joi.string(),
    search: Joi.string(),
    orderBy: Joi.string()
      .valid("date", "price", "popularity", "rating")
      .default("date"),
    order: Joi.string().valid("asc", "desc").default("desc"),
    perPage: Joi.number().integer().min(1).max(100).default(20),
    page: Joi.number().integer().min(1).default(1),
  }),

  orders: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "processing",
        "on-hold",
        "completed",
        "cancelled",
        "refunded",
        "failed",
      )
      .default("any"),
    customer: Joi.number().integer(),
    product: Joi.number().integer(),
    dateRange: Joi.object({
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref("startDate")),
    }),
    perPage: Joi.number().integer().min(1).max(100).default(20),
    page: Joi.number().integer().min(1).default(1),
  }),

  customers: Joi.object({
    role: Joi.string()
      .valid("all", "administrator", "customer")
      .default("customer"),
    orderCount: Joi.object({
      min: Joi.number().integer().min(0),
      max: Joi.number().integer().min(Joi.ref("min")),
    }),
    totalSpent: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(Joi.ref("min")),
    }),
    search: Joi.string(),
    perPage: Joi.number().integer().min(1).max(100).default(20),
    page: Joi.number().integer().min(1).default(1),
  }),

  sync: Joi.object({
    entities: Joi.array()
      .items(
        Joi.string().valid(
          "products",
          "orders",
          "customers",
          "categories",
          "coupons",
        ),
      )
      .min(1)
      .required(),
    options: Joi.object({
      forceUpdate: Joi.boolean().default(false),
      syncImages: Joi.boolean().default(true),
      syncMetadata: Joi.boolean().default(true),
    }).default({}),
  }),
};

class WooCommerceController extends BaseController {
  constructor() {
    super();
    this.wooService = new WooCommerceService();
  }

  /**
   * Haal producten op
   */
  getProducts = BaseController.asyncHandler(async (req, res) => {
    const data = this.validateRequest(schemas.products, req.query);
    const results = await this.wooService.getProducts(data);

    return this.sendResponse(
      res,
      200,
      "Producten succesvol opgehaald",
      results.products,
      {
        total: results.total,
        page: data.page,
        totalPages: Math.ceil(results.total / data.perPage),
        filters: {
          status: data.status,
          category: data.category,
          tag: data.tag,
        },
      },
    );
  });

  /**
   * Haal bestellingen op
   */
  getOrders = BaseController.asyncHandler(async (req, res) => {
    const data = this.validateRequest(schemas.orders, req.query);
    const results = await this.wooService.getOrders(data);

    return this.sendResponse(
      res,
      200,
      "Bestellingen succesvol opgehaald",
      results.orders,
      {
        total: results.total,
        page: data.page,
        totalPages: Math.ceil(results.total / data.perPage),
        totalRevenue: results.totalRevenue,
        filters: {
          status: data.status,
          customer: data.customer,
          dateRange: data.dateRange,
        },
      },
    );
  });

  /**
   * Haal klanten op
   */
  getCustomers = BaseController.asyncHandler(async (req, res) => {
    const data = this.validateRequest(schemas.customers, req.query);
    const results = await this.wooService.getCustomers(data);

    return this.sendResponse(
      res,
      200,
      "Klanten succesvol opgehaald",
      results.customers,
      {
        total: results.total,
        page: data.page,
        totalPages: Math.ceil(results.total / data.perPage),
        filters: {
          role: data.role,
          orderCount: data.orderCount,
          totalSpent: data.totalSpent,
        },
      },
    );
  });

  /**
   * Synchroniseer WooCommerce data
   */
  syncData = BaseController.asyncHandler(async (req, res) => {
    const data = this.validateRequest(schemas.sync, req.body);
    const results = await this.wooService.syncData(data);

    return this.sendResponse(
      res,
      200,
      "Data synchronisatie succesvol",
      results,
      {
        syncedEntities: data.entities,
        totalSynced: results.totalSynced,
        errors: results.errors,
        duration: results.duration,
      },
    );
  });
}

export default new WooCommerceController();
