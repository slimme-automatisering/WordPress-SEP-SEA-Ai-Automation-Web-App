import { jest } from '@jest/globals';
import { SeoController } from '../../src/controllers/seoController.js';
import { KeywordService } from '../../src/services/keywordService.js';

// Mock de KeywordService
jest.mock('../../src/services/keywordService.js');

describe('SeoController', () => {
    let seoController;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Reset alle mocks voor elke test
        jest.clearAllMocks();

        // Maak een nieuwe controller instance
        seoController = new SeoController();

        // Mock request object
        mockReq = {
            body: {},
            query: {}
        };

        // Mock response object
        mockRes = {
            json: jest.fn()
        };

        // Mock next function
        mockNext = jest.fn();
    });

    describe('analyzeKeywords', () => {
        it('moet keywords analyseren en resultaat teruggeven', async () => {
            // Arrange
            const keywords = ['test', 'keyword'];
            const expectedResult = {
                status: 'success',
                data: {
                    keywords: keywords,
                    analysis: 'Keyword analyse resultaat'
                }
            };

            mockReq.body.keywords = keywords;
            KeywordService.prototype.analyzeKeywords.mockResolvedValue(expectedResult);

            // Act
            await seoController.analyzeKeywords(mockReq, mockRes, mockNext);

            // Assert
            expect(KeywordService.prototype.analyzeKeywords).toHaveBeenCalledWith(keywords);
            expect(mockRes.json).toHaveBeenCalledWith(expectedResult);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('moet errors doorgeven aan de error handler', async () => {
            // Arrange
            const error = new Error('Test error');
            KeywordService.prototype.analyzeKeywords.mockRejectedValue(error);

            // Act
            await seoController.analyzeKeywords(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe('getKeywordSuggestions', () => {
        it('moet keyword suggesties ophalen en teruggeven', async () => {
            // Arrange
            const keyword = 'test';
            const expectedResult = {
                status: 'success',
                data: {
                    keyword: keyword,
                    suggestions: ['suggestie1', 'suggestie2']
                }
            };

            mockReq.query.keyword = keyword;
            KeywordService.prototype.getSuggestions.mockResolvedValue(expectedResult);

            // Act
            await seoController.getKeywordSuggestions(mockReq, mockRes, mockNext);

            // Assert
            expect(KeywordService.prototype.getSuggestions).toHaveBeenCalledWith(keyword);
            expect(mockRes.json).toHaveBeenCalledWith(expectedResult);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('moet errors doorgeven aan de error handler', async () => {
            // Arrange
            const error = new Error('Test error');
            KeywordService.prototype.getSuggestions.mockRejectedValue(error);

            // Act
            await seoController.getKeywordSuggestions(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });
});
