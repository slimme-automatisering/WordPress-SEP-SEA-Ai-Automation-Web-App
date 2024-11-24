import { google } from 'google-ads-api';
import logger from '../utils/logger.js';
import AppError from '../utils/errorHandler.js';

const client = new google({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
});

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await client.campaigns.list({
      customer_id: req.user.googleAdsId
    });
    
    res.json(campaigns);
  } catch (error) {
    logger.error('Google Ads API error:', error);
    throw new AppError('Fout bij ophalen campagnes', 500);
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { name, budget, keywords } = req.body;
    
    const campaign = await client.campaigns.create({
      customer_id: req.user.googleAdsId,
      name,
      budget,
      keywords
    });

    res.status(201).json(campaign);
  } catch (error) {
    logger.error('Campaign creation error:', error);
    throw new AppError('Fout bij aanmaken campagne', 500);
  }
};

export const getMetrics = async (req, res) => {
  try {
    const metrics = await client.reports.generate({
      customer_id: req.user.googleAdsId,
      metrics: ['clicks', 'impressions', 'ctr', 'average_cpc'],
      date_range: req.query.dateRange || 'LAST_30_DAYS'
    });

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics fetch error:', error);
    throw new AppError('Fout bij ophalen metrics', 500);
  }
}; 