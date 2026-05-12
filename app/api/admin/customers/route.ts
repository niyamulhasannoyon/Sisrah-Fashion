import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, customers }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch customers", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
