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
  ethosHeadline: String,
  ethosDescription: String,
  
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
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
