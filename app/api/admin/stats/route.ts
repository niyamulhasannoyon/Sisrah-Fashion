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

    return NextResponse.json({
      success: true,
      stats: { 
        totalRevenue, 
        totalOrders, 
        totalCustomers,
        conversionRate: 0 // Placeholder or calculate based on sessions if available
      },
      recentOrders
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
