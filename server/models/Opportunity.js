import mongoose from 'mongoose';

const generateSlug = (title) => {
  if (!title) return '';
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base.substring(0, 80)}-${randomSuffix}`;
};

const sourceCitationSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  url: { type: String, trim: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'OpportunitySource' },
  firstDiscovered: { type: Date, default: Date.now },
  lastVerified: { type: Date, default: Date.now },
});

const duplicateCandidateSchema = new mongoose.Schema({
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
  confidence: { type: Number, min: 0, max: 100 },
  detectedAt: { type: Date, default: Date.now },
});

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    index: true,
  },
  shortDescription: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  type: {
    type: String,
    enum: [
      'scholarship',
      'internship',
      'grant',
      'fellowship',
      'job',
      'research',
      'training',
      'competition',
      'exchange',
      'graduate_programme',
      'volunteer',
      'conference',
      'entrepreneurship',
      'funding',
      'other',
    ],
    required: [true, 'Opportunity type is required'],
    default: 'scholarship',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    default: 'General',
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true,
  },
  provider: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: 'client/public/scholarship.png',
  },
  country: {
    type: String,
    trim: true,
  },
  region: {
    type: String,
    enum: [
      'Africa',
      'Europe',
      'North America',
      'South America',
      'Asia',
      'Oceania',
      'Middle East',
      'Worldwide',
      'Other',
      '',
    ],
    default: 'Worldwide',
  },
  city: {
    type: String,
    trim: true,
  },
  isRemote: {
    type: Boolean,
    default: false,
  },
  eligibleCountries: {
    type: [String],
    default: [],
  },
  eligibleRegions: {
    type: [String],
    default: [],
  },
  degreeLevels: {
    type: [String],
    default: [],
  },
  fieldsOfStudy: {
    type: [String],
    default: [],
  },
  subjects: {
    type: [String],
    default: [],
  },
  minimumQualification: {
    type: String,
    trim: true,
  },
  maximumQualification: {
    type: String,
    trim: true,
  },
  experienceRequirement: {
    type: String,
    trim: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  fundingType: {
    type: String,
    enum: [
      'fully_funded',
      'partially_funded',
      'tuition_only',
      'stipend',
      'no_funding',
      'paid',
      'unpaid',
      'other',
      '',
    ],
    default: 'other',
  },
  fundingAmount: {
    type: String,
    trim: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  benefits: {
    type: String,
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
  documentsRequired: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  startDate: Date,
  endDate: Date,
  duration: {
    type: String,
    trim: true,
  },
  applicationUrl: {
    type: String,
    required: [true, 'Application URL is required'],
    trim: true,
  },
  officialWebsite: {
    type: String,
    trim: true,
  },
  sourceUrl: {
    type: String,
    trim: true,
  },
  sourceName: {
    type: String,
    trim: true,
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OpportunitySource',
  },
  sources: {
    type: [sourceCitationSchema],
    default: [],
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 75,
  },
  classificationConfidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 85,
  },
  duplicateCandidates: {
    type: [duplicateCandidateSchema],
    default: [],
  },
  isMerged: {
    type: Boolean,
    default: false,
  },
  linkStatus: {
    type: String,
    enum: ['healthy', 'link_broken', 'unverified'],
    default: 'unverified',
  },
  openingDate: Date,
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'expired', 'archived', 'flagged_review'],
    default: 'published',
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'official_source', 'rejected', 'expired'],
    default: 'unverified',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
  verificationNotes: String,
  featured: {
    type: Boolean,
    default: false,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  savesCount: {
    type: Number,
    default: 0,
  },
  clicksCount: {
    type: Number,
    default: 0,
  },
  dateDiscovered: {
    type: Date,
    default: Date.now,
  },
  datePublished: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
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

// Update the `updatedAt` field and generate slug before saving
opportunitySchema.pre('save', function () {
  this.updatedAt = Date.now();
  if (!this.slug) {
    this.slug = generateSlug(this.title);
  }
  // Initialize sources array with initial source if empty
  if (this.sources.length === 0 && (this.sourceName || this.sourceUrl)) {
    this.sources.push({
      name: this.sourceName || this.organization,
      url: this.sourceUrl || this.applicationUrl,
      sourceId: this.sourceId,
      firstDiscovered: this.dateDiscovered || new Date(),
      lastVerified: new Date(),
    });
  }
  // Synchronize legacy and new eligibility fields if one is provided
  if (this.eligibility?.fieldOfStudy && (!this.fieldsOfStudy || this.fieldsOfStudy.length === 0)) {
    this.fieldsOfStudy = [this.eligibility.fieldOfStudy];
  }
  if (this.eligibility?.countryEligibility && (!this.eligibleCountries || this.eligibleCountries.length === 0)) {
    this.eligibleCountries = this.eligibility.countryEligibility;
  }
  if (this.eligibility?.minEducationLevel && (!this.degreeLevels || this.degreeLevels.length === 0)) {
    this.degreeLevels = [this.eligibility.minEducationLevel];
  }
});

// Compound and text indexes for fast search & filtering
opportunitySchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  organization: 'text',
  fieldsOfStudy: 'text',
  tags: 'text',
});

opportunitySchema.index({ status: 1, deadline: 1 });
opportunitySchema.index({ status: 1, type: 1, createdAt: -1 });
opportunitySchema.index({ status: 1, country: 1 });
opportunitySchema.index({ status: 1, isRemote: 1 });
opportunitySchema.index({ status: 1, featured: 1 });
opportunitySchema.index({ verificationStatus: 1, qualityScore: -1 });
opportunitySchema.index({ dateDiscovered: -1 });

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;