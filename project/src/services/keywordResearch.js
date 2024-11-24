import { GoogleAdsApi } from 'google-ads-api';
import { logger } from '../utils/logger.js';

export class KeywordResearchService {
  constructor() {
    this.client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_DEVELOPER_TOKEN
    });
    this.customer = this.client.Customer({
      customer_id: process.env.GOOGLE_CUSTOMER_ID
    });
  }

  async analyzeKeywords(keywords) {
    try {
      const results = await Promise.all(keywords.map(async (keyword) => {
        const response = await this.customer.keywordPlanIdeas.generate({
          keyword: keyword,
          language: 'en',
          geo_target: 'US'
        });

        const suggestions = response.map(result => ({
          text: result.text,
          avgMonthlySearches: result.avgMonthlySearches,
          competition: result.competition,
          competitionIndex: result.competitionIndex
        }));

        return {
          keyword,
          suggestions
        };
      }));

      return results;
    } catch (error) {
      logger.error('Keyword analysis failed:', error);
      throw error;
    }
  }
}