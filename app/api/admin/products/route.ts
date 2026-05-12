import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
// import { jwtVerify } from 'jose';
// Note: In production, verify the admin token here or via middleware before proceeding.

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    // Ensure slug uniqueness
    const existing = await Product.findOne({ slug: data.slug });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const newProduct = await Product.create(data);

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}