import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { isAdmin } from '@/lib/adminAuth';

async function updateProductRating(productId: string) {
  const approvedReviews = await Review.find({ product: productId, status: 'approved' });
  const numReviews = approvedReviews.length;
  const rating = numReviews > 0 
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews 
    : 0;

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;
    const { status } = await req.json();

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    const oldStatus = review.status;
    review.status = status;
    await review.save();

    // Trigger average rating recalculation if status changes to/from 'approved'
    if (oldStatus === 'approved' || status === 'approved') {
      await updateProductRating(review.product.toString());
    }

    return NextResponse.json({ success: true, review }, { status: 200 });
  } catch (error) {
    console.error('Failed to update review status:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    await Review.findByIdAndDelete(id);

    // Recalculate rating if the deleted review was approved
    if (review.status === 'approved') {
      await updateProductRating(review.product.toString());
    }

    return NextResponse.json({ success: true, message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
