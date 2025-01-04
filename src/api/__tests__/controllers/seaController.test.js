import { jest } from '@jest/globals';
import { SeaController } from '../../src/controllers/seaController.js';
import { GoogleAdsService } from '../../src/services/googleAdsService.js';

// Mock de GoogleAdsService
jest.mock('../../src/services/googleAdsService.js');

describe('SeaController', () => {
    let seaController;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Reset alle mocks voor elke test
        jest.clearAllMocks();

        // Maak een nieuwe controller instance
        seaController = new SeaController();

        // Mock request object
        mockReq = {
            params: {},
            body: {}
        };

        // Mock response object
        mockRes = {
            json: jest.fn()
        };

        // Mock next function
        mockNext = jest.fn();
    });

    describe('analyzeCampaign', () => {
        it('moet campagne analyseren en resultaat teruggeven', async () => {
            // Arrange
            const campaignId = '123';
            const expectedResult = {
                status: 'success',
                data: {
                    campaignId: campaignId,
                    analysis: 'Campagne analyse resultaat'
                }
            };

            mockReq.params.campaignId = campaignId;
            GoogleAdsService.prototype.analyzeCampaign.mockResolvedValue(expectedResult);

            // Act
            await seaController.analyzeCampaign(mockReq, mockRes, mockNext);

            // Assert
            expect(GoogleAdsService.prototype.analyzeCampaign).toHaveBeenCalledWith(campaignId);
            expect(mockRes.json).toHaveBeenCalledWith(expectedResult);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('moet errors doorgeven aan de error handler', async () => {
            // Arrange
            const error = new Error('Test error');
            GoogleAdsService.prototype.analyzeCampaign.mockRejectedValue(error);

            // Act
            await seaController.analyzeCampaign(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe('getAdPerformance', () => {
        it('moet advertentie performance ophalen en teruggeven', async () => {
            // Arrange
            const adId = '456';
            const expectedResult = {
                status: 'success',
                data: {
                    adId: adId,
                    performance: {
                        clicks: 100,
                        impressions: 1000,
                        ctr: 0.1,
                        conversions: 10
                    }
                }
            };

            mockReq.params.adId = adId;
            GoogleAdsService.prototype.getAdPerformance.mockResolvedValue(expectedResult);

            // Act
            await seaController.getAdPerformance(mockReq, mockRes, mockNext);

            // Assert
            expect(GoogleAdsService.prototype.getAdPerformance).toHaveBeenCalledWith(adId);
            expect(mockRes.json).toHaveBeenCalledWith(expectedResult);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('moet errors doorgeven aan de error handler', async () => {
            // Arrange
            const error = new Error('Test error');
            GoogleAdsService.prototype.getAdPerformance.mockRejectedValue(error);

            // Act
            await seaController.getAdPerformance(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe('optimizeBudget', () => {
        it('moet budget optimaliseren en resultaat teruggeven', async () => {
            // Arrange
            const campaignId = '789';
            const expectedResult = {
                status: 'success',
                data: {
                    campaignId: campaignId,
                    recommendations: 'Budget optimalisatie aanbevelingen'
                }
            };

            mockReq.params.campaignId = campaignId;
            GoogleAdsService.prototype.optimizeBudget.mockResolvedValue(expectedResult);

            // Act
            await seaController.optimizeBudget(mockReq, mockRes, mockNext);

            // Assert
            expect(GoogleAdsService.prototype.optimizeBudget).toHaveBeenCalledWith(campaignId);
            expect(mockRes.json).toHaveBeenCalledWith(expectedResult);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('moet errors doorgeven aan de error handler', async () => {
            // Arrange
            const error = new Error('Test error');
            GoogleAdsService.prototype.optimizeBudget.mockRejectedValue(error);

            // Act
            await seaController.optimizeBudget(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });
});
