import mongoose, { Schema, Document } from 'mongoose';

export interface IStaffActivityLog extends Document {
  staffId: mongoose.Types.ObjectId;
  staffName: string;
  staffRole: string;
  action: string;          // e.g. 'Updated order status to Delivered'
  targetType: 'order' | 'product' | 'user' | 'coupon' | 'staff' | 'settings' | 'review';
  targetId?: string;       // ObjectId or slug of the affected document
  targetLabel?: string;    // Human-readable label e.g. order #1042, product title
  metadata?: Record<string, any>; // Extra detail: { from: 'Processing', to: 'Delivered' }
  timestamp: Date;
}

const StaffActivityLogSchema: Schema = new Schema(
  {
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    staffName: { type: String, required: true },
    staffRole: { type: String, required: true },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['order', 'product', 'user', 'coupon', 'staff', 'settings', 'review'],
      required: true,
    },
    targetId: { type: String },
    targetLabel: { type: String },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

StaffActivityLogSchema.index({ staffId: 1, timestamp: -1 });
StaffActivityLogSchema.index({ timestamp: -1 });
StaffActivityLogSchema.index({ targetType: 1 });

export default mongoose.models.StaffActivityLog ||
  mongoose.model<IStaffActivityLog>('StaffActivityLog', StaffActivityLogSchema);
