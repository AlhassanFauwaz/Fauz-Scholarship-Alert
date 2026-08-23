import mongoose from 'mongoose';

const savedOpportunitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

// A user can save an opportunity only once
savedOpportunitySchema.index({ user: 1, opportunity: 1 }, { unique: true });

const SavedOpportunity = mongoose.model('SavedOpportunity', savedOpportunitySchema);

export default SavedOpportunity;