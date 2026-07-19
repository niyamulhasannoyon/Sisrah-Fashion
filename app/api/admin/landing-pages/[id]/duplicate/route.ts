import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LandingPage from '@/models/LandingPage';
import { isStaffOrAdmin } from '@/lib/adminAuth';

// POST /api/admin/landing-pages/[id]/duplicate — Duplicate a landing page for A/B testing
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isStaffOrAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;

  try {
    const source = await LandingPage.findById(id).lean();
    if (!source) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    // Clone all fields with modified title/slug
    const timestamp = Date.now();
    const newSlug = `${source.slug}-copy-${timestamp}`;
    const newTitle = `${source.pageTitle} (Copy)`;

    // Check slug uniqueness
    const existing = await LandingPage.findOne({ slug: newSlug });
    if (existing) {
      return NextResponse.json(
        { error: 'Slug collision — please try again' },
        { status: 409 }
      );
    }

    const duplicated = await LandingPage.create({
      pageTitle: newTitle,
      slug: newSlug,
      layoutType: source.layoutType,
      productIds: source.productIds,
      customHero: source.customHero || {},
      promotionalElements: source.promotionalElements || {},
      socialProof: source.socialProof || [],
      isActive: false, // Duplicates start as inactive — safe default
    });

    const populated = await LandingPage.findById(duplicated._id)
      .populate('productIds', 'title slug basePrice offerPrice images category')
      .lean();

    return NextResponse.json(
      { success: true, page: populated, message: `Duplicated as "${newTitle}"` },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[LandingPages] DUPLICATE error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A landing page with this slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to duplicate landing page' }, { status: 500 });
  }
}
