import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, customers }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch customers", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
