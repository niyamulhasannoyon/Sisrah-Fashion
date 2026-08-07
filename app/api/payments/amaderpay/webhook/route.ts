import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment_id, order_id, trx_id, amount, payment_method, status, payment_status } = body;

    const targetOrderId = order_id || body.orderId;
    const targetPaymentId = payment_id || body.paymentId;
    const currentStatus = payment_status || status;

    if (!targetOrderId && !targetPaymentId) {
      return NextResponse.json({ success: false, error: 'Missing order_id or payment_id' }, { status: 400 });
    }

    await dbConnect();
    let order = null;

    if (targetOrderId) {
      order = await Order.findOne({ orderId: Number(targetOrderId) });
    }

    if (!order && targetPaymentId) {
      order = await Order.findOne({ internalNotes: { $regex: targetPaymentId, $options: 'i' } });
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Verify with AmaderPay API if payment_id is provided
    const amaderpayBaseUrl = process.env.AMADERPAY_BASE_URL || 'https://amaderpay.vercel.app';
    if (targetPaymentId) {
      const verifyRes = await fetch(`${amaderpayBaseUrl}/api/v1/checkout/verify/${targetPaymentId}`, {
        cache: 'no-store',
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status === 'success' && verifyData.payment_status === 'completed') {
        order.paymentStatus = 'Paid';
        order.transactionId = verifyData.trx_id || trx_id || targetPaymentId;
        order.paidAmount = verifyData.amount || amount || order.totalAmount;
        if (verifyData.payment_method) {
          order.paymentMethod = `AmaderPay (${verifyData.payment_method})`;
        }
        await order.save();

        console.log(`[AmaderPay Webhook]: Order #${order.orderId} successfully updated to Paid via Webhook verification.`);
        return NextResponse.json({ success: true, message: 'Order payment status updated to Paid' });
      }
    }

    // Fallback status check from webhook body payload directly
    if (currentStatus === 'completed' || currentStatus === 'paid' || currentStatus === 'success') {
      order.paymentStatus = 'Paid';
      if (trx_id) order.transactionId = trx_id;
      if (amount) order.paidAmount = amount;
      if (payment_method) order.paymentMethod = `AmaderPay (${payment_method})`;
      await order.save();

      console.log(`[AmaderPay Webhook]: Order #${order.orderId} updated to Paid via Direct Payload.`);
      return NextResponse.json({ success: true, message: 'Order marked as Paid' });
    }

    return NextResponse.json({ success: true, message: 'Webhook received' });
  } catch (error: any) {
    console.error('[AmaderPay Webhook Exception]:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
