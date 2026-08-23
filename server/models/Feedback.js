import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: [
      'incorrect-info',
      'expired-opp',
      'technical',
      'suggestion',
      'general',
      'report-opp',
    ],
    required: [true, 'Category is required'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  },
  adminResponse: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

feedbackSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;