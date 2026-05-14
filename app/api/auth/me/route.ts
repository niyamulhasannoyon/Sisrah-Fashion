import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('loomra_token=')[1]?.split(';')[0];
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Return data directly from JWT payload to avoid unnecessary DB hit
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: payload.userId, 
        name: payload.name, 
        email: payload.email, 
        role: payload.role 
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}
