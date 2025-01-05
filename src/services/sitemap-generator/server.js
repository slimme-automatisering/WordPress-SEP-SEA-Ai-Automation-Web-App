const express = require("express");
const { SitemapStream, streamToPromise } = require("sitemap");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const winston = require("winston");
const promClient = require("prom-client");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoose = require("mongoose");
const cron = require("node-cron");
const { createGzip } = require("zlib");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());

// MongoDB setup
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://mongodb:27017/sitemaps",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);

// URL Schema
const urlSchema = new mongoose.Schema(
  {
    domain: String,
    url: String,
    lastmod: Date,
    changefreq: String,
    priority: Number,
    status: Number,
    lastChecked: Date,
  },
  { timestamps: true },
);

const URL = mongoose.model("URL", urlSchema);

// Metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const sitemapCounter = new promClient.Counter({
  name: "sitemap_generations_total",
  help: "Total number of sitemap generations",
});
register.registerMetric(sitemapCounter);

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "/app/data/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "/app/data/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

class SitemapGenerator {
  constructor() {
    this.visitedUrls = new Set();
  }

  async crawlSite(domain, maxUrls = 50000) {
    this.visitedUrls.clear();
    const startUrl = domain.startsWith("http") ? domain : `https://${domain}`;

    try {
      await this.crawlPage(startUrl, domain, maxUrls);
    } catch (error) {
      logger.error(`Error crawling site ${domain}:`, error);
      throw error;
    }
  }

  async crawlPage(url, domain, maxUrls) {
    if (this.visitedUrls.size >= maxUrls) return;
    if (this.visitedUrls.has(url)) return;

    this.visitedUrls.add(url);

    try {
      const response = await fetch(url);
      const status = response.status;
      const html = await response.text();
      const $ = cheerio.load(html);

      // Save or update URL in database
      await URL.findOneAndUpdate(
        { url },
        {
          domain,
          url,
          lastmod: new Date(),
          changefreq: this.determineChangeFreq(url),
          priority: this.determinePriority(url),
          status,
          lastChecked: new Date(),
        },
        { upsert: true },
      );

      // Find all links
      const links = $("a[href]")
        .map((i, el) => $(el).attr("href"))
        .get()
        .filter((href) => this.isValidUrl(href, domain))
        .map((href) => this.normalizeUrl(href, domain));

      // Recursively crawl found URLs
      for (const link of links) {
        await this.crawlPage(link, domain, maxUrls);
      }
    } catch (error) {
      logger.error(`Error crawling ${url}:`, error);
    }
  }

  isValidUrl(url, domain) {
    if (!url) return false;
    if (url.startsWith("#")) return false;
    if (url.startsWith("mailto:")) return false;
    if (url.startsWith("tel:")) return false;

    try {
      const parsed = new URL(url, `https://${domain}`);
      return parsed.hostname === domain;
    } catch {
      return false;
    }
  }

  normalizeUrl(url, domain) {
    try {
      const parsed = new URL(url, `https://${domain}`);
      return parsed.href;
    } catch {
      return url;
    }
  }

  determineChangeFreq(url) {
    if (url.includes("blog") || url.includes("news")) {
      return "daily";
    }
    if (url.includes("product")) {
      return "weekly";
    }
    return "monthly";
  }

  determinePriority(url) {
    if (url.endsWith("/")) return 1.0;
    if (url.includes("product")) return 0.8;
    if (url.includes("category")) return 0.7;
    if (url.includes("blog")) return 0.6;
    return 0.5;
  }

  async generateSitemap(domain) {
    try {
      const urls = await URL.find({
        domain,
        status: 200,
      }).sort({ priority: -1 });

      const smStream = new SitemapStream({ hostname: `https://${domain}` });
      const pipeline = smStream.pipe(createGzip());

      for (const url of urls) {
        smStream.write({
          url: url.url,
          lastmod: url.lastmod,
          changefreq: url.changefreq,
          priority: url.priority,
        });
      }

      smStream.end();
      const data = await streamToPromise(pipeline);

      return {
        sitemap: data,
        stats: {
          totalUrls: urls.length,
          lastGenerated: new Date(),
        },
      };
    } catch (error) {
      logger.error(`Error generating sitemap for ${domain}:`, error);
      throw error;
    }
  }
}

const generator = new SitemapGenerator();

// Schedule weekly sitemap updates
cron.schedule("0 0 * * 0", async () => {
  try {
    const domains = await URL.distinct("domain");
    for (const domain of domains) {
      await generator.crawlSite(domain);
      await generator.generateSitemap(domain);
      logger.info(`Scheduled sitemap update completed for ${domain}`);
    }
  } catch (error) {
    logger.error("Scheduled sitemap update failed:", error);
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// API Endpoints
app.post("/api/sitemap/generate", async (req, res) => {
  try {
    const { domain, crawl = false } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Domain is required" });
    }

    sitemapCounter.inc();

    if (crawl) {
      await generator.crawlSite(domain);
    }

    const result = await generator.generateSitemap(domain);

    res.header("Content-Type", "application/xml");
    res.header("Content-Encoding", "gzip");
    res.send(result.sitemap);
  } catch (error) {
    logger.error("Error in /api/sitemap/generate:", error);
    res.status(500).json({ error: "Failed to generate sitemap" });
  }
});

app.get("/api/sitemap/:domain/urls", async (req, res) => {
  try {
    const { domain } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    const query = { domain };
    if (status) {
      query.status = parseInt(status);
    }

    const urls = await URL.find(query)
      .sort({ priority: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await URL.countDocuments(query);

    res.json({
      urls,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error("Error in /api/sitemap/:domain/urls:", error);
    res.status(500).json({ error: "Failed to fetch URLs" });
  }
});

app.get("/api/sitemap/:domain/stats", async (req, res) => {
  try {
    const { domain } = req.params;

    const stats = {
      total: await URL.countDocuments({ domain }),
      ok: await URL.countDocuments({ domain, status: 200 }),
      broken: await URL.countDocuments({ domain, status: { $ne: 200 } }),
      lastCrawled: await URL.findOne({ domain })
        .sort({ lastChecked: -1 })
        .select("lastChecked"),
    };

    res.json(stats);
  } catch (error) {
    logger.error("Error in /api/sitemap/:domain/stats:", error);
    res.status(500).json({ error: "Failed to fetch sitemap stats" });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  logger.info(`Sitemap generator service listening on port ${PORT}`);
});
