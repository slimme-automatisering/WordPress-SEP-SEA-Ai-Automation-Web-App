import { logger } from "../utils/logger.js";
import fs from "fs/promises";
import path from "path";

export class XmlSitemapService {
  async generateSitemap(urls, outputPath = "public/sitemap.xml") {
    try {
      const xmljs = await import("xml-js");

      const sitemap = {
        _declaration: { _attributes: { version: "1.0", encoding: "utf-8" } },
        urlset: {
          _attributes: {
            xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
          },
          url: urls.map((url) => ({
            loc: { _text: url.loc },
            lastmod: { _text: url.lastmod || new Date().toISOString() },
            changefreq: { _text: url.changefreq || "weekly" },
            priority: { _text: url.priority || "0.8" },
          })),
        },
      };

      const xml = xmljs.js2xml(sitemap, { compact: true, spaces: 2 });

      // Zorg ervoor dat de directory bestaat
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Schrijf het XML bestand
      await fs.writeFile(outputPath, xml);

      logger.info(`Sitemap gegenereerd op ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error("Fout bij het genereren van de sitemap:", error);
      throw error;
    }
  }
}
