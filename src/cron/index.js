import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { SeoAuditService } from '../services/seoAudit.js';
import wordpressService from '../services/wordpressService.js';

class CronScheduler {
  constructor() {
    this.seoAudit = new SeoAuditService();
    this.setupJobs();
  }

  setupJobs() {
    // Dagelijkse SEO audit (middernacht)
    this.scheduleJob('0 0 * * *', this.runDailyAudit.bind(this));
    
    // Dagelijkse optimalisaties (2 AM)
    this.scheduleJob('0 2 * * *', this.runDailyOptimizations.bind(this));
    
    // Wekelijkse analyse (Zondag 3 AM)
    this.scheduleJob('0 3 * * 0', this.runWeeklyAnalysis.bind(this));
    
    logger.info('Cron jobs successfully scheduled');
  }

  scheduleJob(schedule, task) {
    cron.schedule(schedule, async () => {
      const startTime = Date.now();
      try {
        logger.info(`Starting cron job: ${task.name}`);
        await task();
        const duration = Date.now() - startTime;
        logger.info(`Completed cron job: ${task.name}`, { duration });
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Cron job failed:', {
          task: task.name,
          duration,
          error: error.message,
          stack: error.stack
        });

        // Retry failed jobs after 5 minutes
        if (!error.noRetry) {
          this.scheduleRetry(task, 5);
        }
      }
    });
  }

  scheduleRetry(task, delayMinutes) {
    const retryTime = new Date(Date.now() + delayMinutes * 60000);
    logger.info(`Scheduling retry for ${task.name} at ${retryTime}`);

    setTimeout(async () => {
      try {
        logger.info(`Retrying failed job: ${task.name}`);
        await task();
        logger.info(`Retry successful: ${task.name}`);
      } catch (error) {
        logger.error(`Retry failed for ${task.name}:`, {
          error: error.message,
          stack: error.stack
        });
      }
    }, delayMinutes * 60000);
  }

  async runDailyAudit() {
    logger.info('Starting daily SEO audit');
    const results = await this.seoAudit.performSiteAudit(process.env.TARGET_WEBSITE);
    logger.info('Daily SEO audit completed', { results });
  }

  async runDailyOptimizations() {
    logger.info('Starting daily SEO optimizations');
    const results = await wordpressService.scheduleOptimizations();
    
    logger.info('Daily optimizations completed', {
      totalOptimized: results.totalOptimized,
      details: results.results.map(r => ({
        id: r.id,
        type: r.contentType,
        changed: r.changes.contentChanged
      }))
    });
  }

  async runWeeklyAnalysis() {
    logger.info('Starting weekly competitor analysis');
    const results = await wordpressService.analyzeCompetitors();
    logger.info('Weekly analysis completed', { results });
  }
}

export default new CronScheduler();