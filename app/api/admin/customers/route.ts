import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).lean();
    
    const customersWithOrders = await Promise.all(
      customers.map(async (customer: any) => {
        // Query orders matching the phone number
        const orders = await Order.find({ 'shippingInfo.phone': customer.phone })
          .select('_id orderId totalAmount orderStatus createdAt shippingInfo')
          .sort({ createdAt: -1 })
          .lean();

        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        
        // Extract unique shipping addresses used
        const addresses = [...new Set(orders.map((o: any) => `${o.shippingInfo.address}, ${o.shippingInfo.city}`).filter(Boolean))];

        return {
          ...customer,
          totalOrders,
          totalSpent,
          addresses,
          orderHistory: orders.map((o: any) => ({
            _id: o._id,
            orderId: o.orderId,
            totalAmount: o.totalAmount,
            orderStatus: o.orderStatus,
            createdAt: o.createdAt
          }))
        };
      })
    );

    return NextResponse.json({ success: true, customers: customersWithOrders }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch customers", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
