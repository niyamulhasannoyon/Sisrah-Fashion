import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Notification from '@/models/Notification';
import Coupon from '@/models/Coupon';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';
import { generateAndEmailInvoice } from '@/lib/invoice';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/orders/manual
 *
 * Creates a manual order from the admin panel (for phone/social/offline sales).
 * Accepts customer details, items with variants, payment info, and status overrides.
 */
export async function POST(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // ── Validate required fields ──────────────────────────────────────────
    if (!body.customer?.name || !body.customer?.phone || !body.customer?.address || !body.customer?.city) {
      return NextResponse.json({ success: false, error: 'All customer fields are required: name, phone, address, city' }, { status: 400 });
    }
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one order item is required' }, { status: 400 });
    }

    // ── Validate BD phone number ──────────────────────────────────────────
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    const cleanPhone = body.customer.phone.replace(/<[^>]*>/g, '').trim();
    if (!bdPhoneRegex.test(cleanPhone)) {
      return NextResponse.json({ success: false, error: 'Invalid Bangladeshi phone number format' }, { status: 400 });
    }

    // ── Sanitize customer ─────────────────────────────────────────────────
    const sanitizedCustomer = {
      name: body.customer.name.replace(/<[^>]*>/g, '').trim(),
      phone: cleanPhone,
      address: body.customer.address.replace(/<[^>]*>/g, '').trim(),
      city: body.customer.city.replace(/<[^>]*>/g, '').trim(),
    };

    // ── Validate & enrish items with inventory check ──────────────────────
    const sanitizedItems: any[] = [];
    for (const item of body.items) {
      const title = (item.title || '').replace(/<[^>]*>/g, '').trim();
      const qty = typeof item.quantity === 'number' ? Math.max(1, Math.floor(item.quantity)) : 1;
      const price = typeof item.price === 'number' ? Math.max(0, item.price) : 0;
      const image = (item.image || '').replace(/<[^>]*>/g, '').trim();
      const selectedSize = (item.selectedSize || '').replace(/<[^>]*>/g, '').trim();
      const selectedColor = (item.selectedColor || '').replace(/<[^>]*>/g, '').trim();

      if (!title || price <= 0) continue;

      // If a productId is provided, verify stock exists
      if (item.productId) {
        const product = await Product.findById(item.productId).lean() as any;
        if (product && product.variants?.length > 0) {
          const variant = product.variants.find(
            (v: any) => v.size === selectedSize && v.color === selectedColor
          );
          if (variant && typeof variant.stock === 'number' && variant.stock < qty) {
            return NextResponse.json({
              success: false,
              error: `Insufficient stock for "${title}" (${selectedSize}/${selectedColor}). Available: ${variant.stock}, requested: ${qty}`,
            }, { status: 400 });
          }
        }
      }

      sanitizedItems.push({ title, price, image, selectedSize, selectedColor, quantity: qty });
    }

    if (sanitizedItems.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid items to order' }, { status: 400 });
    }

    // ── Financials ────────────────────────────────────────────────────────
    const subtotal = sanitizedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = typeof body.discount === 'number' ? Math.max(0, Math.min(body.discount, subtotal)) : 0;
    const shippingFee = typeof body.shippingFee === 'number' ? Math.max(0, body.shippingFee) : 0;
    const totalAmount = subtotal - discount + shippingFee;

    // ── Generate order ID ─────────────────────────────────────────────────
    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const nextOrderId = lastOrder && lastOrder.orderId ? lastOrder.orderId + 1 : 100001;

    // ── Payment status from override ──────────────────────────────────────
    const validPaymentStatuses = ['Pending', 'Paid', 'Partially Paid'];
    const paymentStatus = validPaymentStatuses.includes(body.paymentStatus) ? body.paymentStatus : 'Pending';

    const validOrderStatuses = ['Pending', 'Confirmed', 'Processing'];
    const orderStatus = validOrderStatuses.includes(body.orderStatus) ? body.orderStatus : 'Pending';

    // ── Create order ──────────────────────────────────────────────────────
    const order = await Order.create({
      shippingInfo: sanitizedCustomer,
      orderItems: sanitizedItems,
      totalAmount,
      paymentMethod: body.paymentMethod || 'Cash on Delivery',
      paymentStatus,
      orderStatus,
      transactionId: body.transactionId?.replace(/<[^>]*>/g, '').trim() || undefined,
      paidAmount: typeof body.paidAmount === 'number' ? Math.max(0, body.paidAmount) : undefined,
      couponCode: body.couponCode?.toString().toUpperCase().trim(),
      couponDiscount: discount > 0 ? discount : undefined,
      internalNotes: body.internalNotes?.replace(/<[^>]*>/g, '').trim() || '',
      orderId: nextOrderId,
    });

    // ── Update coupon usage ────────────────────────────────────────────────
    if (body.couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: body.couponCode.toString().toUpperCase().trim() },
          { $inc: { usedCount: 1 } }
        );
      } catch { /* non-blocking */ }
    }

    // ── Decrement inventory ────────────────────────────────────────────────
    for (const item of body.items) {
      if (item.productId) {
        try {
          await Product.updateOne(
            { _id: item.productId, 'variants.size': item.selectedSize, 'variants.color': item.selectedColor },
            { $inc: { 'variants.$.stock': -Math.max(1, Math.floor(item.quantity || 1)) } }
          );
        } catch { /* non-blocking */ }
      }
    }

    // ── Create notification ────────────────────────────────────────────────
    try {
      await Notification.create({
        title: 'Manual Order Created',
        message: `Order #${nextOrderId} of ৳${totalAmount.toLocaleString()} created by admin for ${sanitizedCustomer.name}.`,
        type: 'order',
        link: `/orders/${order._id}`,
        isRead: false,
      });
    } catch { /* non-blocking */ }

    // Auto-generate invoice (non-blocking)
    generateAndEmailInvoice(order.toObject(), body.customer?.email);

    return NextResponse.json({
      success: true,
      orderId: nextOrderId,
      _id: order._id,
      totalAmount,
      phone: sanitizedCustomer.phone,
    }, { status: 201 });

  } catch (error: any) {
    console.error('[Manual Order] Failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to create manual order' }, { status: 500 });
  }
}
