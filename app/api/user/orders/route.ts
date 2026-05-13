import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const cookieStore = cookies();
    const token = cookieStore.get('loomra_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId;

    const user = await User.findById(userId);
    
    if (!user) {
       return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const userOrders = await Order.find({ 'shippingInfo.phone': user.phone }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders: userOrders }, { status: 200 });

  } catch (error) {
    console.error('Fetch user orders error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
