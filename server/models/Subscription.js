import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: String,
  category: String,
  name: {
    type: String,
    trim: true,
  },
  opportunityTypes: [String],
  categories: [String],
  fields: [String],
  countries: [String],
  educationLevels: [String],
  keywords: [String],
  notificationChannels: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
  },
  frequency: {
    type: String,
    enum: ["instant", "daily", "weekly"],
    default: "instant",
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
