import axios from 'axios';
import logger from '../utils/logger.js';
import AppError from '../utils/errorHandler.js';

class AnalyticsService {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/webmasters/v3/sites';
  }

  async getSearchAnalytics(domain, params) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${domain}/searchAnalytics/query`,
        params,
        {
          headers: {
            Authorization: `Bearer ${process.env.GOOGLE_ANALYTICS_TOKEN}`
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Analytics API error:', error);
      throw new AppError('Fout bij ophalen analytics data', 500);
    }
  }

  async getPerformanceData(url) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`,
        {
          params: {
            url,
            key: process.env.GOOGLE_PAGESPEED_KEY
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('PageSpeed API error:', error);
      throw new AppError('Fout bij ophalen performance data', 500);
    }
  }
}

export default new AnalyticsService(); 