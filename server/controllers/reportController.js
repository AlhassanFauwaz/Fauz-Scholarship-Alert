import OpportunityReport from '../models/OpportunityReport.js';
import Opportunity from '../models/Opportunity.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Submit an issue report for an opportunity.
 */
export const createOpportunityReport = async (req, res) => {
  try {
    const { opportunityId, reason, details } = req.body;
    if (!opportunityId || !reason) {
      return res.status(400).json({ message: 'Opportunity ID and reason are required' });
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const report = await OpportunityReport.create({
      opportunityId,
      userId: req.user ? req.user.id : undefined,
      reason,
      details,
    });

    res.status(201).json({ message: 'Thank you for reporting. Our moderation team will investigate.', report });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting report', error: err.message });
  }
};

/**
 * Get all user-submitted opportunity reports (Admin only).
 */
export const getAdminOpportunityReports = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      OpportunityReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('opportunityId', 'title slug applicationUrl deadline status verificationStatus')
        .populate('userId', 'fullName email'),
      OpportunityReport.countDocuments(filter),
    ]);

    res.json({
      reports,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving reports', error: err.message });
  }
};

/**
 * Resolve or dismiss an opportunity report (Admin only).
 */
export const resolveOpportunityReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const report = await OpportunityReport.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status || 'resolved';
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedBy = req.user.id;
    report.updatedAt = new Date();
    await report.save();

    await AuditLog.create({
      action: 'resolve_opportunity_report',
      category: 'source_moderation',
      targetType: 'Opportunity',
      targetId: report.opportunityId,
      performedBy: req.user.id,
      performerRole: req.user.role || 'admin',
      details: `Report (${report.reason}) marked as ${report.status}. Notes: ${resolutionNotes}`,
    });

    res.json({ message: 'Report resolved successfully', report });
  } catch (err) {
    res.status(500).json({ message: 'Error resolving report', error: err.message });
  }
};
