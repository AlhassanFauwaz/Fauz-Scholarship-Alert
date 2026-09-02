import mongoose from 'mongoose';

const opportunityIngestionSchema = new mongoose.Schema({
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OpportunitySource',
    required: true,
  },
  sourceName: {
    type: String,
    trim: true,
  },
  sourceUrl: {
    type: String,
    required: true,
    trim: true,
  },
  retrievedAt: {
    type: Date,
    default: Date.now,
  },
  rawTitle: {
    type: String,
    trim: true,
  },
  rawDescription: {
    type: String,
  },
  rawContent: {
    type: String,
  },
  rawMetadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processed', 'duplicate_merged', 'flagged_review', 'rejected', 'failed'],
    default: 'pending',
  },
  processingErrors: {
    type: [String],
    default: [],
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  duplicateCandidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
  },
  extractedOpportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

opportunityIngestionSchema.index({ sourceId: 1, retrievedAt: -1 });
opportunityIngestionSchema.index({ processingStatus: 1 });
opportunityIngestionSchema.index({ sourceUrl: 1 });

const OpportunityIngestion = mongoose.model('OpportunityIngestion', opportunityIngestionSchema);

export default OpportunityIngestion;
