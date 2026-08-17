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

  // AS SIDRAT AI Assistant Settings
  aiEnabled: { type: Boolean, default: true },
  aiApiKey: { type: String, default: 'v84Ftx7BcJBugkq0Cig51Kwcl2lYjWav' },
  aiModel: { type: String, default: 'gemini-3.5-flash' },
  aiAssistantName: { type: String, default: 'AS SIDRAT AI Assistant' },
  aiTone: { type: String, default: 'Professional & Polite Bengali' },
  aiSystemPrompt: {
    type: String,
    default: 'আপনি AS SIDRAT ব্র্যান্ডের অফিশিয়াল AI কাস্টমার কেয়ার অ্যাসিস্ট্যান্ট। গ্রাহকদের সাথে অত্যন্ত মার্জিত, পেশাদার এবং বন্ধুবৎসল বাংলায় কথা বলুন। ব্র্যান্ডের সুনাম বজায় রাখুন এবং সঠিক তথ্য দিন।'
  },
  aiRules: {
    type: [String],
    default: [
      'সবসময় গ্রাহককে সালাম জানান এবং অত্যন্ত মার্জিত বাংলায় বিনয়ী হয়ে সাহায্য প্রদান করুন।',
      'ওয়েবসাইতের রিয়েল-টাইম প্রোডাক্ট প্রাইস, স্টক এবং সাইজ অনুযায়ী সঠিক তথ্য সরবরাহ করুন।',
      'সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা উপলব্ধ।',
      'ঢাকার ভেতরে ডেলিভারি চার্জ ৭০ টাকা (২-৩ দিন) এবং ঢাকার বাইরে ১৩০ টাকা (৩-৫ দিন)।',
      'যেকোনো সাইজ এক্সচেঞ্জ বা রিটার্ন ৭ দিনের মধ্যে অক্ষত অবস্থায় গ্রহণ করা হয়।'
    ]
  },
  aiFaqs: [
    {
      question: { type: String },
      answer: { type: String }
    }
  ],
  aiWelcomeMessage: {
    type: String,
    default: 'আসসালামু আলাইকুম! AS SIDRAT AI Assistant-এ আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?'
  },
  aiQuickQueries: {
    type: [String],
    default: [
      'আমি ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই।',
      'বর্তমানে কি কি নতুন কালেকশন বা শার্ট আছে?',
      'ডেলিভারি সময় ও চার্জ সম্পর্কে জানতে চাই।'
    ]
  },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
