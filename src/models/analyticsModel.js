import mongoose from 'mongoose';
import { BaseModel } from './baseModel.js';

const metricSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dimensions: {
    type: Map,
    of: String
  }
});

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  metrics: [{
    name: String,
    data: [metricSchema]
  }],
  dimensions: [String],
  filters: [{
    dimension: String,
    operator: String,
    value: String
  }],
  segments: [{
    name: String,
    type: String,
    conditions: [{
      dimension: String,
      operator: String,
      value: String
    }]
  }]
});

const goalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['url', 'event', 'duration', 'pages'],
    required: true
  },
  value: {
    type: Number,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  conditions: [{
    metric: String,
    operator: String,
    value: String
  }]
});

const eventSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  label: String,
  value: Number,
  date: {
    type: Date,
    required: true
  },
  dimensions: {
    type: Map,
    of: String
  }
});

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: Number,
  source: String,
  medium: String,
  campaign: String,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet']
  },
  browser: String,
  os: String,
  location: {
    country: String,
    region: String,
    city: String
  },
  pageviews: [{
    url: String,
    title: String,
    timestamp: Date,
    duration: Number
  }],
  events: [eventSchema],
  goals: [{
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    },
    completed: Boolean,
    value: Number,
    timestamp: Date
  }]
});

// Schema definitie
const schema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  propertyId: {
    type: String,
    required: true
  },
  viewId: {
    type: String,
    required: true
  },
  metrics: [metricSchema],
  reports: [reportSchema],
  goals: [goalSchema],
  events: [eventSchema],
  sessions: [sessionSchema],
  settings: {
    tracking: {
      enabled: {
        type: Boolean,
        default: true
      },
      anonymizeIp: {
        type: Boolean,
        default: true
      },
      demographics: {
        type: Boolean,
        default: false
      }
    },
    reporting: {
      timezone: {
        type: String,
        default: 'Europe/Amsterdam'
      },
      currency: {
        type: String,
        default: 'EUR'
      },
      emailReports: [{
        type: String,
        schedule: String,
        recipients: [String]
      }]
    },
    filters: [{
      name: String,
      type: String,
      conditions: [{
        field: String,
        operator: String,
        value: String
      }]
    }],
    customDimensions: [{
      index: Number,
      name: String,
      active: Boolean,
      scope: {
        type: String,
        enum: ['hit', 'session', 'user']
      }
    }],
    customMetrics: [{
      index: Number,
      name: String,
      active: Boolean,
      type: {
        type: String,
        enum: ['integer', 'currency', 'time']
      },
      scope: {
        type: String,
        enum: ['hit', 'session', 'user']
      }
    }]
  }
});

// Indexes
schema.index({ projectId: 1, propertyId: 1 }, { unique: true });
schema.index({ 'metrics.date': 1 });
schema.index({ 'sessions.sessionId': 1 });
schema.index({ 'events.date': 1 });
schema.index({ 'reports.startDate': 1, 'reports.endDate': 1 });

export class AnalyticsModel extends BaseModel {
  constructor() {
    super('Analytics', schema);
  }

  /**
   * Voeg metrics toe
   */
  async addMetrics(projectId, metrics) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.metrics.push(...metrics);
    return doc.save();
  }

  /**
   * Maak rapport
   */
  async createReport(projectId, report) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.reports.push(report);
    return doc.save();
  }

  /**
   * Voeg doel toe
   */
  async addGoal(projectId, goal) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.goals.push(goal);
    return doc.save();
  }

  /**
   * Update doel status
   */
  async updateGoalStatus(projectId, goalId, active) {
    return this.model.updateOne(
      { projectId, 'goals._id': goalId },
      { $set: { 'goals.$.active': active } }
    );
  }

  /**
   * Voeg event toe
   */
  async addEvent(projectId, event) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.events.push(event);
    return doc.save();
  }

  /**
   * Voeg sessie toe
   */
  async addSession(projectId, session) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    doc.sessions.push(session);
    return doc.save();
  }

  /**
   * Update sessie
   */
  async updateSession(projectId, sessionId, update) {
    return this.model.updateOne(
      { projectId, 'sessions.sessionId': sessionId },
      { $set: { 'sessions.$': update } }
    );
  }

  /**
   * Haal metrics op voor periode
   */
  async getMetrics(projectId, startDate, endDate, dimensions = []) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    return doc.metrics.filter(metric => {
      const date = new Date(metric.date);
      return date >= startDate && date <= endDate &&
        (!dimensions.length || dimensions.every(d => metric.dimensions.has(d)));
    });
  }

  /**
   * Haal rapport op
   */
  async getReport(projectId, reportId) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    return doc.reports.id(reportId);
  }

  /**
   * Haal sessies op voor periode
   */
  async getSessions(projectId, startDate, endDate, filters = {}) {
    const doc = await this.model.findOne({ projectId });
    if (!doc) return null;

    return doc.sessions.filter(session => {
      const start = new Date(session.startTime);
      return start >= startDate && start <= endDate &&
        Object.entries(filters).every(([key, value]) => session[key] === value);
    });
  }
}
