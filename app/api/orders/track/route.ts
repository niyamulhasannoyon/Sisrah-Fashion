import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { orderId, phone } = await req.json();
    console.log('Tracking request:', { orderId, phone });

    if (!orderId || !phone) {
      return NextResponse.json({ success: false, message: "Order ID and Phone are required" }, { status: 400 });
    }

    const trimmedPhone = phone.trim();

    const order = await Order.findOne({
      orderId: Number(orderId),
      'shippingInfo.phone': trimmedPhone
    });

    console.log('Order found:', order ? 'Yes' : 'No');

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found. Please check your details." }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
