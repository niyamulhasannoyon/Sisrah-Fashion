import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await isAdmin() && !await hasAccessTo('orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;
    const { orderStatus, paymentStatus } = await req.json();
    const updateData: any = {};
    if (orderStatus !== undefined) {
      updateData.orderStatus = orderStatus;
      if (orderStatus === 'Delivered') {
        updateData.deliveredAt = new Date();
      }
    }
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (orderStatus === 'Delivered') {
      console.log(`[NOTIFICATION] Order #${updatedOrder._id} manual confirmation to Delivered. timestamp: ${updatedOrder.deliveredAt}`);
      console.log(`[MOCK SMS] Sent to ${updatedOrder.shippingInfo.phone}: "আপনার AS SIDRAT অর্ডার #${updatedOrder._id.toString().slice(-8).toUpperCase()} সফলভাবে ডেলিভার করা হয়েছে! আমাদের প্রোডাক্ট সম্পর্কে আপনার মতামত শেয়ার করুন।"`);
      console.log(`[MOCK EMAIL] Sent to customer: "Your order #${updatedOrder._id.toString().slice(-8).toUpperCase()} has been delivered successfully. Please leave a review!"`);
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
