import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { isAdmin } from '@/lib/adminAuth';
import User from '@/models/User';

export async function GET() {
  try {
    // 1. Verify admin permissions
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // --- A. GENERAL METRICS ---
    // Count distinct sessions
    const sessionIds = await AnalyticsEvent.distinct('sessionId');
    const totalSessions = sessionIds.length;

    // Count pageviews and clicks
    const totalPageviews = await AnalyticsEvent.countDocuments({ eventType: 'pageview' });
    const totalClicks = await AnalyticsEvent.countDocuments({ eventType: 'click' });

    // Calculate bounce rate (sessions with only 1 pageview event and 0 clicks)
    const bouncedCountResults = await AnalyticsEvent.aggregate([
      {
        $group: {
          _id: "$sessionId",
          totalEvents: { $sum: 1 },
          clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } }
        }
      },
      {
        $match: {
          totalEvents: 1,
          clicks: 0
        }
      },
      {
        $count: "bouncedCount"
      }
    ]);
    const bouncedSessions = bouncedCountResults[0]?.bouncedCount || 0;
    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

    // --- B. CHART DATA COMPILATION ---
    // Get daily stats for last 90 days (covers both 30 days daily and 12 weeks weekly)
    const dailyStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          pageviews: { $sum: { $cond: [{ $eq: ["$eventType", "pageview"] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 1. Daily Chart (Last 30 Days)
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const formatted = d.toISOString().split('T')[0];
      last30Days.push(formatted);
    }
    const dailyChart = last30Days.map(dateStr => {
      const stat = dailyStats.find(s => s._id === dateStr);
      return {
        label: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pageviews: stat ? stat.pageviews : 0,
        clicks: stat ? stat.clicks : 0
      };
    });

    // 2. Weekly Chart (Last 12 Weeks)
    const last12Weeks = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const sunday = new Date();
      sunday.setDate(today.getDate() - today.getDay() - i * 7);
      sunday.setHours(0, 0, 0, 0);
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      saturday.setHours(23, 59, 59, 999);
      last12Weeks.push({ sunday, saturday });
    }
    const weeklyChart = last12Weeks.map(week => {
      let pageviews = 0;
      let clicks = 0;
      
      dailyStats.forEach(stat => {
        const statDate = new Date(stat._id);
        if (statDate >= week.sunday && statDate <= week.saturday) {
          pageviews += stat.pageviews;
          clicks += stat.clicks;
        }
      });

      const label = week.sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { label, pageviews, clicks };
    });

    // 3. Yearly Chart (Last 12 Months)
    const monthlyStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$timestamp" } },
          pageviews: { $sum: { $cond: [{ $eq: ["$eventType", "pageview"] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const formatted = d.toISOString().slice(0, 7); // "YYYY-MM"
      last12Months.push(formatted);
    }
    const yearlyChart = last12Months.map(monthStr => {
      const stat = monthlyStats.find(s => s._id === monthStr);
      const dateObj = new Date(monthStr + '-02'); // force day 2 to prevent local timezone shifts
      return {
        label: dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        pageviews: stat ? stat.pageviews : 0,
        clicks: stat ? stat.clicks : 0
      };
    });

    // --- C. DETAILED VISITOR SESSIONS ---
    // Fetch and aggregate recent session profiles (who visited)
    const sessionProfiles = await AnalyticsEvent.aggregate([
      {
        $group: {
          _id: "$sessionId",
          ip: { $first: "$ip" },
          country: { $first: "$country" },
          city: { $first: "$city" },
          browser: { $first: "$browser" },
          os: { $first: "$os" },
          device: { $first: "$device" },
          userId: { $first: "$userId" },
          firstActive: { $min: "$timestamp" },
          lastActive: { $max: "$timestamp" },
          pageviews: { $sum: { $cond: [{ $eq: ["$eventType", "pageview"] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } },
          events: {
            $push: {
              eventType: "$eventType",
              url: "$url",
              clickText: "$clickText",
              clickTarget: "$clickTarget",
              timestamp: "$timestamp"
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { lastActive: -1 } },
      { $limit: 30 }
    ]);

    // Format events chronologically inside each profile
    sessionProfiles.forEach(session => {
      session.events.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions,
        totalPageviews,
        totalClicks,
        bounceRate
      },
      charts: {
        daily: dailyChart,
        weekly: weeklyChart,
        yearly: yearlyChart
      },
      sessions: sessionProfiles
    });
  } catch (error) {
    console.error('Failed to load admin analytics:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
