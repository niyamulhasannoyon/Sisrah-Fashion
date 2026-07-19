import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Coupon from '@/models/Coupon';
import { couponLimiter } from '@/lib/rateLimiter';

export async function POST(req: Request) {
  try {
    // Apply rate limiting: 10 coupon validation attempts per minute (prevent brute-forcing)
    const limitCheck = couponLimiter.check(req);
    if (limitCheck.blocked) {
      return limitCheck.response!;
    }

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

    // Check if coupon has reached its maximum usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ success: false, message: "Coupon usage limit reached" });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error validating coupon" });
  }
}
