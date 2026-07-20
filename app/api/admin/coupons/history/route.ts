import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/coupons/history
 *
 * Returns coupon usage history across all orders, sorted by most recent first.
 * Optional query param: ?code=SAVE20 to filter by a specific coupon code.
 *
 * Each entry includes the customer name, phone, order total, discount applied,
 * and the order date.
 */
export async function GET(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('coupons')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const couponCode = searchParams.get('code');

    // Build the query — only orders where couponCode exists and is not empty
    const match: Record<string, any> = {
      couponCode: { $exists: true, $nin: [null, ''] },
    };

    if (couponCode) {
      match.couponCode = couponCode.toUpperCase().trim();
    }

    const history = await Order.find(match)
      .select('couponCode couponDiscount totalAmount shippingInfo orderId createdAt')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Group by coupon code for summary stats alongside the timeline
    const grouped: Record<string, { code: string; totalUses: number; totalDiscount: number; totalRevenue: number; uses: any[] }> = {};

    for (const raw of history) {
      const entry = raw as any;
      const code = entry.couponCode as string;
      if (!grouped[code]) {
        grouped[code] = {
          code,
          totalUses: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          uses: [],
        };
      }
      grouped[code].totalUses += 1;
      grouped[code].totalDiscount += entry.couponDiscount || 0;
      grouped[code].totalRevenue += entry.totalAmount || 0;
      grouped[code].uses.push({
        orderId: entry.orderId || (entry as any)._id?.toString().slice(-6).toUpperCase(),
        customerName: entry.shippingInfo?.name || 'Unknown',
        customerPhone: entry.shippingInfo?.phone || '',
        totalAmount: entry.totalAmount,
        discount: entry.couponDiscount || 0,
        date: entry.createdAt,
      });
    }

    return NextResponse.json({
      success: true,
      history,                          // flat timeline (most recent 200)
      grouped: Object.values(grouped),   // per-coupon summary
      totalEntries: history.length,
    });

  } catch (error) {
    console.error('[Coupon History] Failed to fetch:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch coupon history' }, { status: 500 });
  }
}
