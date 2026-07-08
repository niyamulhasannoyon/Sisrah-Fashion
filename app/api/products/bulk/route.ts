import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { isAdmin } from '@/lib/adminAuth';

export async function PUT(request: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No products selected' }, { status: 400 });
    }

    const update: any = {};
    if (typeof body.category === 'string' && body.category.trim() !== '') {
      update.category = body.category.trim();
    }

    if (typeof body.lowStockThreshold === 'number') {
      update.lowStockThreshold = body.lowStockThreshold;
    }

    const variantStockUpdates: any = {};
    if (body.setOutOfStock) {
      variantStockUpdates['variants.$[].stock'] = 0;
    } else if (typeof body.restockStock === 'number') {
      variantStockUpdates['variants.$[].stock'] = Math.max(0, body.restockStock);
    }

    if (Object.keys(update).length === 0 && Object.keys(variantStockUpdates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid bulk update payload provided' }, { status: 400 });
    }

    const updateQuery: any = {};
    if (Object.keys(update).length > 0) {
      updateQuery.$set = update;
    }
    if (Object.keys(variantStockUpdates).length > 0) {
      updateQuery.$set = { ...(updateQuery.$set || {}), ...variantStockUpdates };
    }

    await Product.updateMany({ _id: { $in: ids } }, updateQuery, { runValidators: true });

    return NextResponse.json({ success: true, message: 'Bulk update completed' }, { status: 200 });
  } catch (error) {
    console.error('Bulk update failed:', error);
    return NextResponse.json({ success: false, error: 'Bulk update failed' }, { status: 500 });
  }
}
