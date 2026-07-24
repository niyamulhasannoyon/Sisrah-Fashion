import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { loginLimiter } from '@/lib/rateLimiter';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    // Apply rate limiting: 5 auth attempts per minute
    const limitCheck = loginLimiter.check(req);
    if (limitCheck.blocked) {
      return limitCheck.response!;
    }

    await dbConnect();
    const { credential, accessToken, phone } = await req.json();

    if (!credential && !accessToken) {
      return NextResponse.json({ error: 'Google credential or access token is required' }, { status: 400 });
    }

    let email = '';
    let name = '';
    let picture = '';

    if (accessToken) {
      // Fetch user profile from Google UserInfo API using access_token
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userInfoRes.ok) {
        return NextResponse.json({ error: 'Failed to fetch Google user profile' }, { status: 400 });
      }
      const userInfo = await userInfoRes.json();
      email = userInfo.email;
      name = userInfo.name;
      picture = userInfo.picture;
    } else {
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.error('[Google Auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
        return NextResponse.json({ error: 'Google authentication is not configured' }, { status: 500 });
      }

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      if (!payload) return NextResponse.json({ error: 'Invalid Google token' }, { status: 400 });
      email = payload.email || '';
      name = payload.name || '';
      picture = payload.picture || '';
    }

    let user = await User.findOne({ email });

    if (!user) {
      if (!phone) {
        return NextResponse.json({ requirePhone: true, email, name });
      }
      
      const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
      if (!bdPhoneRegex.test(phone)) {
        return NextResponse.json({ error: 'Invalid Bangladeshi phone number' }, { status: 400 });
      }
      
      user = await User.create({
        name,
        email,
        phone,
        role: 'customer',
        image: picture || ''
      });
    } else if (picture) {
      user.image = picture;
      await user.save();
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
    console.error('Google Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
