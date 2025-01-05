const { describe, it, expect, beforeEach, jest } = require("@jest/globals");
const WooCommerceService = require("../../src/services/wooCommerceService");

describe("WooCommerceService", () => {
  let wooCommerceService;
  let mockWooApi;

  beforeEach(() => {
    mockWooApi = {
      get: jest.fn(),
      post: jest.fn(),
    };
    wooCommerceService = new WooCommerceService(mockWooApi);
  });

  describe("getOrders", () => {
    it("moet orders ophalen", async () => {
      const mockOrders = [{ id: 1 }];
      mockWooApi.get.mockResolvedValue({ data: mockOrders });

      const result = await wooCommerceService.getOrders();
      expect(result).toEqual(mockOrders);
    });
  });
});
