import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get('loomra_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId;

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone, image, address } = body;

    // Validate name and phone
    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 });
    }

    // Update user properties
    user.name = name;
    user.phone = phone;
    if (image !== undefined) {
      user.image = image;
    }
    if (address) {
      user.address = {
        street: address.street || '',
        city: address.city || '',
        division: address.division || '',
      };
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
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
    console.error('Update user profile error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
