import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    // First, try to find products explicitly marked as trending
    let trendingProducts = await Product.find({ isTrending: true })
                                         .sort({ createdAt: -1 })
                                         .limit(8); 
    
    // Fallback: If no products are marked as trending, just show the latest 8 products
    if (!trendingProducts || trendingProducts.length === 0) {
      trendingProducts = await Product.find({})
                                       .sort({ createdAt: -1 })
                                       .limit(8);
    }
    
    return NextResponse.json({ success: true, products: trendingProducts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch trending products' }, { status: 500 });
  }
}
