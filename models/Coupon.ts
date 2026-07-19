import mongoose, { Schema } from 'mongoose';

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['Percentage', 'Fixed'], required: true },
  discountValue: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  maxUses: { type: Number, default: null },   // null = unlimited uses
  usedCount: { type: Number, default: 0 },     // incremented each time the coupon is applied
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
