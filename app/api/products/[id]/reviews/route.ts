import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { cookies } from 'next/headers';
import * as jose from 'jose';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { rating, comment } = await req.json();

    const token = cookies().get('loomra_token')?.value;
    if (!token) return NextResponse.json({ error: 'Please login to review' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your_jwt_secret');
    const { payload } = await jose.jwtVerify(token, secret);

    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const alreadyReviewed = product.reviews.find((r: any) => r.user.toString() === payload.userId);
    if (alreadyReviewed) return NextResponse.json({ error: 'Product already reviewed' }, { status: 400 });

    const review = {
      user: payload.userId,
      name: (payload as any).name || 'User', 
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    
    product.rating = product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    return NextResponse.json({ success: true, message: 'Review added' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
