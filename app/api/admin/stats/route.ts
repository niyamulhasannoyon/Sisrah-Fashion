import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!await isAdmin() && !await hasAccessTo('dashboard')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();

    const deliveredOrders = await Order.find({ orderStatus: 'Delivered' });
    const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Calculate net profit
    const productsList = await Product.find({}, 'title costPrice marketingCost deliveryCost');
    const productMap = new Map(productsList.map(p => [
      p.title.toLowerCase().trim(), 
      {
        costPrice: p.costPrice || 0,
        marketingCost: p.marketingCost || 0,
        deliveryCost: p.deliveryCost || 0
      }
    ]));

    let totalCost = 0;
    deliveredOrders.forEach(order => {
      order.orderItems.forEach((item: any) => {
        const pInfo = productMap.get(item.title.toLowerCase().trim()) || { costPrice: 0, marketingCost: 0, deliveryCost: 0 };
        const qty = item.quantity || 0;
        totalCost += ((pInfo.costPrice || 0) + (pInfo.marketingCost || 0) + (pInfo.deliveryCost || 0)) * qty;
      });
    });

    const netProfit = totalRevenue - totalCost;

    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // ── Coupon Analytics ──────────────────────────────────────────────────────
    const couponStatsArray = await Order.aggregate([
      { $match: { couponCode: { $exists: true, $nin: [null, ''] } } },
      {
        $group: {
          _id: '$couponCode',
          count: { $sum: 1 },
          totalDiscount: { $sum: { $ifNull: ['$couponDiscount', 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 0, '$totalAmount'] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const totalOrdersWithCoupon = couponStatsArray.reduce((sum, c) => sum + c.count, 0);
    const totalDiscountGiven = couponStatsArray.reduce((sum, c) => sum + c.totalDiscount, 0);

    // ── Daily Chart Data ───────────────────────────────────────────────────────
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const dailyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 0, "$totalAmount"] } },
          orders: { $sum: 1 },
          couponDiscount: { $sum: { $ifNull: ['$couponDiscount', 0] } },
          couponOrders: { $sum: { $cond: [{ $and: [{ $ne: ['$couponCode', null] }, { $ne: ['$couponCode', ''] }] }, 1, 0] } },
        }
      }
    ]);

    const chartData = last7Days.map(date => {
      const dayData = dailyData.find(d => d._id === date);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayData ? dayData.revenue : 0,
        orders: dayData ? dayData.orders : 0,
        couponDiscount: dayData ? dayData.couponDiscount : 0,
        couponOrders: dayData ? dayData.couponOrders : 0,
      };
    });

    return NextResponse.json({
      success: true,
      stats: { 
        totalRevenue, 
        netProfit,
        totalOrders, 
        totalCustomers,
        conversionRate: 0
      },
      couponAnalytics: {
        totalOrdersWithCoupon,
        totalDiscountGiven,
        couponUsageRate: totalOrders > 0 ? Math.round((totalOrdersWithCoupon / totalOrders) * 100) : 0,
        topCoupons: couponStatsArray,
      },
      recentOrders,
      chartData
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
