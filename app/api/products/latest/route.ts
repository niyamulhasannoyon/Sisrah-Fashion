import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export const revalidate = 60;

export async function GET() {
  try {
    await dbConnect();
    // Sort by createdAt descending to get the newest products
    const latestProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return NextResponse.json(
      { success: true, products: latestProducts },
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
      { success: false, error: 'Failed to fetch latest products' },
      { status: 500 }
    );
  }
}

