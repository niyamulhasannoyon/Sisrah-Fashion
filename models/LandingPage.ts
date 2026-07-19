import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Sub-schemas ──

const CustomHeroSchema = new Schema(
  {
    customHeading: { type: String, default: '' },
    customSubheading: { type: String, default: '' },
    customBannerImage: { type: String, default: '' },
  },
  { _id: false }
);

const PromotionalElementsSchema = new Schema(
  {
    countdownTimerToggle: { type: Boolean, default: false },
    countdownTargetDate: { type: Date, default: null },
    announcementText: { type: String, default: '' },
  },
  { _id: false }
);

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

// ── Interfaces ──

export interface ILandingPage extends Document {
  pageTitle: string;
  slug: string;
  layoutType: 'single-product' | 'multi-product';
  productIds: mongoose.Types.ObjectId[];
  customHero: {
    customHeading: string;
    customSubheading: string;
    customBannerImage: string;
  };
  promotionalElements: {
    countdownTimerToggle: boolean;
    countdownTargetDate: Date | null;
    announcementText: string;
  };
  socialProof: Array<{
    name: string;
    rating: number;
    comment: string;
    image?: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──

const LandingPageSchema: Schema<ILandingPage> = new Schema(
  {
    pageTitle: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    layoutType: {
      type: String,
      enum: ['single-product', 'multi-product'],
      required: true,
    },
    productIds: [
      { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    ],
    customHero: { type: CustomHeroSchema, default: () => ({}) },
    promotionalElements: {
      type: PromotionalElementsSchema,
      default: () => ({}),
    },
    socialProof: { type: [TestimonialSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Index ──
LandingPageSchema.index({ slug: 1, isActive: 1 });

// ── Export ──
const LandingPage: Model<ILandingPage> =
  (mongoose.models.LandingPage as Model<ILandingPage>) ||
  mongoose.model<ILandingPage>('LandingPage', LandingPageSchema);

export default LandingPage;
