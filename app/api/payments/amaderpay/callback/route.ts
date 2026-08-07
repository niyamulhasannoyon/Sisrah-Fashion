import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderIdParam = searchParams.get('orderId') || searchParams.get('order_id');
    const paymentId = searchParams.get('payment_id') || searchParams.get('paymentId') || searchParams.get('id');

    const reqOrigin = req.headers.get('origin') || req.headers.get('referer');
    let siteBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app';
    if (reqOrigin) {
      try {
        const url = new URL(reqOrigin);
        siteBaseUrl = `${url.protocol}//${url.host}`;
      } catch (e) {
        // Fallback to default
      }
    }

    if (!orderIdParam) {
      return NextResponse.redirect(`${siteBaseUrl}/checkout?error=invalid_callback`);
    }

    await dbConnect();
    const order = await Order.findOne({ orderId: Number(orderIdParam) });
    if (!order) {
      return NextResponse.redirect(`${siteBaseUrl}/checkout?error=order_not_found`);
    }

    const amaderpayBaseUrl = process.env.AMADERPAY_BASE_URL || 'https://amaderpay.vercel.app';

    // Extract payment ID from internalNotes if not in query params
    let targetPaymentId = paymentId;
    if (!targetPaymentId && order.internalNotes) {
      const match = order.internalNotes.match(/AmaderPay Session ID:\s*([^\s]+)/);
      if (match && match[1]) {
        targetPaymentId = match[1];
      }
    }

    if (targetPaymentId) {
      const verifyRes = await fetch(`${amaderpayBaseUrl}/api/v1/checkout/verify/${targetPaymentId}`, {
        cache: 'no-store',
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status === 'success' && verifyData.payment_status === 'completed') {
        order.paymentStatus = 'Paid';
        order.transactionId = verifyData.trx_id || verifyData.transaction_id || targetPaymentId;
        order.paidAmount = verifyData.amount || order.totalAmount;
        if (verifyData.payment_method) {
          order.paymentMethod = `AmaderPay (${verifyData.payment_method})`;
        } else {
          order.paymentMethod = 'AmaderPay Auto Gateway';
        }
        await order.save();

        return NextResponse.redirect(
          `${siteBaseUrl}/order-success?id=${order.orderId}&phone=${encodeURIComponent(order.shippingInfo.phone)}&payment=success`
        );
      } else if (verifyData.payment_status === 'pending') {
        return NextResponse.redirect(
          `${siteBaseUrl}/order-success?id=${order.orderId}&phone=${encodeURIComponent(order.shippingInfo.phone)}&payment=pending`
        );
      }
    }

    // Default redirect to order success page
    return NextResponse.redirect(
      `${siteBaseUrl}/order-success?id=${order.orderId}&phone=${encodeURIComponent(order.shippingInfo.phone)}`
    );
  } catch (error: any) {
    console.error('[AmaderPay Callback Exception]:', error);
    const siteBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.vercel.app';
    return NextResponse.redirect(`${siteBaseUrl}/checkout?error=callback_failed`);
  }
}
