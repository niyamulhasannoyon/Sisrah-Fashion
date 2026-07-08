import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { isAdmin } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: 'No items provided for import' }, { status: 400 });
    }

    const operations = items.map((item: any) => {
      const filter: any = {};
      if (item.productId) filter._id = item.productId;
      if (item.slug) filter.slug = item.slug;
      if (!filter._id && !filter.slug) return null;

      const update: any = {};
      if (typeof item.category === 'string' && item.category.trim() !== '') {
        update.category = item.category.trim();
      }
      if (typeof item.lowStockThreshold === 'number') {
        update.lowStockThreshold = item.lowStockThreshold;
      }

      if (Object.keys(update).length === 0) return null;

      return {
        updateOne: {
          filter,
          update: { $set: update },
        },
      };
    }).filter(Boolean);

    if (operations.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid updates found in CSV data' }, { status: 400 });
    }

    await Product.bulkWrite(operations as any[]);

    return NextResponse.json({ success: true, message: 'Imported inventory updates successfully', processed: operations.length }, { status: 200 });
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
}
