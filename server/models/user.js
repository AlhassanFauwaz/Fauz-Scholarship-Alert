import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
  type: String,
  required: [true, "Email is required"],
  unique: true,
  lowercase: true,
  trim: true,
  maxlength: [254, "Email cannot exceed 254 characters"],
  match: [
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/,
    "Please provide a valid email address",
  ],
},
  phone: {
  type: String,
  default: '',
  trim: true,
  minlength: [10, 'Phone number must be exactly 10 digits'],
  maxlength: [10, 'Phone number must be exactly 10 digits'],
  match: [
    /^0(?:20|23|24|25|26|27|28|50|53|54|55|59)\d{7}$/,
    'Please provide a valid Ghanaian phone number'
  ],
},
  password: {
  type: String,
  required: [true, 'Password is required'],
  minlength: [8, 'Password must be at least 8 characters long'],
  maxlength: [128, 'Password cannot exceed 128 characters'],
  select: false,
  trim: false,
  validate: {
    validator: function (value) {
      return (
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /\d/.test(value) &&
        /[^A-Za-z0-9]/.test(value)
      );
    },
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  },
},
  role: {
    type: String,
    enum: ['user', 'admin', 'content-manager'],
    default: 'user',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  accountStatus: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },
  profile: {
    institution: String,
    educationLevel: {
      type: String,
      enum: ['highschool', 'undergraduate', 'graduate', 'postgraduate', 'phd', 'other'],
    },
    fieldOfStudy: String,
    graduationYear: Number,
    gpa: Number,
    country: String,
    city: String,
    interests: [String],
    preferredOpportunityTypes: [String],
    preferredCountries: [String],
    preferredFields: [String],
    preferredFunding: [String],
    keywords: [String],
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
    deadlineReminders: { type: Boolean, default: true },
    frequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly'],
      default: 'instant',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;