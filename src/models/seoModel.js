import mongoose from "mongoose";
import { BaseModel } from "./baseModel.js";

const keywordSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  volume: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  position: {
    type: Number,
    min: 1,
  },
  url: {
    type: String,
    trim: true,
  },
  lastChecked: {
    type: Date,
    default: Date.now,
  },
});

const auditSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  issues: [
    {
      type: {
        type: String,
        enum: ["error", "warning", "info"],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      code: String,
      impact: {
        type: String,
        enum: ["high", "medium", "low"],
      },
      details: mongoose.Schema.Types.Mixed,
    },
  ],
  performance: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    metrics: {
      fcp: Number, // First Contentful Paint
      lcp: Number, // Largest Contentful Paint
      cls: Number, // Cumulative Layout Shift
      fid: Number, // First Input Delay
      ttfb: Number, // Time to First Byte
    },
  },
  seo: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    title: String,
    description: String,
    keywords: [String],
    headings: {
      h1: [String],
      h2: [String],
      h3: [String],
    },
  },
  accessibility: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    issues: [
      {
        type: String,
        message: String,
        impact: String,
      },
    ],
  },
  bestPractices: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    issues: [
      {
        type: String,
        message: String,
        impact: String,
      },
    ],
  },
});

const contentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["page", "post", "product"],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  keywords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Keyword",
    },
  ],
  readability: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    issues: [
      {
        type: String,
        message: String,
        suggestion: String,
      },
    ],
  },
  optimization: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    suggestions: [
      {
        type: String,
        message: String,
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
        },
      },
    ],
  },
});

const backlinksSchema = new mongoose.Schema({
  sourceUrl: {
    type: String,
    required: true,
    trim: true,
  },
  targetUrl: {
    type: String,
    required: true,
    trim: true,
  },
  anchor: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ["follow", "nofollow"],
    default: "follow",
  },
  firstSeen: {
    type: Date,
    default: Date.now,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "lost", "broken"],
    default: "active",
  },
  domainAuthority: {
    type: Number,
    min: 0,
    max: 100,
  },
  pageAuthority: {
    type: Number,
    min: 0,
    max: 100,
  },
});

// Schemadefinities
const schema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  domain: {
    type: String,
    required: true,
    trim: true,
  },
  keywords: [keywordSchema],
  audits: [auditSchema],
  content: [contentSchema],
  backlinks: [backlinksSchema],
  settings: {
    targetKeywords: [String],
    competitors: [String],
    excludedUrls: [String],
    crawlFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "weekly",
    },
    notifications: {
      rankingChanges: {
        type: Boolean,
        default: true,
      },
      issuesFound: {
        type: Boolean,
        default: true,
      },
      newBacklinks: {
        type: Boolean,
        default: true,
      },
    },
  },
});

// Indexes
schema.index({ projectId: 1, domain: 1 }, { unique: true });
schema.index({ "keywords.text": 1 });
schema.index({ "audits.url": 1 });
schema.index({ "content.url": 1 });
schema.index({ "backlinks.sourceUrl": 1, "backlinks.targetUrl": 1 });

export class SeoModel extends BaseModel {
  constructor() {
    super("Seo", schema);
  }

  /**
   * Voeg keyword toe
   */
  async addKeyword(projectId, keyword) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.keywords.push(keyword);
    return doc.save();
  }

  /**
   * Update keyword positie
   */
  async updateKeywordPosition(projectId, keywordId, position) {
    return this.model.updateOne(
      { projectId, "keywords._id": keywordId },
      {
        $set: {
          "keywords.$.position": position,
          "keywords.$.lastChecked": new Date(),
        },
      },
    );
  }

  /**
   * Voeg audit toe
   */
  async addAudit(projectId, audit) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.audits.push(audit);
    return doc.save();
  }

  /**
   * Haal laatste audit op
   */
  async getLatestAudit(projectId, url) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    return doc.audits
      .filter((audit) => audit.url === url)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
  }

  /**
   * Voeg content toe
   */
  async addContent(projectId, content) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.content.push(content);
    return doc.save();
  }

  /**
   * Update content optimalisatie
   */
  async updateContentOptimization(projectId, contentId, optimization) {
    return this.model.updateOne(
      { projectId, "content._id": contentId },
      { $set: { "content.$.optimization": optimization } },
    );
  }

  /**
   * Voeg backlink toe
   */
  async addBacklink(projectId, backlink) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.backlinks.push(backlink);
    return doc.save();
  }

  /**
   * Update backlink status
   */
  async updateBacklinkStatus(projectId, backlinkId, status) {
    return this.model.updateOne(
      { projectId, "backlinks._id": backlinkId },
      {
        $set: {
          "backlinks.$.status": status,
          "backlinks.$.lastSeen": new Date(),
        },
      },
    );
  }
}
