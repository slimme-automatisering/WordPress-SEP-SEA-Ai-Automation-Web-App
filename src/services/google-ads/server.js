const express = require('express');
const { GoogleAdsApi } = require('google-ads-api');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3006;

// Logger configuratie
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// MongoDB connectie
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'google_ads';
let db;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100 // limiet per IP
});
app.use(limiter);

// Google Ads client class
class GoogleAdsClient {
  constructor(clientId, clientSecret, developerToken, refreshToken, loginCustomerId) {
    this.client = new GoogleAdsApi({
      client_id: clientId,
      client_secret: clientSecret,
      developer_token: developerToken
    });

    this.customer = this.client.Customer({
      customer_id: loginCustomerId,
      refresh_token: refreshToken
    });
  }

  async getCampaigns(customerId) {
    try {
      const campaigns = await this.customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.start_date,
          campaign.end_date,
          campaign.budget_amount_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `);
      return campaigns;
    } catch (error) {
      logger.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  async getAdGroups(customerId, campaignId) {
    try {
      const adGroups = await this.customer.query(`
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.status,
          ad_group.type,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM ad_group
        WHERE campaign.id = ${campaignId}
        ORDER BY ad_group.name
      `);
      return adGroups;
    } catch (error) {
      logger.error('Error fetching ad groups:', error);
      throw error;
    }
  }

  async getAds(customerId, adGroupId) {
    try {
      const ads = await this.customer.query(`
        SELECT
          ad_group_ad.ad.id,
          ad_group_ad.ad.name,
          ad_group_ad.status,
          ad_group_ad.ad.final_urls,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM ad_group_ad
        WHERE ad_group.id = ${adGroupId}
        ORDER BY metrics.impressions DESC
      `);
      return ads;
    } catch (error) {
      logger.error('Error fetching ads:', error);
      throw error;
    }
  }

  async getKeywords(customerId, adGroupId) {
    try {
      const keywords = await this.customer.query(`
        SELECT
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM ad_group_criterion
        WHERE ad_group.id = ${adGroupId}
        AND ad_group_criterion.type = 'KEYWORD'
        ORDER BY metrics.impressions DESC
      `);
      return keywords;
    } catch (error) {
      logger.error('Error fetching keywords:', error);
      throw error;
    }
  }

  async createCampaign(customerId, campaignData) {
    try {
      const operation = {
        create: {
          name: campaignData.name,
          status: campaignData.status,
          campaign_budget: campaignData.budget,
          advertising_channel_type: campaignData.channelType,
          start_date: campaignData.startDate,
          end_date: campaignData.endDate
        }
      };

      const response = await this.customer.campaignOperations.create([operation]);
      return response;
    } catch (error) {
      logger.error('Error creating campaign:', error);
      throw error;
    }
  }

  async updateCampaign(customerId, campaignId, campaignData) {
    try {
      const operation = {
        update: {
          resource_name: `customers/${customerId}/campaigns/${campaignId}`,
          ...campaignData
        },
        update_mask: {
          paths: Object.keys(campaignData)
        }
      };

      const response = await this.customer.campaignOperations.update([operation]);
      return response;
    } catch (error) {
      logger.error('Error updating campaign:', error);
      throw error;
    }
  }

  async createAdGroup(customerId, campaignId, adGroupData) {
    try {
      const operation = {
        create: {
          campaign: `customers/${customerId}/campaigns/${campaignId}`,
          name: adGroupData.name,
          status: adGroupData.status,
          type: adGroupData.type
        }
      };

      const response = await this.customer.adGroupOperations.create([operation]);
      return response;
    } catch (error) {
      logger.error('Error creating ad group:', error);
      throw error;
    }
  }

  async createAd(customerId, adGroupId, adData) {
    try {
      const operation = {
        create: {
          ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
          ad: {
            responsive_search_ad: {
              headlines: adData.headlines,
              descriptions: adData.descriptions
            },
            final_urls: adData.finalUrls
          }
        }
      };

      const response = await this.customer.adGroupAdOperations.create([operation]);
      return response;
    } catch (error) {
      logger.error('Error creating ad:', error);
      throw error;
    }
  }

  async getMetrics(customerId, dateRange) {
    try {
      const metrics = await this.customer.query(`
        SELECT
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversion_value,
          metrics.average_cpc,
          metrics.ctr,
          metrics.conversion_rate
        FROM customer
        WHERE segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      `);
      return metrics;
    } catch (error) {
      logger.error('Error fetching metrics:', error);
      throw error;
    }
  }

  async getBudgetRecommendations(customerId, campaignId) {
    try {
      const recommendations = await this.customer.query(`
        SELECT
          recommendation.campaign_budget_recommendation.recommended_budget_amount_micros,
          recommendation.campaign_budget_recommendation.current_budget_amount_micros
        FROM recommendation
        WHERE campaign.id = ${campaignId}
        AND recommendation.type = 'CAMPAIGN_BUDGET'
      `);
      return recommendations;
    } catch (error) {
      logger.error('Error fetching budget recommendations:', error);
      throw error;
    }
  }

  // Budget Management
  async getBudgetInfo(customerId, campaignId) {
    try {
      const budget = await this.customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign_budget.amount_micros,
          campaign_budget.total_amount_micros,
          campaign_budget.status,
          campaign_budget.delivery_method,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value
        FROM campaign
        WHERE campaign.id = ${campaignId}
      `);
      return budget;
    } catch (error) {
      logger.error('Error fetching budget info:', error);
      throw error;
    }
  }

  async updateBudget(customerId, campaignId, budgetData) {
    try {
      const operation = {
        update: {
          resource_name: `customers/${customerId}/campaignBudgets/${campaignId}`,
          ...budgetData
        },
        update_mask: {
          paths: Object.keys(budgetData)
        }
      };

      const response = await this.customer.campaignBudgetOperations.update([operation]);
      return response;
    } catch (error) {
      logger.error('Error updating budget:', error);
      throw error;
    }
  }

  // A/B Testing
  async createExperiment(customerId, experimentData) {
    try {
      const operation = {
        create: {
          name: experimentData.name,
          type: experimentData.type,
          status: experimentData.status,
          start_date: experimentData.startDate,
          end_date: experimentData.endDate,
          description: experimentData.description
        }
      };

      const response = await this.customer.experimentOperations.create([operation]);
      return response;
    } catch (error) {
      logger.error('Error creating experiment:', error);
      throw error;
    }
  }

  async getExperiments(customerId) {
    try {
      const experiments = await this.customer.query(`
        SELECT
          experiment.resource_name,
          experiment.name,
          experiment.type,
          experiment.status,
          experiment.start_date,
          experiment.end_date,
          experiment.description,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM experiment
        ORDER BY experiment.start_date DESC
      `);
      return experiments;
    } catch (error) {
      logger.error('Error fetching experiments:', error);
      throw error;
    }
  }

  // Campaign Automation
  async createRule(customerId, ruleData) {
    try {
      // Implementeer custom regels voor campagne automatisering
      const rule = {
        name: ruleData.name,
        conditions: ruleData.conditions,
        actions: ruleData.actions,
        schedule: ruleData.schedule
      };

      await db.collection('automation_rules').insertOne({
        customerId,
        ...rule,
        createdAt: new Date()
      });

      return rule;
    } catch (error) {
      logger.error('Error creating automation rule:', error);
      throw error;
    }
  }

  async getRules(customerId) {
    try {
      return await db.collection('automation_rules')
        .find({ customerId })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      logger.error('Error fetching automation rules:', error);
      throw error;
    }
  }

  async executeRule(customerId, ruleId) {
    try {
      const rule = await db.collection('automation_rules').findOne({
        customerId,
        _id: ruleId
      });

      if (!rule) {
        throw new Error('Rule not found');
      }

      // Implementeer rule execution logic
      const results = await this.applyRuleActions(rule);
      
      // Log rule execution
      await db.collection('rule_executions').insertOne({
        ruleId,
        customerId,
        results,
        executedAt: new Date()
      });

      return results;
    } catch (error) {
      logger.error('Error executing automation rule:', error);
      throw error;
    }
  }

  // ROI Calculator
  async calculateROI(customerId, campaignId, dateRange) {
    try {
      const metrics = await this.customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.clicks,
          metrics.impressions
        FROM campaign
        WHERE campaign.id = ${campaignId}
        AND segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      `);

      const totalCost = metrics.reduce((sum, m) => sum + m.metrics.cost_micros, 0) / 1000000;
      const totalValue = metrics.reduce((sum, m) => sum + m.metrics.conversions_value, 0);
      const roi = ((totalValue - totalCost) / totalCost) * 100;

      return {
        campaign: metrics[0].campaign,
        metrics: {
          cost: totalCost,
          value: totalValue,
          roi: roi,
          conversions: metrics.reduce((sum, m) => sum + m.metrics.conversions, 0),
          clicks: metrics.reduce((sum, m) => sum + m.metrics.clicks, 0),
          impressions: metrics.reduce((sum, m) => sum + m.metrics.impressions, 0)
        }
      };
    } catch (error) {
      logger.error('Error calculating ROI:', error);
      throw error;
    }
  }
}

// Routes
app.post('/api/google-ads/connect', async (req, res) => {
  try {
    const { clientId, clientSecret, developerToken, refreshToken, loginCustomerId } = req.body;
    
    const client = new GoogleAdsClient(
      clientId,
      clientSecret,
      developerToken,
      refreshToken,
      loginCustomerId
    );
    
    // Test de connectie
    await client.getCampaigns(loginCustomerId);
    
    // Sla de connectie gegevens op in MongoDB
    await db.collection('google_ads_connections').updateOne(
      { loginCustomerId },
      {
        $set: {
          clientId,
          clientSecret,
          developerToken,
          refreshToken,
          lastConnected: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ success: true, message: 'Verbinding succesvol' });
  } catch (error) {
    logger.error('Connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/google-ads/:customerId/campaigns', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const connection = await db.collection('google_ads_connections').findOne(
      { loginCustomerId: customerId }
    );
    
    if (!connection) {
      return res.status(404).json({ error: 'Google Ads account niet gevonden' });
    }

    const client = new GoogleAdsClient(
      connection.clientId,
      connection.clientSecret,
      connection.developerToken,
      connection.refreshToken,
      connection.loginCustomerId
    );

    const campaigns = await client.getCampaigns(customerId);
    res.json(campaigns);
  } catch (error) {
    logger.error('Error fetching campaigns:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/google-ads/:customerId/campaigns', async (req, res) => {
  try {
    const { customerId } = req.params;
    const campaignData = req.body;
    
    const connection = await db.collection('google_ads_connections').findOne(
      { loginCustomerId: customerId }
    );
    
    if (!connection) {
      return res.status(404).json({ error: 'Google Ads account niet gevonden' });
    }

    const client = new GoogleAdsClient(
      connection.clientId,
      connection.clientSecret,
      connection.developerToken,
      connection.refreshToken,
      connection.loginCustomerId
    );

    const campaign = await client.createCampaign(customerId, campaignData);
    res.json(campaign);
  } catch (error) {
    logger.error('Error creating campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/google-ads/:customerId/campaigns/:campaignId/adgroups', async (req, res) => {
  try {
    const { customerId, campaignId } = req.params;
    
    const connection = await db.collection('google_ads_connections').findOne(
      { loginCustomerId: customerId }
    );
    
    if (!connection) {
      return res.status(404).json({ error: 'Google Ads account niet gevonden' });
    }

    const client = new GoogleAdsClient(
      connection.clientId,
      connection.clientSecret,
      connection.developerToken,
      connection.refreshToken,
      connection.loginCustomerId
    );

    const adGroups = await client.getAdGroups(customerId, campaignId);
    res.json(adGroups);
  } catch (error) {
    logger.error('Error fetching ad groups:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/google-ads/:customerId/adgroups/:adGroupId/ads', async (req, res) => {
  try {
    const { customerId, adGroupId } = req.params;
    
    const connection = await db.collection('google_ads_connections').findOne(
      { loginCustomerId: customerId }
    );
    
    if (!connection) {
      return res.status(404).json({ error: 'Google Ads account niet gevonden' });
    }

    const client = new GoogleAdsClient(
      connection.clientId,
      connection.clientSecret,
      connection.developerToken,
      connection.refreshToken,
      connection.loginCustomerId
    );

    const ads = await client.getAds(customerId, adGroupId);
    res.json(ads);
  } catch (error) {
    logger.error('Error fetching ads:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/google-ads/:customerId/metrics', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { startDate, endDate } = req.query;
    
    const connection = await db.collection('google_ads_connections').findOne(
      { loginCustomerId: customerId }
    );
    
    if (!connection) {
      return res.status(404).json({ error: 'Google Ads account niet gevonden' });
    }

    const client = new GoogleAdsClient(
      connection.clientId,
      connection.clientSecret,
      connection.developerToken,
      connection.refreshToken,
      connection.loginCustomerId
    );

    const metrics = await client.getMetrics(customerId, { startDate, endDate });
    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Budget Management Routes
app.get('/api/google-ads/:customerId/campaigns/:campaignId/budget', async (req, res) => {
  try {
    const { customerId, campaignId } = req.params;
    const client = await getGoogleAdsClient(customerId);
    const budget = await client.getBudgetInfo(customerId, campaignId);
    res.json(budget);
  } catch (error) {
    logger.error('Error in budget endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/google-ads/:customerId/campaigns/:campaignId/budget', async (req, res) => {
  try {
    const { customerId, campaignId } = req.params;
    const client = await getGoogleAdsClient(customerId);
    const response = await client.updateBudget(customerId, campaignId, req.body);
    res.json(response);
  } catch (error) {
    logger.error('Error updating budget:', error);
    res.status(500).json({ error: error.message });
  }
});

// A/B Testing Routes
app.post('/api/google-ads/:customerId/experiments', async (req, res) => {
  try {
    const { customerId } = req.params;
    const client = await getGoogleAdsClient(customerId);
    const experiment = await client.createExperiment(customerId, req.body);
    res.json(experiment);
  } catch (error) {
    logger.error('Error creating experiment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/google-ads/:customerId/experiments', async (req, res) => {
  try {
    const { customerId } = req.params;
    const client = await getGoogleAdsClient(customerId);
    const experiments = await client.getExperiments(customerId);
    res.json(experiments);
  } catch (error) {
    logger.error('Error fetching experiments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Campaign Automation Routes
app.post('/api/google-ads/:customerId/automation/rules', async (req, res) => {
  try {
    const { customerId } = req.params;
    const client = await getGoogleAdsClient(customerId);
    const rule = await client.createRule(customerId, req.body);
    res.json(rule);
  } catch (error) {
    logger.error('Error creating automation rule:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/google-ads/:customerId/automation/rules', async (req, res) => {
  try {
    const { customerId } = req.params;
    const client = await getGoogleAdsClient(customerId);
    const rules = await client.getRules(customerId);
    res.json(rules);
  } catch (error) {
    logger.error('Error fetching automation rules:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/google-ads/:customerId/automation/rules/:ruleId/execute', async (req, res) => {
  try {
    const { customerId, ruleId } = req.params;
    const client = await getGoogleAdsClient(customerId);
    const results = await client.executeRule(customerId, ruleId);
    res.json(results);
  } catch (error) {
    logger.error('Error executing automation rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// ROI Calculator Route
app.get('/api/google-ads/:customerId/campaigns/:campaignId/roi', async (req, res) => {
  try {
    const { customerId, campaignId } = req.params;
    const { startDate, endDate } = req.query;
    const client = await getGoogleAdsClient(customerId);
    const roi = await client.calculateROI(customerId, campaignId, { startDate, endDate });
    res.json(roi);
  } catch (error) {
    logger.error('Error calculating ROI:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB connectie en server start
MongoClient.connect(mongoUrl)
  .then(client => {
    db = client.db(dbName);
    logger.info('Connected to MongoDB');
    
    app.listen(port, () => {
      logger.info(`Google Ads integration service running on port ${port}`);
    });
  })
  .catch(error => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Helper function to get Google Ads client
async function getGoogleAdsClient(customerId) {
  const connection = await db.collection('google_ads_connections').findOne(
    { loginCustomerId: customerId }
  );
  
  if (!connection) {
    throw new Error('Google Ads account niet gevonden');
  }

  return new GoogleAdsClient(
    connection.clientId,
    connection.clientSecret,
    connection.developerToken,
    connection.refreshToken,
    connection.loginCustomerId
  );
}
