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
    
    let name = payload.name;
    let email = payload.email;
    let role = payload.role;

    if (!email || !name || !role) {
      await dbConnect();
      const user = await User.findById(payload.userId);
      if (user) {
        name = user.name;
        email = user.email;
        role = user.role;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: payload.userId, 
        name, 
        email, 
        role 
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}
