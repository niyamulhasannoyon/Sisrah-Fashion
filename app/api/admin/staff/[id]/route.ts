import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import { isAdmin } from '@/lib/adminAuth';
import Staff from '@/models/Staff';
import StaffActivityLog from '@/models/StaffActivityLog';
import { isValidResource } from '@/lib/staffPermissions';

// PATCH — Update role / active status / password reset (Super Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const allowedFields: Record<string, true> = { role: true, isActive: true, password: true, permissions: true };
    const updateData: Record<string, any> = {};

    for (const key of Object.keys(body)) {
      if (allowedFields[key]) {
        if (key === 'password') {
          if (!body.password || body.password.length < 6) {
            return NextResponse.json(
              { success: false, error: 'Password must be at least 6 characters' },
              { status: 400 }
            );
          }
          updateData.password = await bcrypt.hash(body.password, 12);
        } else if (key === 'permissions') {
          const perms = body.permissions;
          if (!Array.isArray(perms)) {
            return NextResponse.json({ success: false, error: 'Permissions must be an array' }, { status: 400 });
          }
          const invalid = perms.find((p: string) => !isValidResource(p));
          if (invalid) {
            return NextResponse.json({ success: false, error: `Invalid permission: ${invalid}` }, { status: 400 });
          }
          updateData.permissions = perms;
        } else {
          updateData[key] = body[key];
        }
      }
    }

    const staff = await Staff.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!staff) {
      return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('[Staff PATCH]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE — Remove staff member + their activity logs (Super Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const staff = await Staff.findByIdAndDelete(id);
    if (!staff) {
      return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 });
    }

    // Clean up their activity logs
    await StaffActivityLog.deleteMany({ staffId: id });

    return NextResponse.json({ success: true, message: 'Staff member deleted' });
  } catch (error) {
    console.error('[Staff DELETE]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
