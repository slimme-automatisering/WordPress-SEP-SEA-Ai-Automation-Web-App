import puppeteer from 'puppeteer';
import { logger } from '../utils/logger.js';

export class SeoAuditService {
  async performSiteAudit(url) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);

      const seoData = await page.evaluate(() => {
        return {
          title: document.title,
          metaDescription: document.querySelector('meta[name="description"]')?.content,
          h1Tags: Array.from(document.getElementsByTagName('h1')).length,
          images: Array.from(document.getElementsByTagName('img')).filter(img => !img.alt).length,
          links: Array.from(document.getElementsByTagName('a')).length
        };
      });

      await browser.close();
      return seoData;
    } catch (error) {
      logger.error('Site audit failed:', error);
      throw error;
    }
  }
}