import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { isAdmin } from '@/lib/adminAuth';
import { generateAndEmailInvoice } from '@/lib/invoice';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/orders/send-invoice
 *
 * Admin-only endpoint to manually send (or resend) an invoice email for an order.
 * Body: { orderId: string, customEmail?: string }
 *
 * - orderId: MongoDB _id of the order
 * - customEmail: optional override email (admin can type a different email)
 *
 * Returns the outcome of the send attempt.
 */
export async function POST(request: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { orderId, customEmail } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // Fetch the order from DB
    let order = await Order.findById(orderId).lean();
    if (!order) {
      order = await Order.findOne({ orderId: parseInt(orderId) }).lean();
    }
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Send invoice — customEmail overrides the order's stored email
    const result = await generateAndEmailInvoice(order, customEmail);

    // Handle the NO_EMAIL case with a clear message for the admin
    if (!result.success && result.reason === 'NO_EMAIL') {
      return NextResponse.json({
        success: false,
        error: 'Cannot send email. No email address is attached to this order, and no manual email was provided.',
        reason: 'NO_EMAIL',
      }, { status: 400 });
    }

    if (!result.success && result.reason === 'SEND_FAILED') {
      return NextResponse.json({
        success: false,
        error: 'Failed to send email via Resend. Check your API key and sender configuration.',
        reason: 'SEND_FAILED',
      }, { status: 500 });
    }

    if (!result.success && result.reason === 'GENERATION_FAILED') {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate the invoice PDF. The @react-pdf/renderer may have encountered an error.',
        reason: 'GENERATION_FAILED',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice emailed successfully!',
      messageId: result.messageId,
      orderNumber: result.orderNumber,
    });

  } catch (error: any) {
    console.error('[Send Invoice API] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error',
    }, { status: 500 });
  }
}
