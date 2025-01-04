import Joi from 'joi';
import { BaseController } from './baseController.js';
import { GoogleAnalyticsService } from '../services/googleAnalyticsService.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

// Input validatie schemas
const schemas = {
  initialize: Joi.object({
    websiteUrl: Joi.string().uri().required(),
    propertyType: Joi.string().valid('GA4', 'UA').default('GA4'),
    timezone: Joi.string().default('Europe/Amsterdam'),
    currency: Joi.string().length(3).default('EUR')
  }),

  realtime: Joi.object({
    metrics: Joi.array().items(
      Joi.string().valid(
        'activeUsers',
        'screenPageViews',
        'conversions',
        'eventCount'
      )
    ).min(1).default(['activeUsers', 'screenPageViews']),
    dimensions: Joi.array().items(
      Joi.string().valid(
        'city',
        'country',
        'deviceCategory',
        'source',
        'medium'
      )
    ).default([])
  }),

  data: Joi.object({
    dateRange: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
    }).required(),
    metrics: Joi.array().items(
      Joi.string().valid(
        'totalUsers',
        'newUsers',
        'sessions',
        'bounceRate',
        'avgSessionDuration',
        'goalCompletions',
        'pageviews',
        'uniquePageviews'
      )
    ).min(1).required(),
    dimensions: Joi.array().items(
      Joi.string().valid(
        'date',
        'deviceCategory',
        'country',
        'region',
        'city',
        'source',
        'medium',
        'campaign'
      )
    ).default(['date']),
    filters: Joi.array().items(
      Joi.object({
        dimension: Joi.string().required(),
        operator: Joi.string().valid('EXACT', 'CONTAINS', 'REGEXP').required(),
        value: Joi.string().required()
      })
    ).optional()
  }),

  export: Joi.object({
    reportId: Joi.string().required(),
    format: Joi.string().valid('csv', 'xlsx', 'pdf').required(),
    includeCharts: Joi.boolean().default(true)
  })
};

class AnalyticsController extends BaseController {
  constructor() {
    super();
    this.analyticsService = new GoogleAnalyticsService();
  }

  /**
   * Initialiseer Google Analytics tracking
   */
  initializeAnalytics = BaseController.asyncHandler(async (req, res) => {
    try {
      const data = this.validateRequest(schemas.initialize, req.body);
      const result = await this.analyticsService.initialize(data);
      
      return this.sendResponse(res, 200, 'Analytics succesvol geïnitialiseerd', result, {
        propertyId: result.propertyId,
        measurementId: result.measurementId,
        websiteUrl: data.websiteUrl
      });
    } catch (error) {
      logger.error('Analytics initialisatie fout:', error);
      throw new AppError('Kon Google Analytics niet initialiseren', 500);
    }
  });

  /**
   * Haal realtime analytics data op
   */
  getRealtimeData = BaseController.asyncHandler(async (req, res) => {
    try {
      const data = this.validateRequest(schemas.realtime, req.query);
      const results = await this.analyticsService.getRealtimeData(data);
      
      return this.sendResponse(res, 200, 'Realtime data succesvol opgehaald', results, {
        timestamp: new Date().toISOString(),
        metrics: data.metrics,
        dimensions: data.dimensions
      });
    } catch (error) {
      logger.error('Realtime data ophalen mislukt:', error);
      throw new AppError('Kon realtime data niet ophalen', 500);
    }
  });

  /**
   * Haal historische analytics data op
   */
  getAnalyticsData = BaseController.asyncHandler(async (req, res) => {
    try {
      const data = this.validateRequest(schemas.data, req.body);
      const results = await this.analyticsService.getData(data);
      
      return this.sendResponse(res, 200, 'Analytics data succesvol opgehaald', results, {
        dateRange: data.dateRange,
        rowCount: results.rows.length,
        totalRows: results.rowCount,
        samplingLevel: results.samplingLevel
      });
    } catch (error) {
      logger.error('Analytics data ophalen mislukt:', error);
      throw new AppError('Kon analytics data niet ophalen', 500);
    }
  });

  /**
   * Exporteer analytics data
   */
  exportAnalyticsData = BaseController.asyncHandler(async (req, res) => {
    try {
      const data = this.validateRequest(schemas.export, req.body);
      const result = await this.analyticsService.exportData(data);
      
      // Stuur bestand als download
      res.setHeader('Content-Type', this.getContentType(data.format));
      res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${Date.now()}.${data.format}"`);
      
      return res.send(result.buffer);
    } catch (error) {
      logger.error('Analytics export mislukt:', error);
      throw new AppError('Kon analytics data niet exporteren', 500);
    }
  });

  /**
   * Helper functie voor het bepalen van het content type
   */
  getContentType(format) {
    const types = {
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'pdf': 'application/pdf'
    };
    return types[format] || 'application/octet-stream';
  }
}

export default new AnalyticsController();
