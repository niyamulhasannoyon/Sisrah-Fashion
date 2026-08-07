import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // Find order in DB
    const order = await Order.findOne({ orderId: Number(orderId) });
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const apiKey = process.env.AMADERPAY_API_KEY || 'pg_live_1dca92c5c6ea1255c2d21fa871a0d5f6';
    const amaderpayBaseUrl = process.env.AMADERPAY_BASE_URL || 'https://amaderpay.vercel.app';
    
    // Determine site base URL for callback
    const reqOrigin = req.headers.get('origin') || req.headers.get('referer');
    let siteBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app';
    if (reqOrigin) {
      try {
        const url = new URL(reqOrigin);
        siteBaseUrl = `${url.protocol}//${url.host}`;
      } catch (e) {
        // Fallback
      }
    }
    siteBaseUrl = siteBaseUrl.replace(/\/+$/, '');

    // Directly redirect to /order-success with orderId parameter
    const successUrl = `${siteBaseUrl}/order-success?id=${order.orderId}`;
    const cancelUrl = `${siteBaseUrl}/checkout?payment=cancelled`;

    const amaderPayResponse = await fetch(`${amaderpayBaseUrl}/api/v1/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: order.totalAmount,
        order_id: String(order.orderId),
        customer_name: order.shippingInfo?.name || 'Customer',
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    const data = await amaderPayResponse.json();

    if (data.status === 'success' && data.checkout_url) {
      // Store payment_id if returned
      if (data.payment_id) {
        order.internalNotes = `AmaderPay Session ID: ${data.payment_id}`;
        await order.save();
      }

      return NextResponse.json({
        success: true,
        checkoutUrl: data.checkout_url,
        paymentId: data.payment_id,
      });
    } else {
      console.error('[AmaderPay Initiate Error]:', data);
      return NextResponse.json({
        success: false,
        error: data.message || data.error || 'Failed to generate AmaderPay checkout session',
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[AmaderPay Initiate Exception]:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
