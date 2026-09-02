import mongoose from 'mongoose';

const opportunitySourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Source name is required'],
    trim: true,
  },
  websiteUrl: {
    type: String,
    required: [true, 'Website URL is required'],
    trim: true,
  },
  sourceType: {
    type: String,
    enum: ['rss', 'api', 'approved_crawler', 'manual', 'organization'],
    default: 'rss',
    required: true,
  },
  sourceCategory: {
    type: String,
    enum: [
      'university',
      'government',
      'international_org',
      'foundation',
      'company',
      'research_institution',
      'aggregator',
      'ngo',
      'other',
    ],
    default: 'other',
  },
  discoveryMethod: {
    type: String,
    enum: ['seed', 'crawled', 'user_submission', 'api_registration', 'admin_manual'],
    default: 'admin_manual',
  },
  apiEndpoint: {
    type: String,
    trim: true,
  },
  rssUrl: {
    type: String,
    trim: true,
  },
  defaultOpportunityType: {
    type: String,
    default: 'scholarship',
  },
  defaultCategory: {
    type: String,
    default: 'General',
  },
  defaultCountry: {
    type: String,
    default: 'Worldwide',
  },
  region: {
    type: String,
    enum: [
      'Africa',
      'Europe',
      'North America',
      'South America',
      'Asia',
      'Oceania',
      'Middle East',
      'Worldwide',
      'Other',
    ],
    default: 'Worldwide',
  },
  language: {
    type: String,
    default: 'en',
  },
  priority: {
    type: String,
    enum: ['high', 'normal', 'low'],
    default: 'normal',
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 75,
  },
  frequency: {
    type: String,
    enum: ['15m', '30m', '1h', '6h', '12h', '24h'],
    default: '6h',
  },
  requestsPerMinute: {
    type: Number,
    default: 30,
  },
  requestsPerHour: {
    type: Number,
    default: 500,
  },
  requestDelayMs: {
    type: Number,
    default: 1000,
  },
  consecutiveFailures: {
    type: Number,
    default: 0,
  },
  robotsAllowed: {
    type: Boolean,
    default: true,
  },
  termsReviewed: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  autoPublish: {
    type: Boolean,
    default: false,
  },
  lastSyncAt: Date,
  lastSuccessAt: Date,
  lastFailureAt: Date,
  lastErrorMessage: String,
  retryCount: {
    type: Number,
    default: 0,
  },
  opportunitiesFound: {
    type: Number,
    default: 0,
  },
  healthStatus: {
    type: String,
    enum: ['healthy', 'warning', 'failed', 'disabled'],
    default: 'healthy',
  },
  status: {
    type: String,
    enum: ['active', 'pending_review', 'warning', 'failed', 'blocked', 'disabled'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

opportunitySourceSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

const OpportunitySource = mongoose.model('OpportunitySource', opportunitySourceSchema);

export default OpportunitySource;
