import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Coupon from '@/models/Coupon';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { code, totalAmount } = await req.json();

    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) return NextResponse.json({ success: false, message: "Invalid Coupon Code" });

    if (new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ success: false, message: "Coupon has expired" });
    }

    if (totalAmount < coupon.minPurchase) {
      return NextResponse.json({ success: false, message: `Minimum purchase of ৳${coupon.minPurchase} required` });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error validating coupon" });
  }
}
