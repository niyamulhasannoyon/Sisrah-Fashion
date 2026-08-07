import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * Escapes regex special characters to prevent Regular Expression Denial of Service (ReDoS)
 * and NoSQL Injection attacks.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isAdminQuery = searchParams.get('admin') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));
    const skip = (page - 1) * limit;

    let query: Record<string, any> = {};
    if (category) {
      const sanitizedCategory = escapeRegex(category.replace(/-/g, ' '));
      query.category = { $regex: new RegExp(`^${sanitizedCategory}$`, 'i') };
    }

    let productsQuery = Product.find(query);
    
    // Non-admin shop listing uses projection for lean payload.
    // Admin listing requires full details (description, costs, lowStockThreshold, etc.)
    if (!isAdminQuery) {
      productsQuery = productsQuery.select(
        'title slug basePrice offerPrice category images rating numReviews isTrending isNewArrival variants'
      );
    }

    const [products, total] = await Promise.all([
      productsQuery
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const response = NextResponse.json(
      {
        success: true,
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );

    if (isAdminQuery) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      // Dynamic edge caching header with stale-while-revalidate strategy for public storefront
      response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    }
    return response;
  } catch (error) {
    console.error('[API /products] Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('products')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Strict input validation
    if (!body.title || !body.basePrice || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, basePrice, category' },
        { status: 400 }
      );
    }

    let slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existingProduct = await Product.findOne({ slug }).lean();
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    const sanitizedData = {
      title: String(body.title).trim(),
      slug,
      description: String(body.description || body.title || '').trim(),
      basePrice: Number(body.basePrice),
      offerPrice: Number(body.offerPrice || 0),
      costPrice: Number(body.costPrice || 0),
      marketingCost: Number(body.marketingCost || 0),
      deliveryCost: Number(body.deliveryCost || 0),
      lowStockThreshold: Number(body.lowStockThreshold ?? 10),
      category: String(body.category).trim(),
      subCategory: String(body.subCategory || '').trim(),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      images: Array.isArray(body.images) ? body.images : [],
      variants: Array.isArray(body.variants) ? body.variants : [],
      sizeGuide: body.sizeGuide || undefined,
      isTrending: Boolean(body.isTrending),
      isNewArrival: Boolean(body.isNewArrival),
    };

    const product = await Product.create(sanitizedData);

    try {
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/shop');
    } catch (e) {}

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error('[API /products] Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 400 }
    );
  }
}


