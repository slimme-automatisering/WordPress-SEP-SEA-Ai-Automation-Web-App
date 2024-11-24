import cron from 'node-cron';
import { SeoAuditService } from '../services/seoAudit.js';
import { logger } from '../utils/logger.js';

export function setupCronJobs() {
  const seoAudit = new SeoAuditService();

  // Run SEO audit daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Starting daily SEO audit');
      await seoAudit.performSiteAudit(process.env.TARGET_WEBSITE);
    } catch (error) {
      logger.error('Daily SEO audit failed:', error);
    }
  });
}