/**
 * Invoice generation utility — non-blocking helper to auto-generate
 * and email invoices & full order details to customers on order placement.
 *
 * Uses CUSTOMER_RESEND_API_KEY (or RESEND_API_KEY fallback).
 */

export interface InvoiceResult {
  success: boolean;
  reason?: 'NO_EMAIL' | 'SEND_FAILED' | 'GENERATION_FAILED';
  messageId?: string;
  orderNumber?: string;
}

export async function generateAndEmailInvoice(
  order: any,
  manualEmail?: string
): Promise<InvoiceResult> {
  try {
    const { buildInvoiceData, InvoiceDocument } = await import('@/components/invoice/InvoicePDF');
    const React = await import('react');
    const { pdf } = await import('@react-pdf/renderer');

    const { default: dbConnect } = await import('@/lib/dbConnect');
    const { default: Settings } = await import('@/models/Settings');

    await dbConnect();
    const settings = (await Settings.findOne().lean()) as any;

    const invoiceData = buildInvoiceData(order, {
      logoUrl: settings?.logo || undefined,
      brandAddress: settings?.contactAddress || undefined,
      brandPhone: settings?.whatsappNumber || undefined,
      brandEmail: settings?.contactEmail || undefined,
    });
    const doc = React.createElement(InvoiceDocument as React.ComponentType<any>, { data: invoiceData });
    const blob = await pdf(doc).toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Guard clause: check if we have a customer email target
    const email = manualEmail || (order.shippingInfo as any)?.email;
    if (!email) {
      console.log(`[Invoice Skip] Order ${invoiceData.orderNumber}: No customer email available. PDF saved for admin download.`);
      return { success: false, reason: 'NO_EMAIL', orderNumber: invoiceData.orderNumber };
    }

    // Determine API Key and Sender
    const apiKey = process.env.CUSTOMER_RESEND_API_KEY || process.env.RESEND_API_KEY;
    const fromEmail = process.env.CUSTOMER_RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (!apiKey) {
      console.error('[Invoice Error] No Resend API key configured for customer emails.');
      return { success: false, reason: 'SEND_FAILED' };
    }

    // Build items HTML for email body
    const items = order.orderItems || [];
    const itemsHtml = items.map((item: any) => {
      const variantInfo = [item.selectedSize ? `Size: ${item.selectedSize}` : '', item.selectedColor ? `Color: ${item.selectedColor}` : '']
        .filter(Boolean)
        .join(' | ');

      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 12px; font-size: 13px; color: #333;">
            <div style="font-weight: 600;">${item.title || 'Product'}</div>
            ${variantInfo ? `<div style="font-size: 11px; color: #777; margin-top: 2px;">${variantInfo}</div>` : ''}
          </td>
          <td style="padding: 10px 12px; font-size: 13px; color: #555; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #555; text-align: right;">৳${(item.price || 0).toLocaleString('en-BD')}</td>
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #111; text-align: right;">৳${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-BD')}</td>
        </tr>
      `;
    }).join('');

    const shipping = order.shippingInfo || {};

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);

      const data = await resend.emails.send({
        from: `AS SIDRAT <${fromEmail}>`,
        to: email,
        subject: `Order Confirmation & Invoice #${invoiceData.orderNumber} — AS SIDRAT`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); }
              .header { background: #0f172a; padding: 28px 24px; text-align: center; color: #ffffff; }
              .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
              .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
              .content { padding: 24px; }
              .greeting { font-size: 15px; margin-bottom: 20px; line-height: 1.6; color: #334155; }
              .order-summary-box { background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
              .section-title { font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
              th { background: #f8fafc; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; text-align: left; }
              .summary-table { width: 100%; max-width: 260px; margin-left: auto; border: none; }
              .summary-table td { padding: 6px 12px; font-size: 13px; color: #475569; }
              .summary-table tr.total td { font-size: 16px; font-weight: 700; color: #0f172a; border-top: 2px solid #cbd5e1; padding-top: 8px; }
              .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>AS SIDRAT</h1>
                <p>Order Confirmation & Invoice</p>
              </div>

              <div class="content">
                <div class="greeting">
                  Dear <strong>${invoiceData.customerName}</strong>,<br/>
                  Thank you for shopping with <strong>AS SIDRAT</strong>! Your order <strong>#${invoiceData.orderNumber}</strong> has been received and is being processed. Your official PDF invoice is attached to this email.
                </div>

                <!-- Delivery Details -->
                <div class="section-title">Delivery Address</div>
                <div class="order-summary-box" style="font-size: 13px; line-height: 1.6;">
                  <strong>Address:</strong> ${shipping.address || 'N/A'}, ${shipping.city || ''}<br/>
                  <strong>Phone:</strong> ${shipping.phone || 'N/A'}<br/>
                  <strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}
                </div>

                <!-- Order Items -->
                <div class="section-title">Order Items</div>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <!-- Summary -->
                <table class="summary-table">
                  <tr class="total">
                    <td>Total Amount:</td>
                    <td style="text-align: right;">৳ ${invoiceData.totalAmount.toLocaleString('en-BD')}</td>
                  </tr>
                </table>
              </div>

              <div class="footer">
                Thank you for choosing AS SIDRAT. If you have any questions, feel free to reply to this email.
              </div>
            </div>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: `Invoice-${invoiceData.orderNumber.replace('#', '')}.pdf`,
            content: base64,
          },
        ],
      });

      console.log(`[Customer Email Sent] Successfully sent invoice & order details for order ${invoiceData.orderNumber} to ${email}. Message ID: ${data.data?.id}`);
      return { success: true, messageId: data.data?.id, orderNumber: invoiceData.orderNumber };
    } catch (sendErr: any) {
      console.error(`[Customer Email Error] Failed to send email for order ${invoiceData.orderNumber}:`, sendErr);
      return { success: false, reason: 'SEND_FAILED', orderNumber: invoiceData.orderNumber };
    }
  } catch (err) {
    console.error('[Invoice] Generation failed:', err);
    return { success: false, reason: 'GENERATION_FAILED' };
  }
}
