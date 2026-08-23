import Subscription from '../models/Subscription.js';

// @desc    Create a subscription
// @route   POST /api/subscriptions
export const createSubscription = async (req, res) => {
  try {
    const { name, opportunityTypes, categories, fields, countries, educationLevels, keywords, notificationChannels, frequency } = req.body;
    const subscription = await Subscription.create({
      user: req.user.id,
      name,
      opportunityTypes,
      categories,
      fields,
      countries,
      educationLevels,
      keywords,
      notificationChannels,
      frequency,
    });
    res.status(201).json({ subscription });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's subscriptions
// @route   GET /api/subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
export const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    res.json({ subscription });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
export const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    res.json({ message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle active/inactive
// @route   PUT /api/subscriptions/:id/toggle
export const toggleSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user.id });
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    subscription.active = !subscription.active;
    await subscription.save();
    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};