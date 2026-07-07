import mongoose, { Schema, Document } from 'mongoose';
import type { StaffRole } from '@/lib/staffPermissions';

export interface IStaff extends Document {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  isActive: boolean;
  lastLogin?: Date;
  createdBy: string; // Super Admin email who created this staff
}

const StaffSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'manager', 'support'],
      default: 'support',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

StaffSchema.index({ email: 1 });
StaffSchema.index({ role: 1 });

export default mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);
