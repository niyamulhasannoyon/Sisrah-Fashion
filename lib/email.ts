import { Resend } from 'resend';

export async function sendAdminOrderNotification(order: any) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'niyamulhasanbd@gmail.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey) {
    console.error('[Email] Skipping admin notification: RESEND_API_KEY is not set');
    return { success: false, reason: 'NO_API_KEY' };
  }

  try {
    const resend = new Resend(apiKey);

    const orderId = order.orderId ? `#${order.orderId}` : `#${order._id}`;
    const shipping = order.shippingInfo || {};
    const items = order.orderItems || [];
    const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount : 0;
    const paymentMethod = order.paymentMethod || 'Cash on Delivery';
    const paymentStatus = order.paymentStatus || 'Pending';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://assidrat.com';

    // Calculate subtotal
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const discount = order.couponDiscount || 0;

    const itemsHtml = items.map((item: any) => {
      const variantInfo = [item.selectedSize ? `Size: ${item.selectedSize}` : '', item.selectedColor ? `Color: ${item.selectedColor}` : '']
        .filter(Boolean)
        .join(' | ');

      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; font-size: 14px; color: #333;">
            <div style="font-weight: 600;">${item.title || 'Product'}</div>
            ${variantInfo ? `<div style="font-size: 12px; color: #777; margin-top: 2px;">${variantInfo}</div>` : ''}
          </td>
          <td style="padding: 12px; font-size: 14px; color: #555; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px; font-size: 14px; color: #555; text-align: right;">৳${(item.price || 0).toLocaleString('en-BD')}</td>
          <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #111; text-align: right;">৳${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-BD')}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
          .badge { display: inline-block; background: #22c55e; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
          .content { padding: 24px; }
          .section-title { font-size: 16px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-grid { display: table; width: 100%; margin-bottom: 24px; }
          .info-col { display: table-cell; width: 50%; vertical-align: top; padding-right: 12px; }
          .info-box { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 14px; font-size: 13px; line-height: 1.6; }
          .info-box strong { color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f3f4f6; padding: 10px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #4b5563; text-align: left; }
          .summary-table { width: 100%; max-width: 280px; margin-left: auto; border: none; }
          .summary-table td { padding: 6px 12px; font-size: 13px; color: #4b5563; }
          .summary-table tr.total td { font-size: 16px; font-weight: 700; color: #dc2626; border-top: 2px solid #e5e7eb; padding-top: 10px; }
          .btn-container { text-align: center; margin: 30px 0 10px; }
          .btn { background-color: #111827; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; }
          .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AS SIDRAT</h1>
            <p>New Order Received</p>
            <div class="badge">Order ${orderId}</div>
          </div>
          
          <div class="content">
            <!-- Customer & Delivery Info -->
            <div class="section-title">Customer & Delivery Details</div>
            <div class="info-grid">
              <div class="info-col">
                <div class="info-box">
                  <strong>Name:</strong> ${shipping.name || 'N/A'}<br/>
                  <strong>Phone:</strong> <a href="tel:${shipping.phone}" style="color: #2563eb; text-decoration: none;">${shipping.phone || 'N/A'}</a><br/>
                  ${shipping.email ? `<strong>Email:</strong> ${shipping.email}<br/>` : ''}
                </div>
              </div>
              <div class="info-col">
                <div class="info-box">
                  <strong>Address:</strong> ${shipping.address || 'N/A'}<br/>
                  <strong>City:</strong> ${shipping.city || 'N/A'}<br/>
                  <strong>Payment Method:</strong> ${paymentMethod}<br/>
                  <strong>Payment Status:</strong> ${paymentStatus}
                </div>
              </div>
            </div>

            <!-- Ordered Items -->
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Order Financial Summary -->
            <table class="summary-table">
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">৳${subtotal.toLocaleString('en-BD')}</td>
              </tr>
              ${discount > 0 ? `
              <tr>
                <td>Discount (${order.couponCode || 'Coupon'}):</td>
                <td style="text-align: right; color: #16a34a;">-৳${discount.toLocaleString('en-BD')}</td>
              </tr>
              ` : ''}
              <tr class="total">
                <td>Grand Total:</td>
                <td style="text-align: right;">৳${totalAmount.toLocaleString('en-BD')}</td>
              </tr>
            </table>

            <!-- Action Button -->
            <div class="btn-container">
              <a href="${baseUrl}/orders/${order._id}" class="btn">View Order in Admin Panel</a>
            </div>
          </div>

          <div class="footer">
            Automated notification sent via Resend from AS SIDRAT store.
          </div>
        </div>
      </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: `AS SIDRAT <${fromEmail}>`,
      to: adminEmail,
      subject: `🛒 New Order ${orderId} - ৳${totalAmount.toLocaleString('en-BD')} (${shipping.name || 'Customer'})`,
      html: htmlContent,
    });

    console.log(`[Email] Admin notification sent for order ${orderId} to ${adminEmail}. Message ID: ${data.data?.id}`);
    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error(`[Email Error] Failed to send admin notification for order:`, err);
    return { success: false, error: err?.message || 'Failed to send email' };
  }
}
