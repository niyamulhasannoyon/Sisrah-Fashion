import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const deliveredOrders = await Order.find({ orderStatus: 'Delivered' });
    const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get daily stats for last 7 days
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
          orders: { $sum: 1 }
        }
      }
    ]);

    const chartData = last7Days.map(date => {
      const dayData = dailyData.find(d => d._id === date);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayData ? dayData.revenue : 0,
        orders: dayData ? dayData.orders : 0
      };
    });

    return NextResponse.json({
      success: true,
      stats: { 
        totalRevenue, 
        totalOrders, 
        totalCustomers,
        conversionRate: 0 
      },
      recentOrders,
      chartData
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
