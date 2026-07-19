import React from 'react';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/invoice/generate?orderId=xxx&download=true
 *
 * Generates a PDF invoice for an order.
 * - orderId: MongoDB _id or orderId number
 * - download=true: returns PDF as download
 * - email=email@example.com: sends PDF via Resend email
 *
 * POST /api/invoice/generate (custom invoice)
 * Body: { customer, items, totals, ... }
 * Generates a PDF from manual input (no DB needed).
 */
export async function GET(req: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const download = searchParams.get('download') === 'true';
    const email = searchParams.get('email');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    // Find order by _id or orderId
    let order = await Order.findById(orderId).lean();
    if (!order) {
      order = await Order.findOne({ orderId: parseInt(orderId) }).lean();
    }
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Build invoice data
    const { buildInvoiceData, InvoiceDocument } = await import('@/components/invoice/InvoicePDF');

    const invoiceData = buildInvoiceData(order);

    // Generate PDF
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(React.createElement(InvoiceDocument as React.ComponentType<any>, { data: invoiceData })).toBlob();

    // Send email if requested
    if (email) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        await resend.emails.send({
          from: `AS SIDRAT <${process.env.RESEND_FROM_EMAIL || 'orders@assidrat.com'}>`,
          to: email,
          subject: `Invoice for Order #${(order as any).orderId || String((order as any)._id).slice(-6).toUpperCase()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="font-size: 24px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px;">
                AS SIDRAT <span style="color: #A31F24;">.</span>
              </h1>
              <p style="color: #666; margin-bottom: 30px; font-size: 14px; line-height: 1.6;">
                Dear <strong>${invoiceData.customerName}</strong>,<br/>
                Thank you for your order! Please find your invoice attached.
              </p>
              <div style="background: #F8F8F8; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                  Order #${invoiceData.orderNumber}
                </p>
                <p style="margin: 0; font-size: 18px; font-weight: bold;">
                  ৳ ${invoiceData.totalAmount.toLocaleString('en-BD')}
                </p>
              </div>
              <p style="color: #999; font-size: 12px;">
                If you have any questions, reply to this email or contact us at +880 1733 919 156
              </p>
            </div>
          `,
          attachments: [
            {
              filename: `Invoice-${invoiceData.orderNumber.replace('#', '')}.pdf`,
              content: base64,
            },
          ],
        });
      } catch (emailErr) {
        console.error('[Invoice] Failed to send email:', emailErr);
        // Don't fail the request — still return the PDF
      }
    }

    if (download) {
      const bytes = await blob.bytes();
      return new NextResponse(bytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Invoice-${invoiceData.orderNumber.replace('#', '')}.pdf"`,
        },
      });
    }

    // Return as base64 for preview / client handling
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      pdf: `data:application/pdf;base64,${base64}`,
      orderNumber: invoiceData.orderNumber,
      invoiceData,
    });

  } catch (error: any) {
    console.error('[Invoice] Generation failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate invoice: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}

/**
 * POST /api/invoice/generate
 * Custom invoice generator — no DB order needed.
 */
export async function POST(req: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate
    if (!body.customerName || !body.items?.length) {
      return NextResponse.json({ success: false, error: 'customerName and items are required' }, { status: 400 });
    }

    const { InvoiceDocument } = await import('@/components/invoice/InvoicePDF');

    const invoiceData = {
      orderId: body.orderId || `CUSTOM-${Date.now().toString().slice(-6)}`,
      orderNumber: body.orderNumber || `#CUSTOM-${Date.now().toString().slice(-6)}`,
      createdAt: body.createdAt || new Date().toISOString(),
      customerName: body.customerName,
      customerPhone: body.customerPhone || '',
      customerAddress: body.customerAddress || '',
      customerCity: body.customerCity || '',
      customerEmail: body.customerEmail || '',
      items: body.items.map((item: any) => ({
        title: item.title || 'Item',
        price: item.price || 0,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      })),
      subtotal: body.subtotal || body.items.reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 1), 0),
      discount: body.discount || 0,
      shippingFee: body.shippingFee || 0,
      totalAmount: body.totalAmount || 0,
      paymentMethod: body.paymentMethod || 'N/A',
      paymentStatus: body.paymentStatus || 'N/A',
      orderStatus: body.orderStatus || 'N/A',
      transactionId: body.transactionId,
      paidAmount: body.paidAmount,
      couponCode: body.couponCode,
      notes: body.notes,
      brandName: body.brandName,
      brandAddress: body.brandAddress,
      brandPhone: body.brandPhone,
      brandEmail: body.brandEmail,
    };

    // Calculate total if not provided
    if (!body.totalAmount) {
      invoiceData.totalAmount = invoiceData.subtotal - invoiceData.discount + invoiceData.shippingFee;
    }

    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(React.createElement(InvoiceDocument as React.ComponentType<any>, { data: invoiceData })).toBlob();

    const bytes = await blob.bytes();
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoiceData.orderNumber.replace('#', '')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('[Invoice Custom] Failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate custom invoice' }, { status: 500 });
  }
}
