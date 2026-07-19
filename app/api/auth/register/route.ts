import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { registerLimiter } from '@/lib/rateLimiter';

export async function POST(req: Request) {
  try {
    // Apply rate limiting: 3 registration attempts per minute
    const limitCheck = registerLimiter.check(req);
    if (limitCheck.blocked) {
      return limitCheck.response!;
    }

    await dbConnect();
    const { name, email, password, phone } = await req.json();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address format' }, { status: 400 });
    }

    if (!bdPhoneRegex.test(phone)) {
      return NextResponse.json({ success: false, error: 'Invalid Bangladeshi phone number' }, { status: 400 });
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long' }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ success: false, error: 'Password must contain at least one uppercase letter' }, { status: 400 });
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ success: false, error: 'Password must contain at least one lowercase letter' }, { status: 400 });
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ success: false, error: 'Password must contain at least one number' }, { status: 400 });
    }

    // Sanitize name to prevent XSS
    const sanitizedName = name.replace(/<[^>]*>/g, '').trim();
    if (!sanitizedName) {
      return NextResponse.json({ success: false, error: 'Invalid name provided' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: sanitizedName,
      email,
      phone,
      password: hashedPassword,
    });

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
    }, { status: 201 });

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
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}