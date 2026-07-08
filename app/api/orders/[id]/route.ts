import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const VALID_TRANSITIONS: Record<string, string[]> = {
  'Pending': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Processing', 'Cancelled'],
  'Processing': ['Shipped', 'Cancelled'],
  'Shipped': ['Delivered', 'Cancelled'],
  'Delivered': ['Completed', 'Refunded'],
  'Completed': ['Refunded'],
  'Cancelled': [],
  'Refunded': []
};

// GET single order details
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await isAdmin() && !await hasAccessTo('orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error('Failed to get order details:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// PUT (update) order details
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await isAdmin() && !await hasAccessTo('orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus, courier, trackingNumber, internalNotes } = body;

    // Fetch existing order to check current status for flow validation
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};

    // Validate status flow if orderStatus is provided
    if (orderStatus !== undefined && orderStatus !== existingOrder.orderStatus) {
      // Validate courier and tracking number if transitioning to Shipped
      if (orderStatus === 'Shipped') {
        const finalCourier = courier !== undefined ? courier : existingOrder.courier;
        const finalTracking = trackingNumber !== undefined ? trackingNumber : existingOrder.trackingNumber;
        if (!finalCourier?.trim() || !finalTracking?.trim()) {
          return NextResponse.json({
            success: false,
            error: 'Courier name and tracking number are mandatory when status is Shipped.'
          }, { status: 400 });
        }
      }

      // Check strict transition flow
      const currentStatus = existingOrder.orderStatus || 'Pending';
      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
      // Cancelled and Refunded can be transitioned to from most states as exceptions, but let's check
      if (!allowedNext.includes(orderStatus) && orderStatus !== 'Cancelled' && orderStatus !== 'Refunded') {
        return NextResponse.json({
          success: false,
          error: `Invalid status transition: cannot change from ${currentStatus} to ${orderStatus}.`
        }, { status: 400 });
      }

      updateData.orderStatus = orderStatus;
      if (orderStatus === 'Delivered') {
        updateData.deliveredAt = new Date();
      }
    }

    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
    }

    if (courier !== undefined) {
      updateData.courier = courier;
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes;
    }

    // Save changes
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (orderStatus === 'Delivered') {
      console.log(`[NOTIFICATION] Order #${updatedOrder._id} manual confirmation to Delivered. timestamp: ${updatedOrder.deliveredAt}`);
      console.log(`[MOCK SMS] Sent to ${updatedOrder.shippingInfo.phone}: "আপনার AS SIDRAT অর্ডার #${updatedOrder.orderId || updatedOrder._id.toString().slice(-8).toUpperCase()} সফলভাবে ডেলিভার করা হয়েছে! আমাদের প্রোডাক্ট সম্পর্কে আপনার মতামত শেয়ার করুন।"`);
      console.log(`[MOCK EMAIL] Sent to customer: "Your order #${updatedOrder.orderId || updatedOrder._id.toString().slice(-8).toUpperCase()} has been delivered successfully. Please leave a review!"`);
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// DELETE order
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await isAdmin() && !await hasAccessTo('orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
