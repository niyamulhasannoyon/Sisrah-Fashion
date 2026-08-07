import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, transactionId, paidAmount, markAsPaid } = body;

    if (!orderId || !transactionId) {
      return NextResponse.json({ success: false, error: 'Order ID and Transaction ID are required' }, { status: 400 });
    }

    const cleanTrxId = String(transactionId).replace(/<[^>]*>/g, '').trim();
    if (cleanTrxId.length < 4) {
      return NextResponse.json({ success: false, error: 'Transaction ID is too short' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findOne({ orderId: Number(orderId) });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    order.transactionId = cleanTrxId;
    if (paidAmount && typeof paidAmount === 'number' && paidAmount > 0) {
      order.paidAmount = paidAmount;
    }

    if (markAsPaid) {
      order.paymentStatus = 'Paid';
      if (!order.paidAmount) {
        order.paidAmount = order.totalAmount;
      }
      if (!order.paymentMethod?.includes('AmaderPay')) {
        order.paymentMethod = 'AmaderPay Auto Gateway';
      }
    }

    const existingNotes = order.internalNotes || '';
    order.internalNotes = `${existingNotes}\n[TrxID Sync]: ${cleanTrxId} (Paid: ${markAsPaid ? 'Yes' : 'Pending'}) at ${new Date().toISOString()}`.trim();

    await order.save();

    console.log(`[Order Update TrxID]: TrxID ${cleanTrxId} attached to Order #${order.orderId} (Paid: ${markAsPaid})`);

    return NextResponse.json({
      success: true,
      message: 'Transaction ID attached successfully',
      transactionId: cleanTrxId,
      paymentStatus: order.paymentStatus,
      orderId: order.orderId,
    });
  } catch (error: any) {
    console.error('[Update TrxID API Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
