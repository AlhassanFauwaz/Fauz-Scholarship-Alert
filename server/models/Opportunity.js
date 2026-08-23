import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: [
      'scholarship',
      'internship',
      'fellowship',
      'grant',
      'competition',
      'research',
      'training',
      'conference',
      'exchange',
      'funding',
      'other',
    ],
    required: [true, 'Opportunity type is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
  },
  image: {
  type: String,
  default: 'client/public/scholarship.png',
},
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  eligibility: {
    minEducationLevel: String,
    maxEducationLevel: String,
    fieldOfStudy: String,
    requiredGPA: Number,
    nationality: [String],
    countryEligibility: [String],
    ageMin: Number,
    ageMax: Number,
    gender: String,
    other: String,
  },
  requirements: {
    documents: [String],
    instructions: String,
    applicationFee: Number,
  },
  benefits: String,
  country: String,
  applicationUrl: {
    type: String,
    required: [true, 'Application URL is required'],
  },
  sourceUrl: String,
  openingDate: Date,
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'expired'],
    default: 'draft',
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

// Text index for search
opportunitySchema.index({ title: 'text', description: 'text', organization: 'text' });

// Update the `updatedAt` field before saving
opportunitySchema.pre('save', function () {
  this.updatedAt = Date.now();
});

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;