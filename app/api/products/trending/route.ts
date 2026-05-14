import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    // 1. Get products explicitly marked as trending
    let trendingProducts = await Product.find({ isTrending: true })
                                         .sort({ createdAt: -1 })
                                         .limit(8); 
    
    // 2. If we have fewer than 8 trending products, fill the rest with latest products
    if (trendingProducts.length < 8) {
      const trendingIds = trendingProducts.map(p => p._id);
      const additionalProducts = await Product.find({ _id: { $nin: trendingIds } })
                                               .sort({ createdAt: -1 })
                                               .limit(8 - trendingProducts.length);
      
      trendingProducts = [...trendingProducts, ...additionalProducts];
    }
    
    return NextResponse.json({ success: true, products: trendingProducts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch trending products' }, { status: 500 });
  }
}
