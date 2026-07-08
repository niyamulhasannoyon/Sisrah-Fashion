import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Order from '@/models/Order';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { cookies } from 'next/headers';
import * as jose from 'jose';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { rating, comment, images } = await req.json();

    const token = (await cookies()).get('loomra_token')?.value;
    if (!token) return NextResponse.json({ error: 'Please login to review' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your_jwt_secret');
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId;

    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if already reviewed in the separate collection
    const alreadyReviewed = await Review.findOne({ product: id, user: userId });
    if (alreadyReviewed) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if verified purchase (Order delivered containing this product title)
    // We check user's phone from profile
    const userOrders = await Order.findOne({
      'shippingInfo.phone': user.phone,
      orderStatus: { $in: ['Delivered', 'Completed'] },
      'orderItems.title': product.title
    });

    const verifiedPurchase = !!userOrders;

    const review = await Review.create({
      user: userId,
      product: id,
      name: user.name,
      rating: Number(rating),
      comment: comment || '',
      images: images || [],
      verifiedPurchase,
      status: 'pending', // Moderation queue (pending by default)
    });

    try {
      await Notification.create({
        title: 'New Review Submitted',
        message: `A new review has been submitted for "${product.title}" by ${user.name} and is pending moderation.`,
        type: 'review',
        link: '/reviews',
        isRead: false
      });
    } catch (notifError) {
      console.error('Failed to create review notification:', notifError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Review submitted successfully. It will be visible once approved by admin.',
      review 
    }, { status: 201 });

  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
