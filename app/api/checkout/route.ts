import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
const SSLCommerzPayment = require('sslcommerz-lts');

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { items, formData, paymentMethod, total, shippingFee, discount } = body;

    // 1. Create the Order in MongoDB (Status: Pending)
    const newOrder = await Order.create({
      items: items.map((item: any) => ({
        product: item._id,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        price: item.price
      })),
      shippingInfo: formData,
      shippingFee,
      totalAmount: total,
      paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      // user: userId // (If using authentication, attach user ID here)
    });

    const tran_id = newOrder._id.toString();

    // 2. Handle Cash on Delivery (COD)
    if (paymentMethod === 'COD') {
      return NextResponse.json({ success: true, orderId: tran_id });
    }

    // 3. Handle SSLCommerz Gateway Initialization
    if (paymentMethod === 'SSLCOMMERZ') {
      const store_id = process.env.SSLCOMMERZ_STORE_ID;
      const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
      const is_live = false; // Set to true for production

      const data = {
        total_amount: total,
        currency: 'BDT',
        tran_id: tran_id, // Use Order ID as transaction ID
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/ssl-success?tran_id=${tran_id}`,
        fail_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/ssl-fail`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/ssl-cancel`,
        shipping_method: 'Courier',
        product_name: 'Loomra Apparel',
        product_category: 'Clothing',
        product_profile: 'general',
        cus_name: formData.name,
        cus_email: 'customer@example.com', // Get from form/auth
        cus_add1: formData.address,
        cus_city: formData.city,
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: formData.phone,
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

      const apiResponse = await sslcz.init(data);
      // Redirect the user to the gateway URL provided by SSLCommerz
      if (apiResponse?.GatewayPageURL) {
        return NextResponse.json({ gatewayUrl: apiResponse.GatewayPageURL });
      } else {
        return NextResponse.json({ error: 'Gateway URL generation failed' }, { status: 400 });
      }
    }

  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}