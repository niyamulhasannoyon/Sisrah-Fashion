import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import Order from '@/models/Order';
import { isAdmin, hasAccessTo } from '@/lib/adminAuth';

// ── GET /api/admin/landing-pages/analytics — Per-campaign aggregate stats ──
// ── GET /api/admin/landing-pages/analytics?slug=... — Detailed per-slug data ──
export async function GET(req: Request) {
  if (!await isAdmin() && !await hasAccessTo('landing-pages')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  try {
    // ── DETAILED PER-SLUG RESPONSE ──
    if (slug) {
      const urlPath = `/lp/${slug}`;
      const match = { url: urlPath };

      // 1) Aggregate summary stats for this slug
      const [summary] = await AnalyticsEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            views: { $sum: { $cond: [{ $eq: ['$eventType', 'pageview'] }, 1, 0] } },
            clicks: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$eventType', 'click'] }, { $ne: ['$clickText', 'lp_add_to_cart'] }] },
                  1,
                  0,
                ],
              },
            },
            conversions: { $sum: { $cond: [{ $eq: ['$clickText', 'lp_add_to_cart'] }, 1, 0] } },
            uniqueSessions: { $addToSet: '$sessionId' },
            firstActivity: { $min: '$timestamp' },
            lastActivity: { $max: '$timestamp' },
          },
        },
        {
          $project: {
            _id: 0,
            views: 1,
            clicks: 1,
            conversions: 1,
            uniqueSessions: { $size: '$uniqueSessions' },
            firstActivity: 1,
            lastActivity: 1,
            conversionRate: {
              $cond: [{ $gt: ['$views', 0] }, { $round: [{ $multiply: [{ $divide: ['$conversions', '$views'] }, 100] }, 1] }, 0],
            },
          },
        },
      ]);

      // 2) Daily timeline: views, clicks, conversions grouped by date
      const timeline = await AnalyticsEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            views: { $sum: { $cond: [{ $eq: ['$eventType', 'pageview'] }, 1, 0] } },
            clicks: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$eventType', 'click'] }, { $ne: ['$clickText', 'lp_add_to_cart'] }] },
                  1,
                  0,
                ],
              },
            },
            conversions: { $sum: { $cond: [{ $eq: ['$clickText', 'lp_add_to_cart'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: '$_id',
            views: 1,
            clicks: 1,
            conversions: 1,
          },
        },
      ]);

      // 3) Device breakdown
      const deviceBreakdown = await AnalyticsEvent.aggregate([
        { $match: { ...match, device: { $exists: true, $ne: '' } } },
        {
          $group: {
            _id: '$device',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            device: { $cond: [{ $eq: ['$_id', null] }, 'unknown', '$_id'] },
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Normalise device names
      const deviceMap: Record<string, string> = {
        mobile: 'Mobile',
        smartphone: 'Mobile',
        tablet: 'Tablet',
        ipad: 'Tablet',
        desktop: 'Desktop',
        pc: 'Desktop',
        mac: 'Desktop',
        laptop: 'Desktop',
      };
      const consolidatedDevices: Record<string, number> = {};
      deviceBreakdown.forEach((d) => {
        const key = deviceMap[d.device.toLowerCase()] || d.device || 'Other';
        consolidatedDevices[key] = (consolidatedDevices[key] || 0) + d.count;
      });
      const deviceData = Object.entries(consolidatedDevices)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      // 4) Browser breakdown
      const browserBreakdown = await AnalyticsEvent.aggregate([
        { $match: { ...match, browser: { $exists: true, $ne: '' } } },
        {
          $group: {
            _id: '$browser',
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, browser: '$_id', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]);

      // 5) Recent events (last 20)
      const recentEvents = await AnalyticsEvent.find(match)
        .sort({ timestamp: -1 })
        .limit(20)
        .select('eventType clickText clickTarget device browser country city timestamp')
        .lean();

      // 6) Order-based conversion data — orders attributed to this campaign
      const orderStats = await Order.aggregate([
        { $match: { campaignSlug: slug } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            totalPaid: { $sum: { $ifNull: ['$paidAmount', 0] } },
            avgOrderValue: { $avg: '$totalAmount' },
          },
        },
        { $project: { _id: 0, totalOrders: 1, totalRevenue: 1, totalPaid: 1, avgOrderValue: { $round: ['$avgOrderValue', 0] } } },
      ]);

      // 7) Order timeline
      const orderTimeline = await Order.aggregate([
        { $match: { campaignSlug: slug } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', orders: 1, revenue: 1 } },
      ]);

      return NextResponse.json({
        success: true,
        slug,
        summary: summary || { views: 0, clicks: 0, conversions: 0, uniqueSessions: 0, conversionRate: 0 },
        timeline,
        deviceBreakdown: deviceData,
        browserBreakdown,
        recentEvents,
        orderStats: orderStats[0] || { totalOrders: 0, totalRevenue: 0, totalPaid: 0, avgOrderValue: 0 },
        orderTimeline,
      });
    }

    // ── OVERVIEW RESPONSE (no slug) — aggregate all LP pages ──
    const lpMatch = { url: { $regex: '^/lp/' } };

    const results = await AnalyticsEvent.aggregate([
      { $match: lpMatch },
      {
        $group: {
          _id: '$url',
          views: { $sum: { $cond: [{ $eq: ['$eventType', 'pageview'] }, 1, 0] } },
          clicks: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$eventType', 'click'] }, { $ne: ['$clickText', 'lp_add_to_cart'] }] },
                1,
                0,
              ],
            },
          },
          conversions: { $sum: { $cond: [{ $eq: ['$clickText', 'lp_add_to_cart'] }, 1, 0] } },
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
            $cond: [{ $gt: ['$views', 0] }, { $round: [{ $multiply: [{ $divide: ['$conversions', '$views'] }, 100] }, 1] }, 0],
          },
        },
      },
      { $sort: { views: -1 } },
    ]);

    const analyticsMap = new Map<string, typeof results[0]>();
    results.forEach((row) => analyticsMap.set(row.slug, row));

    return NextResponse.json({ success: true, analytics: Object.fromEntries(analyticsMap) });
  } catch (error) {
    console.error('[LandingPages Analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
