import puppeteer from 'puppeteer';
import { logger } from '../utils/logger.js';

export class PerformanceOptimizationService {
  async analyzePerformance(url) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      
      // Enable performance metrics
      await page.setCacheEnabled(false);
      const client = await page.target().createCDPSession();
      await client.send('Performance.enable');

      // Navigate and collect metrics
      const navigationStart = Date.now();
      await page.goto(url, { waitUntil: 'networkidle0' });
      const navigationEnd = Date.now();

      const metrics = await page.metrics();
      const performance = await client.send('Performance.getMetrics');

      const results = {
        loadTime: navigationEnd - navigationStart,
        firstContentfulPaint: this.findMetric(performance.metrics, 'FirstContentfulPaint'),
        largestContentfulPaint: this.findMetric(performance.metrics, 'LargestContentfulPaint'),
        totalBlockingTime: this.findMetric(performance.metrics, 'TotalBlockingTime'),
        cumulativeLayoutShift: this.findMetric(performance.metrics, 'CumulativeLayoutShift'),
        resourceMetrics: {
          jsHeapSize: Math.round(metrics.JSHeapUsedSize / 1024 / 1024),
          domNodes: metrics.Nodes,
          layoutCount: metrics.LayoutCount
        }
      };

      await browser.close();
      return results;
    } catch (error) {
      logger.error('Performance analysis failed:', error);
      throw error;
    }
  }

  findMetric(metrics, name) {
    const metric = metrics.find(m => m.name === name);
    return metric ? metric.value : null;
  }

  async generateOptimizationReport(url) {
    try {
      const metrics = await this.analyzePerformance(url);
      
      return {
        metrics,
        recommendations: this.generateRecommendations(metrics),
        score: this.calculatePerformanceScore(metrics)
      };
    } catch (error) {
      logger.error('Optimization report generation failed:', error);
      throw error;
    }
  }

  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.loadTime > 3000) {
      recommendations.push('Consider implementing lazy loading for images and videos');
    }
    if (metrics.resourceMetrics.jsHeapSize > 50) {
      recommendations.push('Optimize JavaScript bundle size');
    }
    if (metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Improve layout stability by specifying image dimensions');
    }

    return recommendations;
  }

  calculatePerformanceScore(metrics) {
    // Simplified scoring algorithm
    let score = 100;
    
    if (metrics.loadTime > 3000) score -= 20;
    if (metrics.firstContentfulPaint > 1800) score -= 15;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 15;
    if (metrics.resourceMetrics.jsHeapSize > 50) score -= 10;

    return Math.max(0, score);
  }
}