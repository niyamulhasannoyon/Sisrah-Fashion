import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';
import Staff from '@/models/Staff';
import { isValidResource } from '@/lib/staffPermissions';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// GET — List all staff (Super Admin only)
export async function GET() {
  try {
    if (!await isAdmin() && !await hasAccessTo('staff')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const staffList = await Staff.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, staff: staffList });
  } catch (error) {
    console.error('[Staff GET]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST — Create new staff member (Super Admin only)
export async function POST(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('staff')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, role, permissions } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const validRoles = ['super_admin', 'manager', 'support'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    await dbConnect();

    // Check if email already taken (staff or user)
    const existing = await Staff.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 });
    }

    // Get creator email from JWT
    const token = (await cookies()).get('loomra_token')?.value || '';
    let createdBy = 'super_admin';
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      createdBy = (payload.email as string) || createdBy;
    } catch { /* ignore */ }

    const hashedPassword = await bcrypt.hash(password, 12);

    const createData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isActive: true,
      createdBy,
    };

    // Optional explicit permissions array — validate keys
    if (permissions && Array.isArray(permissions)) {
      const invalid = permissions.find((p: string) => !isValidResource(p));
      if (invalid) {
        return NextResponse.json({ success: false, error: `Invalid permission: ${invalid}` }, { status: 400 });
      }
      createData.permissions = permissions;
    }

    const staff = await Staff.create(createData);

    const { password: _pw, ...staffData } = staff.toObject();

    return NextResponse.json({ success: true, staff: staffData }, { status: 201 });
  } catch (error) {
    console.error('[Staff POST]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
