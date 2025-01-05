const prometheus = require("prom-client");
const { logger } = require("../../utils/logger");

class MonitoringService {
  constructor() {
    // Initialize Prometheus metrics
    this.metrics = {
      httpRequestDuration: new prometheus.Histogram({
        name: "http_request_duration_seconds",
        help: "Duration of HTTP requests in seconds",
        labelNames: ["method", "route", "status_code"],
        buckets: [0.1, 0.5, 1, 2, 5],
      }),

      httpRequestTotal: new prometheus.Counter({
        name: "http_requests_total",
        help: "Total number of HTTP requests",
        labelNames: ["method", "route", "status_code"],
      }),

      apiErrorsTotal: new prometheus.Counter({
        name: "api_errors_total",
        help: "Total number of API errors",
        labelNames: ["service", "endpoint", "error_type"],
      }),

      activeUsers: new prometheus.Gauge({
        name: "active_users",
        help: "Number of currently active users",
      }),

      jobDuration: new prometheus.Histogram({
        name: "job_duration_seconds",
        help: "Duration of background jobs in seconds",
        labelNames: ["job_type"],
        buckets: [1, 5, 15, 30, 60, 120],
      }),

      databaseQueryDuration: new prometheus.Histogram({
        name: "database_query_duration_seconds",
        help: "Duration of database queries in seconds",
        labelNames: ["operation", "collection"],
        buckets: [0.01, 0.05, 0.1, 0.5, 1],
      }),

      cacheHitRatio: new prometheus.Gauge({
        name: "cache_hit_ratio",
        help: "Cache hit ratio",
        labelNames: ["cache_type"],
      }),

      apiRateLimit: new prometheus.Counter({
        name: "api_rate_limit_hits_total",
        help: "Total number of API rate limit hits",
        labelNames: ["endpoint"],
      }),
    };

    // Enable default metrics
    prometheus.collectDefaultMetrics();
  }

  recordHttpRequest(method, route, statusCode, duration) {
    this.metrics.httpRequestDuration
      .labels(method, route, statusCode)
      .observe(duration);
    this.metrics.httpRequestTotal.labels(method, route, statusCode).inc();
  }

  recordApiError(service, endpoint, errorType) {
    this.metrics.apiErrorsTotal.labels(service, endpoint, errorType).inc();
    logger.error(`API Error in ${service} at ${endpoint}: ${errorType}`);
  }

  updateActiveUsers(count) {
    this.metrics.activeUsers.set(count);
  }

  recordJobDuration(jobType, duration) {
    this.metrics.jobDuration.labels(jobType).observe(duration);
  }

  recordDatabaseQuery(operation, collection, duration) {
    this.metrics.databaseQueryDuration
      .labels(operation, collection)
      .observe(duration);
  }

  updateCacheHitRatio(cacheType, ratio) {
    this.metrics.cacheHitRatio.labels(cacheType).set(ratio);
  }

  recordRateLimit(endpoint) {
    this.metrics.apiRateLimit.labels(endpoint).inc();
  }

  async getMetrics() {
    try {
      return await prometheus.register.metrics();
    } catch (error) {
      logger.error("Error getting metrics:", error);
      throw error;
    }
  }

  async clearMetrics() {
    try {
      await prometheus.register.clear();
    } catch (error) {
      logger.error("Error clearing metrics:", error);
      throw error;
    }
  }
}

module.exports = new MonitoringService();
