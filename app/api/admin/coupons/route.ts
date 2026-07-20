import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Coupon from '@/models/Coupon';
import Order from '@/models/Order';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!await isAdmin() && !await hasAccessTo('coupons')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();

    const coupons = await Coupon.find().sort({ createdAt: -1 });

    // Aggregate total discount given per coupon from orders
    const couponDiscounts = await Order.aggregate([
      { $match: { couponCode: { $exists: true, $nin: [null, ''] } } },
      {
        $group: {
          _id: '$couponCode',
          totalDiscount: { $sum: { $ifNull: ['$couponDiscount', 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 0, '$totalAmount'] } },
        },
      },
    ]);

    // Build a lookup map: couponCode -> { totalDiscount, totalRevenue }
    const discountMap = new Map(
      couponDiscounts.map((d: any) => [d._id, { totalDiscount: d.totalDiscount, totalRevenue: d.totalRevenue }])
    );

    // Attach usage stats to each coupon
    const enrichedCoupons = coupons.map((coupon: any) => {
      const stats = discountMap.get(coupon.code) || { totalDiscount: 0, totalRevenue: 0 };
      return {
        ...coupon.toObject(),
        totalDiscount: stats.totalDiscount,
        totalRevenue: stats.totalRevenue,
      };
    });

    return NextResponse.json({ success: true, coupons: enrichedCoupons });
  } catch (error) {
    console.error('[Coupons GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('coupons')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();
    const newCoupon = await Coupon.create(body);
    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('coupons')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID is required' }, { status: 400 });
    }
    await Coupon.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete coupon" }, { status: 500 });
  }
}
