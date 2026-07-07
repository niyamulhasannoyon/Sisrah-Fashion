import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Staff from '@/models/Staff';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = (await cookies()).get('loomra_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token payload' }, { status: 401 });
    }

    await dbConnect();

    // ── Staff token (carries staffId) ──────────────────────────────────────────
    if (payload.staffId) {
      const staff = await Staff.findById(payload.staffId).select('-password');
      if (!staff || !staff.isActive) {
        return NextResponse.json({ success: false, error: 'Staff account not found or deactivated' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: String(staff._id),
          name: staff.name,
          email: staff.email,
          role: staff.role,
          phone: '',
          image: '',
          address: {},
          isStaff: true,
        },
      });
    }

    // ── Regular user / owner token (carries userId) ────────────────────────────
    if (!payload.userId) {
      return NextResponse.json({ success: false, error: 'Invalid token payload' }, { status: 401 });
    }

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
        address: user.address || {},
        isStaff: false,
      },
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}
