import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LandingPage from '@/models/LandingPage';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin() && !await hasAccessTo('landing-pages')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;

  try {
    const page = await LandingPage.findById(id)
      .populate('productIds', 'title slug basePrice offerPrice images description category variants')
      .lean();

    if (!page) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('[LandingPages] GET single error:', error);
    return NextResponse.json({ error: 'Failed to fetch landing page' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin() && !await hasAccessTo('landing-pages')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;

  try {
    const body = await req.json();

    // Validate layoutType if provided
    if (body.layoutType && !['single-product', 'multi-product'].includes(body.layoutType)) {
      return NextResponse.json(
        { error: 'layoutType must be "single-product" or "multi-product"' },
        { status: 400 }
      );
    }

    // Check slug uniqueness if slug is being changed
    if (body.slug) {
      const existing = await LandingPage.findOne({
        slug: body.slug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'A landing page with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, any> = {};

    if (body.pageTitle !== undefined) updateData.pageTitle = body.pageTitle;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.layoutType !== undefined) updateData.layoutType = body.layoutType;
    if (body.productIds !== undefined) updateData.productIds = body.productIds;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    if (body.customHero !== undefined) {
      updateData['customHero.customHeading'] = body.customHero.customHeading ?? '';
      updateData['customHero.customSubheading'] = body.customHero.customSubheading ?? '';
      updateData['customHero.customBannerImage'] = body.customHero.customBannerImage ?? '';
    }

    if (body.promotionalElements !== undefined) {
      updateData['promotionalElements.countdownTimerToggle'] =
        body.promotionalElements.countdownTimerToggle ?? false;
      updateData['promotionalElements.countdownTargetDate'] =
        body.promotionalElements.countdownTargetDate ?? null;
      updateData['promotionalElements.announcementText'] =
        body.promotionalElements.announcementText ?? '';
    }

    if (body.socialProof !== undefined) updateData.socialProof = body.socialProof;

    const page = await LandingPage.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate('productIds', 'title slug basePrice offerPrice images category')
      .lean();

    if (!page) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error('[LandingPages] PUT error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A landing page with this slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to update landing page' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin() && !await hasAccessTo('landing-pages')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;

  try {
    const page = await LandingPage.findByIdAndDelete(id);
    if (!page) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Landing page deleted successfully' });
  } catch (error) {
    console.error('[LandingPages] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete landing page' }, { status: 500 });
  }
}
