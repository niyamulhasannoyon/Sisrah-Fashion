import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AnalyticsEvent from '@/models/AnalyticsEvent';

// Simple user-agent parser to avoid extra dependency overhead
function parseUA(ua: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (!ua) return { browser, os, device };

  // Browser detection
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Trident') || ua.includes('MSIE')) browser = 'Internet Explorer';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';

  // OS detection
  if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) {
    os = 'Android';
    device = 'Mobile';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    device = ua.includes('iPad') ? 'Tablet' : 'Mobile';
  } else if (ua.includes('Linux')) os = 'Linux';

  // Device type detection (fallback)
  if (device !== 'Mobile' && device !== 'Tablet') {
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|PlayBook|Opera M(obi|ini)/.test(ua)) {
      device = 'Mobile';
    }
  }

  return { browser, os, device };
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      eventType,
      url,
      sessionId,
      referrer,
      ip: clientIp,
      country,
      city,
      clickTarget,
      clickText,
      userId
    } = body;

    if (!eventType || !url || !sessionId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    // Determine IP address (fallback to server headers if client didn't supply one)
    const serverIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     '';
    const finalIp = clientIp || serverIp || '127.0.0.1';

    // Parse browser, OS, and device from User-Agent
    const userAgent = req.headers.get('user-agent') || '';
    const parsedUA = parseUA(userAgent);

    // Save analytics event
    const event = await AnalyticsEvent.create({
      eventType,
      url,
      referrer,
      ip: finalIp,
      country: country || 'Local / Dev',
      city: city || 'Local / Dev',
      browser: parsedUA.browser,
      os: parsedUA.os,
      device: parsedUA.device,
      clickTarget,
      clickText,
      userId: userId || null,
      sessionId
    });

    return NextResponse.json({ success: true, eventId: event._id });
  } catch (error) {
    console.error('Analytics capture failed:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
