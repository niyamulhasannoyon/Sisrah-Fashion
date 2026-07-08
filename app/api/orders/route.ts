import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Notification from '@/models/Notification';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Find the latest order to get the next orderId
    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const nextOrderId = lastOrder && lastOrder.orderId ? lastOrder.orderId + 1 : 100001;

    const newOrder = await Order.create({
      ...body,
      orderId: nextOrderId
    });

    console.log('New Order Created:', JSON.stringify(newOrder, null, 2));

    try {
      await Notification.create({
        title: 'New Order Placed',
        message: `Order #${nextOrderId} of ৳${(body.totalAmount || 0).toLocaleString()} has been placed by ${body.shippingInfo?.name || 'Customer'}.`,
        type: 'order',
        link: `/orders/${newOrder._id}`,
        isRead: false
      });
    } catch (notifError) {
      console.error('Failed to create new order notification:', notifError);
    }

    return NextResponse.json({ 
      success: true, 
      orderId: nextOrderId, 
      phone: body.shippingInfo.phone 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();

    // Parse query params for search and filters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    let query: any = {};

    // Status filter
    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date
        query.createdAt.$lte = end;
      }
    }

    // Search filter: Order ID, customer name, phone number
    if (search) {
      const searchRegex = new RegExp(search, 'i');

      // Check if search query is numeric (for orderId match)
      const searchNum = parseInt(search);
      const isNumeric = !isNaN(searchNum);

      query.$or = [
        { 'shippingInfo.name': searchRegex },
        { 'shippingInfo.phone': searchRegex }
      ];

      if (isNumeric) {
        query.$or.push({ orderId: searchNum });
      }

      // Check for exact object ID
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: search });
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
