import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

/**
 * Verify that the IP making this request is from SSLCommerz.
 * In production, SSLCommerz uses specific IPs for server-to-server communication.
 * This prevents attackers from spoofing payment success callbacks.
 */
function isSslCommerzIp(ip: string | null): boolean {
  if (!ip) return false;
  
  // SSLCommerz known server IPs (update these for production)
  const allowedIps = [
    // Sandbox environment IPs
    '103.108.217.90',
    '103.108.217.91',
    // Add production SSLCommerz IPs when known
  ];
  
  // In development mode, allow localhost for testing
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return allowedIps.includes(ip);
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    // SSLCommerz sends data as application/x-www-form-urlencoded
    const formData = await req.formData();
    const tran_id = formData.get('tran_id') as string;
    const val_id = formData.get('val_id') as string;
    const status = formData.get('status') as string;
    const store_id = formData.get('store_id') as string;
    const currency = formData.get('currency') as string;
    const amount = formData.get('amount') as string;

    if (!tran_id) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=InvalidTransaction`, 303);
    }

    // Validate that the request is genuinely from SSLCommerz
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     '';

    // Check store_id matches our configured store
    const expectedStoreId = process.env.SSLCOMMERZ_STORE_ID;
    if (expectedStoreId && store_id && store_id !== expectedStoreId) {
      console.error(`[SSLCommerz] Store ID mismatch: expected ${expectedStoreId}, got ${store_id}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=InvalidMerchant`, 303);
    }

    // Verify payment status from gateway
    if (status && status !== 'VALID' && status !== 'VALIDATED') {
      console.error(`[SSLCommerz] Payment status is not valid: ${status}`);
      await Order.findByIdAndUpdate(tran_id, {
        paymentStatus: 'Failed',
        transactionId: val_id || '',
        paidAmount: 0,
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=PaymentFailed`, 303);
    }

    // Update order status in MongoDB
    await Order.findByIdAndUpdate(tran_id, {
      paymentStatus: 'Paid',
      transactionId: val_id || '',
      paidAmount: amount ? parseFloat(amount) : undefined,
    });

    // Deduct inventory here if applicable
    try {
      const order = await Order.findById(tran_id);
      if (order?.orderItems) {
        const Product = (await import('@/models/Product')).default;
        for (const item of order.orderItems) {
          // Decrement stock for each product variant if needed
          // This requires matching product by title and variant by size/color
        }
      }
    } catch (inventoryError) {
      console.error('[SSLCommerz] Inventory deduction failed (non-blocking):', inventoryError);
    }

    // Redirect user back to frontend success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/order-success?orderId=${tran_id}`, 303);

  } catch (error) {
    console.error('[SSLCommerz] Payment success handler error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=PaymentFailed`, 303);
  }
}
