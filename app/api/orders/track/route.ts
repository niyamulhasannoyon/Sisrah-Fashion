import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { orderId, phone } = await req.json();

    if (!orderId || !phone) {
      return NextResponse.json({ success: false, message: "Order ID and Phone are required" }, { status: 400 });
    }

    // Since we use the last 6 chars as public ID, we need to find the order that matches
    // This is a bit tricky with MongoDB IDs, so we'll fetch all orders from today/recent and match,
    // OR we can use regex to match the end of the ID.
    
    const order = await Order.findOne({
      _id: { $regex: new RegExp(orderId + '$', 'i') },
      'shippingInfo.phone': phone
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found. Please check your details." }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
