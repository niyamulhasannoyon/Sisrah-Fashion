import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { loginLimiter } from '@/lib/rateLimiter';

export async function POST(req: Request) {
  try {
    // Apply rate limiting: 5 attempts per minute
    const limitCheck = loginLimiter.check(req);
    if (limitCheck.blocked) {
      return limitCheck.response!;
    }

    await dbConnect();
    const body = await req.json();
    const identifier = (body.email || body.identifier || body.phone || '').trim();
    const password = body.password;

    // Validate input
    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Email/Phone and password are required' }, { status: 400 });
    }

    const cleanIdentifier = identifier.toLowerCase();
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    const isPhone = bdPhoneRegex.test(cleanIdentifier);
    
    // Normalize phone number if phone format (e.g. 017XXXXXXXX)
    let phoneMatch = cleanIdentifier;
    if (isPhone) {
      const match = cleanIdentifier.match(/(01[3-9]\d{8})$/);
      if (match) phoneMatch = match[1];
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { phone: cleanIdentifier },
        { phone: phoneMatch },
        { phone: `+88${phoneMatch}` },
        { phone: `88${phoneMatch}` },
      ],
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email/phone or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '90d' }
    );

    const response = NextResponse.json({ 
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

    response.cookies.set({
      name: 'loomra_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 90 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}