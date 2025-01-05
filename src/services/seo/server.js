const express = require("express");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const winston = require("winston");
const promClient = require("prom-client");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());

// Metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const crawlCounter = new promClient.Counter({
  name: "crawl_requests_total",
  help: "Total number of crawl requests",
});
register.registerMetric(crawlCounter);

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

class SEOCrawler {
  async analyzePage(url) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle0" });

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Analyze meta tags
      const metaTags = this.analyzeMetaTags($);

      // Analyze headings
      const headings = this.analyzeHeadings($);

      // Analyze images
      const images = this.analyzeImages($);

      // Get page speed metrics
      const performance = await this.getPerformanceMetrics(page);

      // Analyze links
      const links = this.analyzeLinks($);

      // Mobile responsiveness check
      await page.setViewport({ width: 375, height: 812 });
      const mobileOptimized = await this.checkMobileOptimization(page);

      return {
        url,
        metaTags,
        headings,
        images,
        performance,
        links,
        mobileOptimized,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error analyzing page:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  analyzeMetaTags($) {
    return {
      title: $("title").text(),
      description: $('meta[name="description"]').attr("content"),
      keywords: $('meta[name="keywords"]').attr("content"),
      robots: $('meta[name="robots"]').attr("content"),
      canonical: $('link[rel="canonical"]').attr("href"),
      ogTags: {
        title: $('meta[property="og:title"]').attr("content"),
        description: $('meta[property="og:description"]').attr("content"),
        image: $('meta[property="og:image"]').attr("content"),
      },
    };
  }

  analyzeHeadings($) {
    const headings = {};
    ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
      headings[tag] = [];
      $(tag).each((i, elem) => {
        headings[tag].push($(elem).text().trim());
      });
    });
    return headings;
  }

  analyzeImages($) {
    const images = [];
    $("img").each((i, elem) => {
      images.push({
        src: $(elem).attr("src"),
        alt: $(elem).attr("alt"),
        width: $(elem).attr("width"),
        height: $(elem).attr("height"),
      });
    });
    return images;
  }

  async getPerformanceMetrics(page) {
    const metrics = await page.metrics();
    const performance = await page.evaluate(() => ({
      loadTime:
        window.performance.timing.loadEventEnd -
        window.performance.timing.navigationStart,
      domContentLoaded:
        window.performance.timing.domContentLoadedEventEnd -
        window.performance.timing.navigationStart,
    }));

    return {
      ...performance,
      jsHeapSize: metrics.JSHeapUsedSize,
      domNodes: metrics.Nodes,
    };
  }

  analyzeLinks($) {
    const links = {
      internal: [],
      external: [],
      broken: [],
    };

    $("a").each((i, elem) => {
      const href = $(elem).attr("href");
      if (!href) return;

      if (href.startsWith("http")) {
        links.external.push(href);
      } else {
        links.internal.push(href);
      }
    });

    return links;
  }

  async checkMobileOptimization(page) {
    return {
      viewport: await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
      })),
      hasMobileViewport: await page.evaluate(() => {
        return !!document.querySelector('meta[name="viewport"]');
      }),
      touchable: await page.evaluate(() => {
        const links = document.querySelectorAll("a");
        let tooClose = 0;

        for (let i = 0; i < links.length; i++) {
          const rect = links[i].getBoundingClientRect();
          if (rect.width < 48 || rect.height < 48) {
            tooClose++;
          }
        }

        return {
          smallTouchTargets: tooClose,
          totalLinks: links.length,
        };
      }),
    };
  }
}

const crawler = new SEOCrawler();

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Main crawl endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    crawlCounter.inc();

    const analysis = await crawler.analyzePage(url);
    res.json(analysis);
  } catch (error) {
    logger.error("Error in /api/analyze:", error);
    res.status(500).json({ error: "Failed to analyze page" });
  }
});

// Bulk analysis endpoint
app.post("/api/analyze/bulk", async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: "URLs array is required" });
    }

    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          crawlCounter.inc();
          return await crawler.analyzePage(url);
        } catch (error) {
          logger.error(`Error analyzing ${url}:`, error);
          return { url, error: "Failed to analyze page" };
        }
      }),
    );

    res.json({ results });
  } catch (error) {
    logger.error("Error in /api/analyze/bulk:", error);
    res.status(500).json({ error: "Failed to process bulk analysis" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`SEO Crawler service listening on port ${PORT}`);
});
