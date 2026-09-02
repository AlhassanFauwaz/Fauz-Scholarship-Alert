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
  frequency: {
    type: String,
    enum: ['15m', '30m', '1h', '6h', '12h', '24h'],
    default: '6h',
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
