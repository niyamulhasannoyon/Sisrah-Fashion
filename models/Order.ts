import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    email?: string;
  };
  orderItems: {
    title: string;
    price: number;
    image: string;
    selectedSize: string;
    selectedColor: string;
    quantity: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderId: number;
  transactionId?: string;
  paidAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
  deliveredAt?: Date;
  courier?: string;
  trackingNumber?: string;
  internalNotes?: string;
  campaignSlug?: string;
  attribution?: {
    source?: string; medium?: string; campaign?: string; content?: string; term?: string;
    campaignId?: string; adsetId?: string; adId?: string; placement?: string; fbclid?: string;
    landingPage?: string; isMetaAd?: boolean;
    firstSource?: string; firstMedium?: string; firstCampaign?: string; firstAdId?: string; firstTouchAt?: Date;
    inAppBrowser?: string; visitorId?: string; fbp?: string; fbc?: string; eventSourceUrl?: string; userAgent?: string;
  };
}

const OrderSchema: Schema = new Schema(
  {
    shippingInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      email: { type: String },
    },
    orderItems: [
      {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        selectedSize: { type: String, required: true },
        selectedColor: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    paymentStatus: { type: String, default: 'Pending' },
    orderStatus: { type: String, default: 'Processing' },
    orderId: { type: Number, unique: true },
    transactionId: { type: String },
    paidAmount: { type: Number },
    couponCode: { type: String, uppercase: true },
    couponDiscount: { type: Number, default: 0 },
    deliveredAt: { type: Date },
    courier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    internalNotes: { type: String, default: '' },
    campaignSlug: { type: String, index: true },
    // Ad attribution captured in the browser (last touch 7d, first touch 90d) + Meta identifiers
    attribution: {
      source: String,
      medium: String,
      campaign: String,
      content: String,
      term: String,
      campaignId: String,
      adsetId: String,
      adId: String,
      placement: String,
      fbclid: String,
      landingPage: String,
      isMetaAd: { type: Boolean, default: false },
      firstSource: String,
      firstMedium: String,
      firstCampaign: String,
      firstAdId: String,
      firstTouchAt: Date,
      inAppBrowser: String,
      visitorId: String,
      fbp: String,
      fbc: String,
      eventSourceUrl: String,
      userAgent: String,
    },
  },
  { timestamps: true }
);

OrderSchema.index({ 'attribution.isMetaAd': 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
