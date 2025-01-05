import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { SeoController } from "../../src/controllers/seoController";
import { KeywordService } from "../../src/services/keywordResearch";
import { ContentService } from "../../src/services/contentOptimization";
import { SeoAuditService } from "../../src/services/seoAudit";

// Mock services
jest.mock("../../src/services/keywordResearch");
jest.mock("../../src/services/contentOptimization");
jest.mock("../../src/services/seoAudit");

describe("SeoController", () => {
  let controller;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    controller = new SeoController();
    mockReq = {
      query: {},
      body: {},
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe("analyzeKeywords", () => {
    it("should correctly import and use KeywordService", async () => {
      const mockData = {
        query: "test keyword",
        language: "nl",
      };
      mockReq.body = mockData;

      const mockResults = {
        keywords: ["test", "keyword"],
      };

      KeywordService.prototype.analyzeKeywords.mockResolvedValue(mockResults);

      await controller.analyzeKeywords(mockReq, mockRes);

      expect(KeywordService.prototype.analyzeKeywords).toHaveBeenCalledWith(
        mockData,
      );
    });
  });

  describe("optimizeContent", () => {
    it("should correctly import and use ContentService", async () => {
      const mockData = {
        content: "test content",
        keywords: ["test"],
      };
      mockReq.body = mockData;

      const mockResults = {
        optimizedContent: "optimized test content",
      };

      ContentService.prototype.optimizeContent.mockResolvedValue(mockResults);

      await controller.optimizeContent(mockReq, mockRes);

      expect(ContentService.prototype.optimizeContent).toHaveBeenCalledWith(
        mockData,
      );
    });
  });
});
