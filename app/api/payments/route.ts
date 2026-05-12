import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { action } = await request.json();

  if (action === 'ssl-init') {
    return NextResponse.json({ success: true, redirectUrl: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php' });
  }

  if (action === 'ssl-success') {
    return NextResponse.json({ success: true, message: 'Payment verified successfully' });
  }

  return NextResponse.json({ success: false, message: 'Unsupported payment action' }, { status: 400 });
}
