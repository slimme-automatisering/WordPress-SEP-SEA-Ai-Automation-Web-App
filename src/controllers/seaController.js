import Joi from "joi";
import { BaseController } from "./baseController.js";
import { GoogleAdsService } from "../api/src/services/googleAdsService.js";

// Input validatie schemas
const schemas = {
  campaigns: Joi.object({
    status: Joi.string()
      .valid("ENABLED", "PAUSED", "REMOVED")
      .default("ENABLED"),
    dateRange: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
    }).optional(),
  }),

  createCampaign: Joi.object({
    name: Joi.string().required().min(3).max(100),
    budget: Joi.number().positive().required(),
    bidStrategy: Joi.string()
      .valid("MAXIMIZE_CONVERSIONS", "MAXIMIZE_CLICKS", "TARGET_CPA")
      .required(),
    targetCpa: Joi.when("bidStrategy", {
      is: "TARGET_CPA",
      then: Joi.number().positive().required(),
      otherwise: Joi.forbidden(),
    }),
    keywords: Joi.array()
      .items(
        Joi.object({
          text: Joi.string().required(),
          matchType: Joi.string().valid("EXACT", "PHRASE", "BROAD").required(),
          maxCpc: Joi.number().positive(),
        }),
      )
      .min(1)
      .required(),
    locations: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
          type: Joi.string().valid("COUNTRY", "REGION", "CITY").required(),
        }),
      )
      .required(),
    language: Joi.string().length(2).default("nl"),
    startDate: Joi.date().iso().min("now").required(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")),
  }),

  metrics: Joi.object({
    dateRange: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
    }).required(),
    metrics: Joi.array()
      .items(
        Joi.string().valid(
          "CLICKS",
          "IMPRESSIONS",
          "CTR",
          "AVERAGE_CPC",
          "COST",
          "CONVERSIONS",
          "CONVERSION_RATE",
          "CONVERSION_VALUE",
        ),
      )
      .min(1)
      .default(["CLICKS", "IMPRESSIONS", "CTR", "COST"]),
  }),
};

class SeaController extends BaseController {
  constructor() {
    super();
    this.googleAdsService = new GoogleAdsService();
  }

  /**
   * Haal alle campagnes op
   */
  getCampaigns = BaseController.asyncHandler(async (req, res) => {
    const data = this.validateRequest(schemas.campaigns, req.query);
    const results = await this.googleAdsService.getCampaigns(data);

    return this.sendResponse(
      res,
      200,
      "Campagnes succesvol opgehaald",
      results,
      {
        status: data.status,
        totalCampaigns: results.campaigns.length,
        dateRange: data.dateRange,
      },
    );
  });

  /**
   * Maak een nieuwe campagne aan
   */
  createCampaign = BaseController.asyncHandler(async (req, res) => {
    const data = this.validateRequest(schemas.createCampaign, req.body);
    const result = await this.googleAdsService.createCampaign(data);

    return this.sendResponse(
      res,
      201,
      "Campagne succesvol aangemaakt",
      result,
      {
        campaignId: result.campaignId,
        name: data.name,
        startDate: data.startDate,
      },
    );
  });

  /**
   * Haal campagne metrics op
   */
  getMetrics = BaseController.asyncHandler(async (req, res) => {
    const data = this.validateRequest(schemas.metrics, req.body);
    const results = await this.googleAdsService.getMetrics(data);

    return this.sendResponse(res, 200, "Metrics succesvol opgehaald", results, {
      dateRange: data.dateRange,
      metrics: data.metrics,
      totalRows: results.rows.length,
    });
  });
}

export default new SeaController();
