import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export const revalidate = 60;

export async function GET() {
  try {
    await dbConnect();

    // 1. Get products explicitly marked as New Arrival with lean query
    let newDropProducts = await Product.find({ isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // 2. Fallback: If we have fewer than 8 marked products, fill with latest arrivals
    if (newDropProducts.length < 8) {
      const dropIds = newDropProducts.map((p) => p._id);
      const additionalProducts = await Product.find({ _id: { $nin: dropIds } })
        .sort({ createdAt: -1 })
        .limit(8 - newDropProducts.length)
        .lean();

      newDropProducts = [...newDropProducts, ...additionalProducts];
    }

    return NextResponse.json(
      { success: true, products: newDropProducts },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch new drop products' },
      { status: 500 }
    );
  }
}

