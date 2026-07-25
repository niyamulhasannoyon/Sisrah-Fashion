import mongoose, { Schema } from 'mongoose';

const SettingsSchema = new Schema({
  logo: String,
  favicon: String,
  whatsappNumber: String,
  heroImage: String,
  ethosImage: String,
  communityImages: [{ url: String, public_id: String }], 
  
  // Custom announcements
  announcementText: String,
  announcementLink: String,
  announcementBgColor: String,
  
  // Customizable homepage copy
  heroHeadline: String,
  heroSubheadline: String,

  // Ethos Section Copy
  ethosTitle: String,
  ethosHeadline: String,
  ethosDescription: String,

  // Why Shop With Us Section Copy
  whyShopTitle: String,
  whyShopHeadline: String,
  whyShopFeature1Title: String,
  whyShopFeature1BnTitle: String,
  whyShopFeature1Desc: String,
  whyShopFeature2Title: String,
  whyShopFeature2BnTitle: String,
  whyShopFeature2Desc: String,
  whyShopFeature3Title: String,
  whyShopFeature3BnTitle: String,
  whyShopFeature3Desc: String,
  whyShopFeature4Title: String,
  whyShopFeature4BnTitle: String,
  whyShopFeature4Desc: String,

  // Community Gallery Section Copy
  communityTitle: String,
  communityHeadline: String,
  communitySubheadline: String,
  instagramHandle: String,
  
  // Footer / contact
  contactEmail: String,
  contactAddress: String,
  facebookUrl: String,
  instagramUrl: String,
  youtubeUrl: String,
  
  // E-commerce checkout constants
  shippingInsideDhaka: Number,
  shippingOutsideDhaka: Number,
  freeShippingTrigger: { type: String, default: 'none' },
  freeShippingMinQuantity: { type: Number, default: 2 },
  freeShippingMinAmount: { type: Number, default: 3000 },
  paymentNumber: String,
  
  // Dynamic category banner images
  categoryImageMen: String,
  categoryImageWomen: String,
  categoryImageFusion: String,
  
  // Hero slider background images
  heroImages: [{ url: String, mobileUrl: String, public_id: String, mobilePublicId: String }],
  // Analytics & Pixel tracking
  facebookPixelId: String,
  googleAnalyticsId: String,
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
