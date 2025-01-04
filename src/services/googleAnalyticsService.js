import { google } from 'googleapis';
import { logger } from '../utils/logger.js';

export class GoogleAnalyticsService {
  constructor() {
    this.analytics = null;
    this.initialized = false;
  }

  async initialize(credentials) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
      });

      this.analytics = google.analytics({
        version: 'v4',
        auth
      });

      this.initialized = true;
      logger.info('Google Analytics service geïnitialiseerd');
    } catch (error) {
      logger.error('Google Analytics initialisatie fout:', error);
      throw new Error('Kon Google Analytics niet initialiseren');
    }
  }

  async getRealtimeData(propertyId) {
    if (!this.initialized) {
      throw new Error('Google Analytics service is niet geïnitialiseerd');
    }

    try {
      const response = await this.analytics.data.realtime.get({
        ids: `ga:${propertyId}`,
        metrics: 'rt:activeUsers,rt:pageviews,rt:sessions'
      });

      return {
        activeUsers: response.data.totalsForAllResults['rt:activeUsers'],
        pageviews: response.data.totalsForAllResults['rt:pageviews'],
        sessions: response.data.totalsForAllResults['rt:sessions']
      };
    } catch (error) {
      logger.error('Realtime data ophalen mislukt:', error);
      throw error;
    }
  }

  async getAnalyticsData(propertyId, startDate, endDate, metrics = ['ga:users', 'ga:sessions', 'ga:pageviews']) {
    if (!this.initialized) {
      throw new Error('Google Analytics service is niet geïnitialiseerd');
    }

    try {
      const response = await this.analytics.data.ga.get({
        ids: `ga:${propertyId}`,
        'start-date': startDate,
        'end-date': endDate,
        metrics: metrics.join(','),
        dimensions: 'ga:date'
      });

      return {
        dates: response.data.rows.map(row => row[0]),
        metrics: metrics.reduce((acc, metric, index) => {
          acc[metric.replace('ga:', '')] = response.data.rows.map(row => parseInt(row[index + 1]));
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Analytics data ophalen mislukt:', error);
      throw error;
    }
  }

  async exportData(propertyId, startDate, endDate, format = 'csv') {
    try {
      const data = await this.getAnalyticsData(propertyId, startDate, endDate);
      
      if (format === 'csv') {
        return this.convertToCSV(data);
      } else if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        throw new Error('Niet-ondersteund exportformaat');
      }
    } catch (error) {
      logger.error('Data export mislukt:', error);
      throw error;
    }
  }

  convertToCSV(data) {
    const headers = ['Datum', ...Object.keys(data.metrics)];
    const rows = data.dates.map((date, index) => {
      return [
        date,
        ...Object.values(data.metrics).map(metric => metric[index])
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
