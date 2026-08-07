import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findOne({ orderId: Number(orderId) });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // If already paid, return status
    if (order.paymentStatus === 'Paid') {
      return NextResponse.json({
        success: true,
        orderId: order.orderId,
        paymentStatus: 'Paid',
        paymentMethod: order.paymentMethod,
        transactionId: order.transactionId,
        totalAmount: order.totalAmount,
      });
    }

    // If order is pending and has AmaderPay session ID in internalNotes, re-verify with AmaderPay
    let amaderpayPaymentId = null;
    if (order.internalNotes) {
      const match = order.internalNotes.match(/AmaderPay Session ID:\s*([^\s]+)/);
      if (match && match[1]) {
        amaderpayPaymentId = match[1];
      }
    }

    if (amaderpayPaymentId) {
      try {
        const amaderpayBaseUrl = process.env.AMADERPAY_BASE_URL || 'https://amaderpay.vercel.app';
        const verifyRes = await fetch(`${amaderpayBaseUrl}/api/v1/checkout/verify/${amaderpayPaymentId}`, {
          cache: 'no-store',
        });
        const verifyData = await verifyRes.json();

        if (verifyData.status === 'success' && verifyData.payment_status === 'completed') {
          order.paymentStatus = 'Paid';
          order.transactionId = verifyData.trx_id || verifyData.transaction_id || amaderpayPaymentId;
          order.paidAmount = verifyData.amount || order.totalAmount;
          if (verifyData.payment_method) {
            order.paymentMethod = `AmaderPay (${verifyData.payment_method})`;
          }
          await order.save();

          return NextResponse.json({
            success: true,
            orderId: order.orderId,
            paymentStatus: 'Paid',
            paymentMethod: order.paymentMethod,
            transactionId: order.transactionId,
            totalAmount: order.totalAmount,
          });
        }
      } catch (verifyErr) {
        console.error('[Check Status AmaderPay Verify Error]:', verifyErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      totalAmount: order.totalAmount,
    });
  } catch (error: any) {
    console.error('[Check Status API Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
