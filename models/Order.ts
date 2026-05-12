import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
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
}

const OrderSchema: Schema = new Schema(
  {
    shippingInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
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
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
