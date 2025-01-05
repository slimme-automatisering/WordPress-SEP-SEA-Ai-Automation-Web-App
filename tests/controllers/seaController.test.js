import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { SeaController } from "../../src/controllers/seaController";
import { GoogleAdsService } from "../../src/services/google-ads/googleAdsService";

// Mock services
jest.mock("../../src/services/google-ads/googleAdsService");

describe("SeaController", () => {
  let controller;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    controller = new SeaController();
    mockReq = {
      query: {},
      body: {},
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe("getCampaigns", () => {
    it("should correctly import and use GoogleAdsService", async () => {
      const mockData = {
        status: "ENABLED",
        dateRange: {
          startDate: "2025-01-01",
          endDate: "2025-01-31",
        },
      };
      mockReq.query = mockData;

      const mockResults = {
        campaigns: [{ id: 1, name: "Test Campaign" }],
      };

      GoogleAdsService.prototype.getCampaigns.mockResolvedValue(mockResults);

      await controller.getCampaigns(mockReq, mockRes);

      expect(GoogleAdsService.prototype.getCampaigns).toHaveBeenCalledWith(
        mockData,
      );
    });
  });
});
