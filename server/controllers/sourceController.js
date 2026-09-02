import OpportunitySource from '../models/OpportunitySource.js';
import { syncSource } from '../services/collectorService.js';

// @desc    Get all opportunity sources
// @route   GET /api/sources
// @access  Private/Admin
export const getSources = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let query = {};

    if (status) query.healthStatus = status;
    if (type) query.sourceType = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { websiteUrl: { $regex: search, $options: 'i' } },
      ];
    }

    const sources = await OpportunitySource.find(query).sort({ createdAt: -1 });
    res.json({ sources });
  } catch (error) {
    console.error('getSources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single opportunity source
// @route   GET /api/sources/:id
// @access  Private/Admin
export const getSource = async (req, res) => {
  try {
    const source = await OpportunitySource.findById(req.params.id);
    if (!source) return res.status(404).json({ message: 'Source not found' });
    res.json({ source });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new opportunity source
// @route   POST /api/sources
// @access  Private/Admin
export const createSource = async (req, res) => {
  try {
    req.body.createdBy = req.user?.id || req.user?._id;
    const source = await OpportunitySource.create(req.body);
    res.status(201).json({ source });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update opportunity source
// @route   PUT /api/sources/:id
// @access  Private/Admin
export const updateSource = async (req, res) => {
  try {
    const source = await OpportunitySource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!source) return res.status(404).json({ message: 'Source not found' });
    res.json({ source });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete opportunity source
// @route   DELETE /api/sources/:id
// @access  Private/Admin
export const deleteSource = async (req, res) => {
  try {
    const source = await OpportunitySource.findByIdAndDelete(req.params.id);
    if (!source) return res.status(404).json({ message: 'Source not found' });
    res.json({ message: 'Source deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Trigger manual synchronization of a source
// @route   POST /api/sources/:id/sync
// @access  Private/Admin
export const triggerSourceSync = async (req, res) => {
  try {
    const source = await OpportunitySource.findById(req.params.id);
    if (!source) return res.status(404).json({ message: 'Source not found' });

    const result = await syncSource(source);
    if (result.success) {
      res.json({
        message: `Sync successful. ${result.count} new opportunities collected.`,
        count: result.count,
        source,
      });
    } else {
      res.status(400).json({
        message: `Sync encountered an issue: ${result.error}`,
        error: result.error,
        source,
      });
    }
  } catch (error) {
    console.error('triggerSourceSync error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
