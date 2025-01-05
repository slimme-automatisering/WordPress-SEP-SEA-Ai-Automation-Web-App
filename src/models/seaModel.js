import mongoose from "mongoose";
import { BaseModel } from "./baseModel.js";

const keywordSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  matchType: {
    type: String,
    enum: ["exact", "phrase", "broad"],
    required: true,
  },
  bid: {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "EUR",
    },
    strategy: {
      type: String,
      enum: ["manual", "auto"],
      default: "manual",
    },
  },
  performance: {
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ["active", "paused", "removed"],
    default: "active",
  },
});

const adSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "responsive", "image"],
    required: true,
  },
  headline: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  path: {
    type: String,
    trim: true,
  },
  finalUrl: {
    type: String,
    required: true,
    trim: true,
  },
  assets: {
    images: [
      {
        url: String,
        size: String,
      },
    ],
    videos: [
      {
        url: String,
        duration: Number,
      },
    ],
  },
  performance: {
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ["active", "paused", "removed"],
    default: "active",
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    dayParting: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        hours: [
          {
            start: String,
            end: String,
          },
        ],
      },
    ],
  },
});

const adGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "paused", "removed"],
    default: "active",
  },
  keywords: [keywordSchema],
  ads: [adSchema],
  targeting: {
    locations: [
      {
        type: String,
        trim: true,
      },
    ],
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    devices: [
      {
        type: String,
        enum: ["mobile", "tablet", "desktop"],
      },
    ],
    audiences: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  bidding: {
    strategy: {
      type: String,
      enum: [
        "manual",
        "maximize_clicks",
        "maximize_conversions",
        "target_roas",
      ],
      default: "manual",
    },
    adjustments: {
      device: [
        {
          type: String,
          modifier: Number,
        },
      ],
      location: [
        {
          type: String,
          modifier: Number,
        },
      ],
      audience: [
        {
          type: String,
          modifier: Number,
        },
      ],
    },
  },
  performance: {
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
  },
});

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["search", "display", "shopping"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "paused", "removed"],
    default: "active",
  },
  budget: {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "EUR",
    },
    type: {
      type: String,
      enum: ["daily", "monthly"],
      default: "daily",
    },
  },
  bidding: {
    strategy: {
      type: String,
      enum: [
        "manual",
        "maximize_clicks",
        "maximize_conversions",
        "target_roas",
      ],
      default: "manual",
    },
    targetRoas: Number,
    maxCpc: Number,
  },
  targeting: {
    network: {
      search: Boolean,
      display: Boolean,
      partner: Boolean,
    },
    locations: [
      {
        type: String,
        trim: true,
      },
    ],
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    schedule: {
      startDate: Date,
      endDate: Date,
      timezone: String,
      dayParting: [
        {
          day: {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
          hours: [
            {
              start: String,
              end: String,
            },
          ],
        },
      ],
    },
  },
  tracking: {
    urlParameters: [
      {
        key: String,
        value: String,
      },
    ],
    conversionTracking: {
      enabled: Boolean,
      id: String,
    },
  },
  adGroups: [adGroupSchema],
  performance: {
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
  },
});

// Schema definitie
const schema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  platform: {
    type: String,
    enum: ["google", "bing", "facebook"],
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  campaigns: [campaignSchema],
  settings: {
    budget: {
      monthly: {
        amount: Number,
        currency: String,
      },
      alerts: {
        threshold: Number,
        email: String,
      },
    },
    automation: {
      bidding: {
        enabled: Boolean,
        strategy: String,
        rules: [
          {
            condition: String,
            action: String,
            value: Number,
          },
        ],
      },
      scheduling: {
        enabled: Boolean,
        timezone: String,
        rules: [
          {
            type: String,
            schedule: String,
            action: String,
          },
        ],
      },
    },
    notifications: {
      performance: {
        type: Boolean,
        default: true,
      },
      budget: {
        type: Boolean,
        default: true,
      },
      changes: {
        type: Boolean,
        default: true,
      },
    },
  },
});

// Indexes
schema.index({ projectId: 1, platform: 1, accountId: 1 }, { unique: true });
schema.index({ "campaigns.name": 1 });
schema.index({ "campaigns.adGroups.name": 1 });
schema.index({ "campaigns.adGroups.keywords.text": 1 });

export class SeaModel extends BaseModel {
  constructor() {
    super("Sea", schema);
  }

  /**
   * Voeg campagne toe
   */
  async addCampaign(projectId, campaign) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.campaigns.push(campaign);
    return doc.save();
  }

  /**
   * Update campagne status
   */
  async updateCampaignStatus(projectId, campaignId, status) {
    return this.model.updateOne(
      { projectId, "campaigns._id": campaignId },
      { $set: { "campaigns.$.status": status } },
    );
  }

  /**
   * Voeg adgroup toe aan campagne
   */
  async addAdGroup(projectId, campaignId, adGroup) {
    return this.model.updateOne(
      { projectId, "campaigns._id": campaignId },
      { $push: { "campaigns.$.adGroups": adGroup } },
    );
  }

  /**
   * Update adgroup status
   */
  async updateAdGroupStatus(projectId, campaignId, adGroupId, status) {
    return this.model.updateOne(
      {
        projectId,
        "campaigns._id": campaignId,
        "campaigns.adGroups._id": adGroupId,
      },
      { $set: { "campaigns.$.adGroups.$.status": status } },
    );
  }

  /**
   * Voeg advertentie toe aan adgroup
   */
  async addAd(projectId, campaignId, adGroupId, ad) {
    const doc = await this.model.findOne({
      projectId,
      "campaigns._id": campaignId,
      "campaigns.adGroups._id": adGroupId,
    });
    if (!doc) return null;

    const campaign = doc.campaigns.id(campaignId);
    const adGroup = campaign.adGroups.id(adGroupId);
    adGroup.ads.push(ad);

    return doc.save();
  }

  /**
   * Update advertentie status
   */
  async updateAdStatus(projectId, campaignId, adGroupId, adId, status) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    const campaign = doc.campaigns.id(campaignId);
    const adGroup = campaign.adGroups.id(adGroupId);
    const ad = adGroup.ads.id(adId);

    ad.status = status;
    return doc.save();
  }

  /**
   * Update performance metrics
   */
  async updatePerformance(projectId, campaignId, metrics) {
    return this.model.updateOne(
      { projectId, "campaigns._id": campaignId },
      { $set: { "campaigns.$.performance": metrics } },
    );
  }
}
