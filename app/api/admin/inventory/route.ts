import { NextResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!await isAdmin() && !await hasAccessTo('products')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const products = await Product.find({}).sort({ updatedAt: -1 }).lean();

    let outOfStockCount = 0;
    let lowStockCount = 0;
    let healthyStockCount = 0;
    let totalInventoryValue = 0;
    let totalInventoryCost = 0;
    let totalItemsInStock = 0;

    const inventoryList = products.map((p: any) => {
      const variants = p.variants || [];
      const totalStock = variants.length > 0 
        ? variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0)
        : (p.stock || 0);

      totalItemsInStock += totalStock;
      totalInventoryValue += (p.offerPrice && p.offerPrice > 0 ? p.offerPrice : p.basePrice) * totalStock;
      totalInventoryCost += (p.costPrice || 0) * totalStock;

      let status = 'healthy';
      if (totalStock === 0) {
        status = 'out_of_stock';
        outOfStockCount++;
      } else if (totalStock <= 10) {
        status = 'low_stock';
        lowStockCount++;
      } else {
        healthyStockCount++;
      }

      return {
        _id: p._id.toString(),
        title: p.title,
        category: p.category || 'General',
        image: p.images?.[0]?.url || '',
        basePrice: p.basePrice,
        offerPrice: p.offerPrice,
        costPrice: p.costPrice || 0,
        totalStock,
        variants: variants.map((v: any) => ({
          size: v.size,
          color: v.color || '',
          stock: v.stock || 0
        })),
        status,
        isActive: p.isActive,
        updatedAt: p.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalItemsInStock,
        outOfStockCount,
        lowStockCount,
        healthyStockCount,
        totalInventoryValue,
        totalInventoryCost,
        potentialProfitMargin: totalInventoryValue > 0 ? Math.round(((totalInventoryValue - totalInventoryCost) / totalInventoryValue) * 100) : 0
      },
      inventory: inventoryList
    });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('products')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { productId, variants, stock } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const updateFields: any = {};
    if (variants && Array.isArray(variants)) {
      updateFields.variants = variants;
    }
    if (typeof stock === 'number') {
      updateFields.stock = stock;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Failed to update inventory:', error);
    return NextResponse.json({ success: false, error: 'Failed to update stock' }, { status: 500 });
  }
}
