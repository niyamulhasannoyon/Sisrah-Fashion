import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';

export async function GET() {
  await dbConnect();
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const updatedSettings = await Settings.findOneAndUpdate({}, body, { new: true, upsert: true });
    
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
