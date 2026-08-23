import Feedback from '../models/Feedback.js';

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
export const submitFeedback = async (req, res) => {
  try {
    const { category, message } = req.body;

    if (!category || !message) {
      return res.status(400).json({ message: 'Category and message are required' });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      category,
      message,
    });

    res.status(201).json({ feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user's feedback
// @route   GET /api/feedback
// @access  Private
export const getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all feedback (admin only)
// @route   GET /api/feedback/admin
// @access  Private (Admin)
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};