import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    
    // Fetch all reviews and populate associated product titles
    const reviews = await Review.find()
      .populate({
        path: 'product',
        select: 'title slug images',
        model: Product
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch reviews for admin:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
