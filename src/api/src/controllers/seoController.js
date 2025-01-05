const { KeywordService } = require("../services/keywordService.js");

class SeoController {
  constructor() {
    this.keywordService = new KeywordService();
  }

  // Keyword analyse endpoint
  async analyzeKeywords(req, res, next) {
    try {
      const { keywords } = req.body;
      const result = await this.keywordService.analyzeKeywords(keywords);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Keyword suggesties endpoint
  async getKeywordSuggestions(req, res, next) {
    try {
      const { keyword } = req.query;
      const result = await this.keywordService.getSuggestions(keyword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

// Exporteer een singleton instance
module.exports = new SeoController();
