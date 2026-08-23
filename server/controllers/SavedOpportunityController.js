import SavedOpportunity from '../models/SavedOpportunity.js';
import Opportunity from '../models/Opportunity.js';

// @desc    Save an opportunity
// @route   POST /api/opportunities/:id/save
// @access  Private
export const saveOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Check if already saved
    const existing = await SavedOpportunity.findOne({
      user: req.user.id,
      opportunity: req.params.id,
    });
    if (existing) {
      return res.status(400).json({ message: 'Opportunity already saved' });
    }

    await SavedOpportunity.create({
      user: req.user.id,
      opportunity: req.params.id,
    });

    res.status(201).json({ message: 'Opportunity saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove a saved opportunity
// @route   DELETE /api/opportunities/:id/save
// @access  Private
export const unsaveOpportunity = async (req, res) => {
  try {
    const result = await SavedOpportunity.findOneAndDelete({
      user: req.user.id,
      opportunity: req.params.id,
    });
    if (!result) {
      return res.status(404).json({ message: 'Saved opportunity not found' });
    }
    res.json({ message: 'Opportunity removed from saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's saved opportunities
// @route   GET /api/saved-opportunities
// @access  Private
export const getSavedOpportunities = async (req, res) => {
  try {
    const saved = await SavedOpportunity.find({ user: req.user.id })
      .populate('opportunity')
      .sort({ savedAt: -1 });

    res.json({ saved });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};