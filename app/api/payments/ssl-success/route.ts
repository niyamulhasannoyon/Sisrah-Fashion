import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    await dbConnect();

    // SSLCommerz sends data as application/x-www-form-urlencoded
    const formData = await req.formData();
    const tran_id = formData.get('tran_id') as string;
    const val_id = formData.get('val_id'); // Validation ID for secondary verification

    if (!tran_id) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=InvalidTransaction`);
    }

    // Update order status in MongoDB
    await Order.findByIdAndUpdate(tran_id, {
      paymentStatus: 'Paid',
      transactionId: val_id,
    });

    // Deduct inventory here if applicable

    // Redirect user back to frontend success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/order-success?orderId=${tran_id}`);

  } catch (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=PaymentFailed`);
  }
}