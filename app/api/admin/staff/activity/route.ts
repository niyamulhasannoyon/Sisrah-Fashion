import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';
import StaffActivityLog from '@/models/StaffActivityLog';

export const dynamic = 'force-dynamic';

// GET — Fetch activity logs (Super Admin only)
// Query params: staffId, targetType, limit (default 100)
export async function GET(req: Request) {
  try {
    if (!await isAdmin() && !await hasAccessTo('staff')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('staffId');
    const targetType = searchParams.get('targetType');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    const filter: Record<string, any> = {};
    if (staffId) filter.staffId = staffId;
    if (targetType) filter.targetType = targetType;

    const logs = await StaffActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('[Staff Activity GET]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
