import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LandingPage from '@/models/LandingPage';

export const dynamic = 'force-dynamic';

// GET /api/lp/[slug] — Public endpoint to fetch an active landing page with populated products
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;

  try {
    const page = await LandingPage.findOne({ slug, isActive: true })
      .populate('productIds', 'title slug basePrice offerPrice images description category variants rating numReviews')
      .lean();

    if (!page) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('[LP Public] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch landing page' }, { status: 500 });
  }
}
