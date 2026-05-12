import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Coupon from '@/models/Coupon';

export async function GET() {
  await dbConnect();
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return NextResponse.json({ success: true, coupons });
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const newCoupon = await Coupon.create(body);
    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create coupon" }, { status: 500 });
  }
}
