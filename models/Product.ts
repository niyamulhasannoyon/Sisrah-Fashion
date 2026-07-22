import mongoose, { Schema, Document } from 'mongoose';

const VariantSchema = new Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  image: { url: String, public_id: String },
});

export interface IProductVariant {
  size: string;
  color: string;
  price: number;
  offerPrice?: number;
  stock: number;
  image?: { url: string; public_id: string } | null;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  offerPrice: number;
  costPrice?: number;
  marketingCost?: number;
  deliveryCost?: number;
  category: string;
  subCategory?: string;
  tags: string[];
  images: { url: string; public_id: string }[];
  variants: IProductVariant[];
  lowStockThreshold: number;
  rating: number;
  numReviews: number;
  isTrending: boolean;
  isNewArrival: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    offerPrice: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    marketingCost: { type: Number, default: 0 },
    deliveryCost: { type: Number, default: 0 },
    category: { type: String, required: true },
    subCategory: { type: String, default: '' },
    tags: [{ type: String }],
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    variants: [VariantSchema],
    lowStockThreshold: { type: Number, required: true, default: 10 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound indexes for ultra-fast query execution (IXSCAN instead of COLLSCAN)
ProductSchema.index({ category: 1, createdAt: -1 });
ProductSchema.index({ isTrending: -1, createdAt: -1 });
ProductSchema.index({ isNewArrival: -1, createdAt: -1 });
ProductSchema.index({ tags: 1 });


export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
