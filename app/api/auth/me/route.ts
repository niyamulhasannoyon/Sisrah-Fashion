import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get('loomra_token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, error: 'Invalid token payload' }, { status: 401 });
    }

    // Always fetch from database to ensure fresh and accurate data (e.g. up-to-date roles)
    await dbConnect();
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone || '',
        image: user.image || '',
        address: user.address || {}
      } 
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}
