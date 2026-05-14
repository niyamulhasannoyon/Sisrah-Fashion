import mongoose, { Schema } from 'mongoose';

const SettingsSchema = new Schema({
  logo: String,
  favicon: String,
  whatsappNumber: String,
  heroImage: String,
  ethosImage: String,
  communityImages: [{ url: String, public_id: String }], 
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
