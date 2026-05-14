import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const ALLOWED_EMAILS = ['niyamulhasanbd@gmail.com', 'niyamulhasan1089@gmail.com'];

export async function isAdmin() {
  const token = cookies().get('loomra_token')?.value;

  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (payload && payload.email && typeof payload.email === 'string') {
      return ALLOWED_EMAILS.includes(payload.email);
    }
    
    return false;
  } catch (error) {
    return false;
  }
}
