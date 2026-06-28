import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from './dbConnect';
import User from '@/models/User';

const ALLOWED_EMAILS = ['niyamulhasanbd@gmail.com', 'niyamulhasan1089@gmail.com'];

export async function isAdmin() {
  const token = (await cookies()).get('loomra_token')?.value;

  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (payload) {
      let email = payload.email;
      
      if (!email && payload.userId) {
        await dbConnect();
        const user = await User.findById(payload.userId);
        if (user) {
          email = user.email;
        }
      }
      
      if (email && typeof email === 'string') {
        return ALLOWED_EMAILS.includes(email);
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}
