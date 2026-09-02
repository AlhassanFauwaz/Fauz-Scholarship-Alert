import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['opportunity_override', 'source_moderation', 'verification', 'manual_entry', 'duplicate_merge', 'system_discovery', 'security_block'],
    default: 'opportunity_override',
  },
  targetType: {
    type: String,
    enum: ['Opportunity', 'OpportunitySource', 'User', 'System'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  performerRole: {
    type: String,
    default: 'system',
  },
  details: {
    type: String,
    trim: true,
  },
  previousState: {
    type: mongoose.Schema.Types.Mixed,
  },
  newState: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
