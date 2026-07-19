import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import Notification from '@/models/Notification';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';
import { generateAndEmailInvoice } from '@/lib/invoice';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Validate required fields
    if (!body.shippingInfo || !body.orderItems || !body.totalAmount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: shippingInfo, orderItems, totalAmount' 
      }, { status: 400 });
    }

    // Sanitize shipping info to prevent XSS
    const sanitizedShipping = {
      name: (body.shippingInfo.name || '').replace(/<[^>]*>/g, '').trim(),
      phone: (body.shippingInfo.phone || '').replace(/<[^>]*>/g, '').trim(),
      address: (body.shippingInfo.address || '').replace(/<[^>]*>/g, '').trim(),
      city: (body.shippingInfo.city || '').replace(/<[^>]*>/g, '').trim(),
    };

    if (!sanitizedShipping.name || !sanitizedShipping.phone || !sanitizedShipping.address || !sanitizedShipping.city) {
      return NextResponse.json({ 
        success: false, 
        error: 'All shipping fields are required' 
      }, { status: 400 });
    }

    // Validate phone number format (Bangladesh)
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(sanitizedShipping.phone)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Bangladeshi phone number format' 
      }, { status: 400 });
    }

    // Sanitize order items
    const sanitizedItems = body.orderItems.map((item: any) => ({
      title: (item.title || '').replace(/<[^>]*>/g, '').trim(),
      price: typeof item.price === 'number' ? item.price : 0,
      image: (item.image || '').replace(/<[^>]*>/g, '').trim(),
      selectedSize: (item.selectedSize || '').replace(/<[^>]*>/g, '').trim(),
      selectedColor: (item.selectedColor || '').replace(/<[^>]*>/g, '').trim(),
      quantity: typeof item.quantity === 'number' ? Math.max(1, Math.floor(item.quantity)) : 1,
    }));

    if (sanitizedItems.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least one order item is required' 
      }, { status: 400 });
    }

    // Validate total amount
    const totalAmount = typeof body.totalAmount === 'number' ? Math.max(0, body.totalAmount) : 0;
    if (totalAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid total amount' 
      }, { status: 400 });
    }

    // Find the latest order to get the next orderId
    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const nextOrderId = lastOrder && lastOrder.orderId ? lastOrder.orderId + 1 : 100001;

    // Sanitize and validate coupon data
    const couponCode = typeof body.couponCode === 'string'
      ? body.couponCode.replace(/<[^>]*>/g, '').trim().toUpperCase()
      : undefined;
    const couponDiscount = typeof body.couponDiscount === 'number'
      ? Math.max(0, body.couponDiscount)
      : 0;

    const newOrder = await Order.create({
      shippingInfo: sanitizedShipping,
      orderItems: sanitizedItems,
      totalAmount,
      paymentMethod: typeof body.paymentMethod === 'string' ? body.paymentMethod : 'Cash on Delivery',
      paymentStatus: typeof body.paymentStatus === 'string' ? body.paymentStatus : 'Pending',
      transactionId: typeof body.transactionId === 'string' ? body.transactionId.replace(/<[^>]*>/g, '').trim() : undefined,
      paidAmount: typeof body.paidAmount === 'number' ? Math.max(0, body.paidAmount) : undefined,
      couponCode,
      couponDiscount,
      orderId: nextOrderId
    });

    // Increment coupon usage count if a coupon was applied
    if (couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: couponCode },
          { $inc: { usedCount: 1 } }
        );
      } catch (couponErr) {
        console.error('[Order] Failed to increment coupon usage:', couponErr);
      }
    }

    console.log('[Order] Created:', JSON.stringify({ orderId: nextOrderId, totalAmount, couponCode }, null, 2));

    try {
      await Notification.create({
        title: 'New Order Placed',
        message: `Order #${nextOrderId} of ৳${totalAmount.toLocaleString()} has been placed by ${sanitizedShipping.name}.`,
        type: 'order',
        link: `/orders/${newOrder._id}`,
        isRead: false
      });
    } catch (notifError) {
      console.error('[Order] Failed to create notification:', notifError);
    }

    // Auto-generate invoice (non-blocking)
    generateAndEmailInvoice(newOrder.toObject(), body.shippingInfo?.email);

    return NextResponse.json({ 
      success: true, 
      orderId: nextOrderId, 
      phone: sanitizedShipping.phone 
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
