import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET all notifications (dynamic check for stock & coupon expiry)
export async function GET(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('dashboard')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();

    // 1. DYNAMIC CHECK: Coupons expiring in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const now = new Date();

    const expiringCoupons = await Coupon.find({
      expiryDate: { $gte: now, $lte: threeDaysFromNow }
    });

    for (const coupon of expiringCoupons) {
      const couponMsg = `Coupon code "${coupon.code}" will expire in less than 3 days on ${new Date(coupon.expiryDate).toLocaleDateString()}.`;
      // Check if alert already exists
      const exists = await Notification.findOne({
        type: 'coupon',
        message: new RegExp(coupon.code)
      });
      if (!exists) {
        await Notification.create({
          title: 'Coupon Expiring Soon',
          message: couponMsg,
          type: 'coupon',
          link: '/coupons',
          isRead: false
        });
      }
    }

    // 2. DYNAMIC CHECK: Low stock threshold check
    const products = await Product.find({});
    for (const product of products) {
      const threshold = product.lowStockThreshold !== undefined ? product.lowStockThreshold : 10;
      if (product.variants && Array.isArray(product.variants)) {
        for (const variant of product.variants) {
          if (variant.stock <= threshold) {
            const variantMsg = `Product "${product.title}" (${variant.size} / ${variant.color}) has low stock: only ${variant.stock} left.`;
            const exists = await Notification.findOne({
              type: 'stock',
              message: variantMsg
            });
            if (!exists) {
              await Notification.create({
                title: 'Low Stock Alert',
                message: variantMsg,
                type: 'stock',
                link: `/products/edit/${product._id}`,
                isRead: false
              });
            }
          }
        }
      }
    }

    // 3. FETCH NOTIFICATIONS
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    return NextResponse.json({ success: true, notifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// PUT to mark as read or delete
export async function PUT(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('dashboard')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();
    const { id, markAllAsRead, deleteId } = body;

    if (markAllAsRead) {
      await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
      return NextResponse.json({ success: true, notification: updated });
    }

    if (deleteId) {
      await Notification.findByIdAndDelete(deleteId);
      return NextResponse.json({ success: true, message: 'Notification deleted' });
    }

    return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
