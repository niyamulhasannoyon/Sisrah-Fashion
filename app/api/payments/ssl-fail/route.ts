import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // SSLCommerz sends status updates as form data (x-www-form-urlencoded)
    const formData = await req.formData();
    const tran_id = formData.get('tran_id') as string;
    const val_id = formData.get('val_id') as string;
    const status = formData.get('status') as string;

    console.log(`[SSLCommerz Fail] Received failure webhook. tran_id: ${tran_id}, status: ${status}`);

    if (tran_id) {
      await Order.findByIdAndUpdate(tran_id, {
        paymentStatus: 'Failed',
        transactionId: val_id || '',
      });
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=PaymentFailed`, 303);
  } catch (error) {
    console.error('[SSLCommerz Fail Route] Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=PaymentFailed`, 303);
  }
}
