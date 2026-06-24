import mongoose, { Schema } from 'mongoose';

const AnalyticsEventSchema = new Schema({
  eventType: { type: String, required: true }, // 'pageview' | 'click'
  url: { type: String, required: true },
  referrer: String,
  ip: String,
  country: String,
  city: String,
  browser: String,
  os: String,
  device: String,
  clickTarget: String, // css selector or path
  clickText: String,   // button text or link text
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexes for optimization
AnalyticsEventSchema.index({ timestamp: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });
AnalyticsEventSchema.index({ eventType: 1 });

export default mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
