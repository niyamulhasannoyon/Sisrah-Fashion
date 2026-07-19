import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Staff from '@/models/Staff';
import { staffLoginLimiter } from '@/lib/rateLimiter';

// Staff login — called from the same /login page; detected by `staffLogin: true` flag
export async function POST(req: Request) {
  try {
    // Apply rate limiting: 5 staff login attempts per minute
    const limitCheck = staffLoginLimiter.check(req);
    if (limitCheck.blocked) {
      return limitCheck.response!;
    }

    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const staff = await Staff.findOne({ email: email.toLowerCase().trim() });

    if (!staff) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (!staff.isActive) {
      return NextResponse.json({ success: false, error: 'Your account has been deactivated. Contact the administrator.' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    staff.lastLogin = new Date();
    await staff.save();

    // JWT carries staffId (not userId) so getStaffSession() can identify it
    const token = jwt.sign(
      {
        staffId: String(staff._id),
        name: staff.name,
        email: staff.email,
        staffRole: staff.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    const response = NextResponse.json({
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

    response.cookies.set({
      name: 'loomra_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[Staff Login]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
