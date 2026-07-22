import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import LandingPage from '@/models/LandingPage';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  if (!await isAdmin() && !await hasAccessTo('landing-pages')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();

  try {
    const pages = await LandingPage.find({})
      .populate('productIds', 'title slug basePrice offerPrice images category')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error('[LandingPages] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch landing pages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await isAdmin() && !await hasAccessTo('landing-pages')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.pageTitle || !body.slug || !body.layoutType) {
      return NextResponse.json(
        { error: 'pageTitle, slug, and layoutType are required' },
        { status: 400 }
      );
    }

    if (!['single-product', 'multi-product'].includes(body.layoutType)) {
      return NextResponse.json(
        { error: 'layoutType must be "single-product" or "multi-product"' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await LandingPage.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json(
        { error: 'A landing page with this slug already exists' },
        { status: 409 }
      );
    }

    const page = await LandingPage.create({
      pageTitle: body.pageTitle,
      slug: body.slug,
      layoutType: body.layoutType,
      productIds: body.productIds || [],
      customHero: {
        customHeading: body.customHero?.customHeading || '',
        customSubheading: body.customHero?.customSubheading || '',
        customBannerImage: body.customHero?.customBannerImage || '',
        customMobileBannerImage: body.customHero?.customMobileBannerImage || '',
      },
      promotionalElements: {
        countdownTimerToggle: body.promotionalElements?.countdownTimerToggle ?? false,
        countdownTargetDate: body.promotionalElements?.countdownTargetDate || null,
        announcementText: body.promotionalElements?.announcementText || '',
      },
      offerSettings: {
        freeShippingToggle: body.offerSettings?.freeShippingToggle ?? false,
        freeShippingMinQty: body.offerSettings?.freeShippingMinQty ?? 0,
        freeShippingMinAmount: body.offerSettings?.freeShippingMinAmount ?? 0,
        comboDiscountToggle: body.offerSettings?.comboDiscountToggle ?? false,
        comboDiscountType: body.offerSettings?.comboDiscountType || 'percentage',
        comboDiscountValue: body.offerSettings?.comboDiscountValue ?? 0,
        comboMinQty: body.offerSettings?.comboMinQty ?? 2,
      },
      socialProof: body.socialProof || [],
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error: any) {
    console.error('[LandingPages] POST error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A landing page with this slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create landing page' }, { status: 500 });
  }
}
