import mongoose from 'mongoose';

const opportunityReportSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reason: {
    type: String,
    enum: [
      'broken_link',
      'expired',
      'wrong_deadline',
      'fake_suspicious',
      'wrong_eligibility',
      'duplicate',
      'other',
    ],
    required: true,
  },
  details: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolutionNotes: {
    type: String,
    trim: true,
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

opportunityReportSchema.index({ opportunityId: 1 });
opportunityReportSchema.index({ status: 1, createdAt: -1 });

const OpportunityReport = mongoose.model('OpportunityReport', opportunityReportSchema);

export default OpportunityReport;
