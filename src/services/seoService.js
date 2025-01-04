import { BaseService } from './baseService.js';
import { SerpApi } from '../integrations/serpApi.js';
import { GoogleSearchConsole } from '../integrations/googleSearchConsole.js';
import { PageSpeedInsights } from '../integrations/pageSpeedInsights.js';

export class SeoService extends BaseService {
  constructor() {
    super();
    this.serpApi = new SerpApi();
    this.searchConsole = new GoogleSearchConsole();
    this.pageSpeed = new PageSpeedInsights();
  }

  /**
   * Voer een SEO audit uit voor een website
   */
  async runAudit(url, options = {}) {
    const cacheKey = this.createCacheKey('seo:audit', { url, ...options });

    return this.getCached(cacheKey, async () => {
      // Parallel uitvoeren van verschillende checks
      const [
        rankings,
        performance,
        searchConsoleData,
        backlinks
      ] = await Promise.all([
        this.getKeywordRankings(url),
        this.getPerformanceMetrics(url),
        this.getSearchConsoleData(url),
        this.getBacklinks(url)
      ]);

      return {
        url,
        timestamp: new Date().toISOString(),
        rankings,
        performance,
        searchConsole: searchConsoleData,
        backlinks,
        recommendations: this.generateRecommendations({
          rankings,
          performance,
          searchConsoleData,
          backlinks
        })
      };
    }, 3600); // Cache voor 1 uur
  }

  /**
   * Haal keyword rankings op
   */
  async getKeywordRankings(url, options = {}) {
    const cacheKey = this.createCacheKey('seo:rankings', { url, ...options });

    return this.getCached(cacheKey, async () => {
      const response = await this.serpApi.searchKeywords(url);
      return this.validateApiResponse(response, 'SERP');
    }, 1800); // Cache voor 30 minuten
  }

  /**
   * Haal performance metrics op
   */
  async getPerformanceMetrics(url) {
    const cacheKey = this.createCacheKey('seo:performance', { url });

    return this.getCached(cacheKey, async () => {
      const response = await this.pageSpeed.analyze(url);
      return this.validateApiResponse(response, 'PageSpeed');
    }, 86400); // Cache voor 24 uur
  }

  /**
   * Haal Search Console data op
   */
  async getSearchConsoleData(url, dateRange = { days: 28 }) {
    const cacheKey = this.createCacheKey('seo:searchconsole', {
      url,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });

    return this.getCached(cacheKey, async () => {
      const response = await this.searchConsole.getSearchAnalytics(url, dateRange);
      return this.validateApiResponse(response, 'Search Console');
    }, 3600); // Cache voor 1 uur
  }

  /**
   * Haal backlink data op
   */
  async getBacklinks(url) {
    const cacheKey = this.createCacheKey('seo:backlinks', { url });

    return this.getCached(cacheKey, async () => {
      const response = await this.serpApi.getBacklinks(url);
      return this.validateApiResponse(response, 'Backlinks');
    }, 86400); // Cache voor 24 uur
  }

  /**
   * Optimaliseer content voor keywords
   */
  async optimizeContent(content, targetKeywords) {
    // Rate limiting voor content optimalisatie
    await this.checkRateLimit('seo:optimize', 100); // 100 requests per minuut

    const suggestions = await this.serpApi.getContentSuggestions(
      content,
      targetKeywords
    );

    return {
      originalContent: content,
      targetKeywords,
      suggestions: this.validateApiResponse(suggestions, 'Content Optimization'),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Genereer SEO aanbevelingen
   */
  generateRecommendations(data) {
    const recommendations = [];

    // Performance aanbevelingen
    if (data.performance) {
      if (data.performance.score < 90) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          message: 'Verbeter de laadtijd van de pagina',
          details: data.performance.opportunities
        });
      }
    }

    // Keyword aanbevelingen
    if (data.rankings) {
      const lowRankingKeywords = data.rankings.filter(k => k.position > 10);
      if (lowRankingKeywords.length > 0) {
        recommendations.push({
          type: 'keywords',
          priority: 'medium',
          message: 'Optimaliseer content voor keywords met lage rankings',
          details: lowRankingKeywords
        });
      }
    }

    // Search Console aanbevelingen
    if (data.searchConsole) {
      if (data.searchConsole.clickRate < 2) {
        recommendations.push({
          type: 'searchConsole',
          priority: 'high',
          message: 'Verbeter CTR in zoekresultaten',
          details: data.searchConsole.queries
        });
      }
    }

    // Backlink aanbevelingen
    if (data.backlinks) {
      if (data.backlinks.total < 100) {
        recommendations.push({
          type: 'backlinks',
          priority: 'medium',
          message: 'Bouw meer kwalitatieve backlinks op',
          details: data.backlinks.opportunities
        });
      }
    }

    return recommendations;
  }
}
