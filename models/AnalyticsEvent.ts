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
  visitorId: { type: String, index: true },

  // ── Ad attribution (session-scoped touch) ──
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmContent: String, // {{ad.name}}
  utmTerm: String,    // {{adset.name}}
  campaignId: String,
  adsetId: String,
  adId: String,
  placement: String,
  fbclid: String,
  fbp: String,
  fbc: String,
  landingPage: String,
  isMetaAd: { type: Boolean, default: false },
  inAppBrowser: String, // Facebook | Instagram | Messenger | ''
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexes for optimization
AnalyticsEventSchema.index({ timestamp: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });
AnalyticsEventSchema.index({ eventType: 1 });
AnalyticsEventSchema.index({ isMetaAd: 1, timestamp: -1 });
AnalyticsEventSchema.index({ utmCampaign: 1, timestamp: -1 });

export default mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
