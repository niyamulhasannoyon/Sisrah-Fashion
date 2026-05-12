import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    // Sort by createdAt descending to get the newest products
    const latestProducts = await Product.find()
                                        .sort({ createdAt: -1 })
                                        .limit(8); 
    
    return NextResponse.json({ success: true, products: latestProducts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch latest products' }, { status: 500 });
  }
}
