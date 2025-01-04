const express = require('express');
const fetch = require('node-fetch');
const winston = require('winston');
const promClient = require('prom-client');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/backlinks', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Backlink Schema
const backlinkSchema = new mongoose.Schema({
    domain: String,
    url: String,
    targetUrl: String,
    anchorText: String,
    firstSeen: Date,
    lastSeen: Date,
    doFollow: Boolean,
    domainRating: Number,
    trafficValue: Number,
    status: {
        type: String,
        enum: ['active', 'lost', 'new'],
        default: 'active'
    }
}, { timestamps: true });

const Backlink = mongoose.model('Backlink', backlinkSchema);

// Metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const backlinkCounter = new promClient.Counter({
    name: 'backlink_checks_total',
    help: 'Total number of backlink checks'
});
register.registerMetric(backlinkCounter);

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: '/app/data/error.log', level: 'error' }),
        new winston.transports.File({ filename: '/app/data/combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

class BacklinkMonitor {
    constructor() {
        this.apiKey = process.env.AHREFS_API_KEY;
        this.apiBase = 'https://apiv2.ahrefs.com';
    }

    async getBacklinks(domain) {
        try {
            const response = await fetch(`${this.apiBase}/v2/backlinks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    target: domain,
                    mode: 'domain',
                    limit: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const data = await response.json();
            return this.processBacklinks(data.backlinks, domain);
        } catch (error) {
            logger.error('Error fetching backlinks:', error);
            throw error;
        }
    }

    async processBacklinks(backlinks, domain) {
        const now = new Date();
        const processed = [];

        for (const link of backlinks) {
            const backlink = {
                domain: new URL(link.url).hostname,
                url: link.url,
                targetUrl: link.target_url,
                anchorText: link.anchor,
                firstSeen: link.first_seen,
                lastSeen: now,
                doFollow: !link.nofollow,
                domainRating: link.domain_rating,
                trafficValue: link.traffic_value
            };

            // Check if backlink already exists
            const existing = await Backlink.findOne({ url: backlink.url });
            
            if (existing) {
                existing.lastSeen = now;
                existing.status = 'active';
                await existing.save();
                processed.push(existing);
            } else {
                const newBacklink = new Backlink({
                    ...backlink,
                    status: 'new'
                });
                await newBacklink.save();
                processed.push(newBacklink);
            }
        }

        // Mark old backlinks as lost
        await Backlink.updateMany(
            {
                domain: domain,
                lastSeen: { $lt: now },
                status: 'active'
            },
            {
                $set: { status: 'lost' }
            }
        );

        return processed;
    }

    async getBacklinkMetrics(domain) {
        const metrics = {
            total: await Backlink.countDocuments({ domain }),
            active: await Backlink.countDocuments({ domain, status: 'active' }),
            lost: await Backlink.countDocuments({ domain, status: 'lost' }),
            new: await Backlink.countDocuments({ domain, status: 'new' }),
            doFollow: await Backlink.countDocuments({ domain, doFollow: true }),
            avgDomainRating: 0
        };

        const avgDR = await Backlink.aggregate([
            { $match: { domain } },
            { $group: { _id: null, avg: { $avg: '$domainRating' } } }
        ]);

        if (avgDR.length > 0) {
            metrics.avgDomainRating = Math.round(avgDR[0].avg * 10) / 10;
        }

        return metrics;
    }
}

const monitor = new BacklinkMonitor();

// Schedule daily backlink checks
cron.schedule('0 0 * * *', async () => {
    try {
        const domains = await Backlink.distinct('domain');
        for (const domain of domains) {
            await monitor.getBacklinks(domain);
            logger.info(`Scheduled check completed for ${domain}`);
        }
    } catch (error) {
        logger.error('Scheduled backlink check failed:', error);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// API Endpoints
app.post('/api/backlinks/check', async (req, res) => {
    try {
        const { domain } = req.body;
        
        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' });
        }
        
        backlinkCounter.inc();
        
        const backlinks = await monitor.getBacklinks(domain);
        const metrics = await monitor.getBacklinkMetrics(domain);
        
        res.json({ backlinks, metrics });
        
    } catch (error) {
        logger.error('Error in /api/backlinks/check:', error);
        res.status(500).json({ error: 'Failed to check backlinks' });
    }
});

app.get('/api/backlinks/:domain', async (req, res) => {
    try {
        const { domain } = req.params;
        const { status, page = 1, limit = 50 } = req.query;
        
        const query = { domain };
        if (status) {
            query.status = status;
        }
        
        const backlinks = await Backlink.find(query)
            .sort({ lastSeen: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
            
        const total = await Backlink.countDocuments(query);
        const metrics = await monitor.getBacklinkMetrics(domain);
        
        res.json({
            backlinks,
            metrics,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        logger.error('Error in /api/backlinks/:domain:', error);
        res.status(500).json({ error: 'Failed to fetch backlinks' });
    }
});

app.get('/api/backlinks/:domain/export', async (req, res) => {
    try {
        const { domain } = req.params;
        const { format = 'csv' } = req.query;
        
        const backlinks = await Backlink.find({ domain });
        
        if (format === 'csv') {
            const csv = backlinks.map(b => 
                `${b.url},${b.targetUrl},${b.anchorText},${b.status},${b.domainRating},${b.doFollow}`
            ).join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=backlinks-${domain}.csv`);
            res.send(csv);
        } else {
            res.json(backlinks);
        }
        
    } catch (error) {
        logger.error('Error in /api/backlinks/:domain/export:', error);
        res.status(500).json({ error: 'Failed to export backlinks' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    logger.info(`Backlink monitor service listening on port ${PORT}`);
});
