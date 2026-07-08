import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { orderIds, orderStatus, courier, trackingNumber } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid order IDs' }, { status: 400 });
    }

    const updateData: any = {};
    if (orderStatus !== undefined) {
      updateData.orderStatus = orderStatus;
      if (orderStatus === 'Delivered') {
        updateData.deliveredAt = new Date();
      }
      if (orderStatus === 'Shipped') {
        if (!courier?.trim() || !trackingNumber?.trim()) {
          return NextResponse.json({ 
            success: false, 
            error: 'Courier and tracking number are mandatory for Shipped status' 
          }, { status: 400 });
        }
        updateData.courier = courier;
        updateData.trackingNumber = trackingNumber;
      }
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, count: result.modifiedCount }, { status: 200 });
  } catch (error) {
    console.error('Failed to bulk update orders:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
