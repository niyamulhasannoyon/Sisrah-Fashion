/**
 * Invoice generation utility — non-blocking helper to auto-generate
 * and optionally email invoices on order placement.
 *
 * Returns a result object so callers (e.g. admin send-invoice endpoint)
 * can know the outcome.
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

    const invoiceData = buildInvoiceData(order);
    const doc = React.createElement(InvoiceDocument as React.ComponentType<any>, { data: invoiceData });
    const blob = await pdf(doc).toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Guard clause: check if we have an email target
    const email = manualEmail || (order.shippingInfo as any)?.email;
    if (!email) {
      console.log(`[Invoice Skip] Order ${invoiceData.orderNumber}: No customer email available. Saved for admin download only.`);
      return { success: false, reason: 'NO_EMAIL', orderNumber: invoiceData.orderNumber };
    }

    // Send via Resend
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const data = await resend.emails.send({
        from: `AS SIDRAT <${process.env.RESEND_FROM_EMAIL || 'orders@assidrat.com'}>`,
        to: email,
        subject: `Invoice for Order #${invoiceData.orderNumber} — AS SIDRAT`,
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
              If you have any questions, reply to this email or visit our website.
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

      console.log(`[Invoice Sent] Successfully sent invoice for order ${invoiceData.orderNumber} to ${email}`);
      return { success: true, messageId: data.data?.id, orderNumber: invoiceData.orderNumber };
    } catch (sendErr) {
      console.error(`[Invoice Error] Failed to send email for order ${invoiceData.orderNumber}:`, sendErr);
      return { success: false, reason: 'SEND_FAILED', orderNumber: invoiceData.orderNumber };
    }
  } catch (err) {
    // PDF generation failed
    console.error('[Invoice] Generation failed:', err);
    return { success: false, reason: 'GENERATION_FAILED' };
  }
}
