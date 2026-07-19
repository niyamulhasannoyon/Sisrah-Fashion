import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { isStaffOrAdmin } from '@/lib/adminAuth';

// GET /api/admin/landing-pages/analytics — Per-campaign analytics for all landing pages
export async function GET(req: Request) {
  if (!(await isStaffOrAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    // Match all analytics events on /lp/* URLs
    const lpMatch = { url: { $regex: '^/lp/' } };

    // Aggregate: group by URL (campaign slug), count views, clicks, and add-to-cart conversions
    const results = await AnalyticsEvent.aggregate([
      { $match: lpMatch },
      {
        $group: {
          _id: '$url',
          views: {
            $sum: { $cond: [{ $eq: ['$eventType', 'pageview'] }, 1, 0] },
          },
          clicks: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$eventType', 'click'] }, { $ne: ['$clickText', 'lp_add_to_cart'] }] },
                1,
                0,
              ],
            },
          },
          conversions: {
            $sum: { $cond: [{ $eq: ['$clickText', 'lp_add_to_cart'] }, 1, 0] },
          },
          uniqueSessions: { $addToSet: '$sessionId' },
          lastActivity: { $max: '$timestamp' },
        },
      },
      {
        $project: {
          slug: { $replaceOne: { input: '$_id', find: '/lp/', replacement: '' } },
          views: 1,
          clicks: 1,
          conversions: 1,
          uniqueSessions: { $size: '$uniqueSessions' },
          lastActivity: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$views', 0] },
              { $round: [{ $multiply: [{ $divide: ['$conversions', '$views'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { views: -1 } },
    ]);

    // Build a map for quick lookup by slug
    const analyticsMap = new Map<string, typeof results[0]>();
    results.forEach((row) => analyticsMap.set(row.slug, row));

    return NextResponse.json({ success: true, analytics: Object.fromEntries(analyticsMap) });
  } catch (error) {
    console.error('[LandingPages Analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
