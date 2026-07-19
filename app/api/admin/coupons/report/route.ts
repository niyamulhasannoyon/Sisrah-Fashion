import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/coupons/report
 *
 * Returns comprehensive coupon performance analytics within a date range.
 *
 * Query params:
 *   startDate  - ISO date string (default: 30 days ago)
 *   endDate    - ISO date string (default: today)
 */
export async function GET(req: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const now = new Date();

    // Parse date range (default: last 30 days)
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date();
    endDate.setHours(23, 59, 59, 999);

    const dateMatch = { createdAt: { $gte: startDate, $lte: endDate } };

    // ── Total orders & coupon orders in range ────────────────────────────────
    const totalOrdersInRange = await Order.countDocuments({ ...dateMatch, orderStatus: { $ne: 'Cancelled' } });
    const couponOrdersInRange = await Order.countDocuments({
      ...dateMatch,
      couponCode: { $exists: true, $nin: [null, ''] },
      orderStatus: { $ne: 'Cancelled' },
    });

    // ── Revenue & discount totals in range ────────────────────────────────────
    const revenueResult = await Order.aggregate([
      { $match: { ...dateMatch, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalDiscount: { $sum: { $ifNull: ['$couponDiscount', 0] } },
          couponOrderCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$couponCode', null] }, { $ne: ['$couponCode', ''] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const totals = revenueResult[0] || { totalRevenue: 0, totalDiscount: 0, couponOrderCount: 0 };

    // ── Per-coupon breakdown ──────────────────────────────────────────────────
    const perCouponStats = await Order.aggregate([
      { $match: { ...dateMatch, couponCode: { $exists: true, $nin: [null, ''] } } },
      {
        $group: {
          _id: '$couponCode',
          orderCount: { $sum: 1 },
          totalDiscount: { $sum: { $ifNull: ['$couponDiscount', 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 0, '$totalAmount'] } },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { totalDiscount: -1 } },
      {
        $addFields: {
          discountPercentage: {
            $cond: [
              { $gt: ['$totalRevenue', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalDiscount', { $add: ['$totalRevenue', '$totalDiscount'] }] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
    ]);

    // ── Daily trend data ──────────────────────────────────────────────────────
    const dailyTrend = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 0, 1] } },
          revenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 0, '$totalAmount'] } },
          couponOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$couponCode', null] },
                    { $ne: ['$couponCode', ''] },
                    { $ne: ['$orderStatus', 'Cancelled'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          couponDiscount: { $sum: { $ifNull: ['$couponDiscount', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with zeros
    const trendData: any[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dateStr = cursor.toISOString().split('T')[0];
      const day = dailyTrend.find((d: any) => d._id === dateStr);
      trendData.push({
        date: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: day?.orders || 0,
        revenue: day?.revenue || 0,
        couponOrders: day?.couponOrders || 0,
        couponDiscount: day?.couponDiscount || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // ── Coupon health (expiring / exhausted) ──────────────────────────────────
    const allCoupons = await Coupon.find({}).lean();
    const expiringSoon = allCoupons.filter((c: any) => {
      if (!c.expiryDate) return false;
      const daysUntilExpiry = Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    });
    const exhausted = allCoupons.filter((c: any) => c.maxUses && c.usedCount >= c.maxUses);

    // ── Overall summary ───────────────────────────────────────────────────────
    const avgDiscountPerCouponOrder = totals.couponOrderCount > 0
      ? Math.round(totals.totalDiscount / totals.couponOrderCount)
      : 0;
    const discountRate = totals.totalRevenue > 0
      ? Math.round((totals.totalDiscount / (totals.totalRevenue + totals.totalDiscount)) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalOrders: totalOrdersInRange,
        couponOrders: totals.couponOrderCount,
        couponUsageRate: totalOrdersInRange > 0
          ? Math.round((totals.couponOrderCount / totalOrdersInRange) * 100)
          : 0,
        totalRevenue: totals.totalRevenue,
        totalDiscount: totals.totalDiscount,
        avgDiscountPerCouponOrder,
        discountRate,
      },
      perCoupon: perCouponStats,
      trend: trendData,
      couponHealth: {
        expiringSoon: expiringSoon.map((c: any) => ({
          code: c.code,
          daysLeft: Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          usedCount: c.usedCount || 0,
          maxUses: c.maxUses,
        })),
        exhausted: exhausted.map((c: any) => ({
          code: c.code,
          usedCount: c.usedCount,
          maxUses: c.maxUses,
        })),
      },
    });

  } catch (error) {
    console.error('[Coupon Report]', error);
    return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 });
  }
}
