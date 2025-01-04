const { GoogleAdsService } = require('../services/googleAdsService.js');

class SeaController {
    constructor() {
        this.googleAdsService = new GoogleAdsService();
    }

    // Campagne analyse endpoint
    async analyzeCampaign(req, res, next) {
        try {
            const { campaignId } = req.params;
            const result = await this.googleAdsService.analyzeCampaign(campaignId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Advertentie performance endpoint
    async getAdPerformance(req, res, next) {
        try {
            const { adId } = req.params;
            const result = await this.googleAdsService.getAdPerformance(adId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Budget optimalisatie endpoint
    async optimizeBudget(req, res, next) {
        try {
            const { campaignId } = req.params;
            const result = await this.googleAdsService.optimizeBudget(campaignId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

// Exporteer een singleton instance
module.exports = new SeaController();
