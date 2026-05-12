import mongoose, { Schema, Document } from 'mongoose';

const ReviewSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const VariantSchema = new Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  image: { url: String, public_id: String },
});

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  offerPrice: number;
  category: string;
  tags: string[];
  images: { url: string; public_id: string }[];
  variants: any[];
  reviews: any[];
  rating: number;
  numReviews: number;
  isTrending: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    offerPrice: { type: Number, default: 0 },
    category: { type: String, required: true },
    tags: [{ type: String }],
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    variants: [VariantSchema],
    reviews: [ReviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    isTrending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
