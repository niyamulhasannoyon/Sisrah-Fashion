import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { isAdmin } from '@/lib/adminAuth';

export async function GET(req: Request) {
  try {
    // 1. Verify admin permissions
    if (!await isAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Parse date filters
    const { searchParams } = new URL(req.url);
    const rangePreset = searchParams.get('rangePreset') || 'This Month'; // Today, This Week, This Month, Custom
    let startDate: Date;
    let endDate = new Date();

    const now = new Date();
    if (rangePreset === 'Today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (rangePreset === 'This Week') {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      startDate.setHours(0,0,0,0);
    } else if (rangePreset === 'This Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (rangePreset === 'Custom') {
      const startStr = searchParams.get('startDate');
      const endStr = searchParams.get('endDate');
      startDate = startStr ? new Date(startStr) : new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = endStr ? new Date(endStr) : new Date();
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // --- A. TRAFFIC METRICS (within selected range) ---
    const trafficMatch = { timestamp: { $gte: startDate, $lte: endDate } };
    
    // Count distinct sessions
    const sessionIds = await AnalyticsEvent.distinct('sessionId', trafficMatch);
    const totalSessions = sessionIds.length;

    // Count pageviews and clicks
    const totalPageviews = await AnalyticsEvent.countDocuments({ ...trafficMatch, eventType: 'pageview' });
    const totalClicks = await AnalyticsEvent.countDocuments({ ...trafficMatch, eventType: 'click' });

    // Calculate bounce rate in range
    const bouncedCountResults = await AnalyticsEvent.aggregate([
      { $match: trafficMatch },
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

    // --- B. SALES METRICS (within selected range, excluding cancelled) ---
    const orderMatch = {
      createdAt: { $gte: startDate, $lte: endDate },
      orderStatus: { $ne: 'Cancelled' }
    };

    const ordersInRange = await Order.find(orderMatch);
    const totalRevenue = ordersInRange.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalOrders = ordersInRange.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    const totalQuantitySold = ordersInRange.reduce((acc, o) => {
      const q = o.orderItems?.reduce((subAcc: number, item: any) => subAcc + (item.quantity || 0), 0) || 0;
      return acc + q;
    }, 0);

    // --- C. TOP SELLING PRODUCTS ---
    // Top products by quantity
    const topProductsByQuantity = await Order.aggregate([
      { $match: orderMatch },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.title",
          image: { $first: "$orderItems.image" },
          quantity: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 }
    ]);

    // Top products by revenue
    const topProductsByRevenue = await Order.aggregate([
      { $match: orderMatch },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.title",
          image: { $first: "$orderItems.image" },
          quantity: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // --- D. CATEGORY-WISE SALES BREAKDOWN ---
    const products = await Product.find({}, 'title category');
    const titleToCategoryMap = new Map(products.map(p => [p.title.toLowerCase().trim(), p.category]));

    const aggregatedItems = await Order.aggregate([
      { $match: orderMatch },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.title",
          quantity: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
        }
      }
    ]);

    const categoryStatsMap: Record<string, { category: string; quantity: number; revenue: number }> = {};
    aggregatedItems.forEach(item => {
      const category = titleToCategoryMap.get(item._id.toLowerCase().trim()) || 'Other';
      if (!categoryStatsMap[category]) {
        categoryStatsMap[category] = { category, quantity: 0, revenue: 0 };
      }
      categoryStatsMap[category].quantity += item.quantity;
      categoryStatsMap[category].revenue += item.revenue;
    });
    const categorySales = Object.values(categoryStatsMap).sort((a, b) => b.revenue - a.revenue);

    // --- E. CUSTOMER SEGMENTS: New vs Returning ---
    const uniquePhones = [...new Set(ordersInRange.map(o => o.shippingInfo.phone))];
    const firstOrders = await Order.aggregate([
      { $match: { 'shippingInfo.phone': { $in: uniquePhones } } },
      {
        $group: {
          _id: "$shippingInfo.phone",
          firstOrderDate: { $min: "$createdAt" }
        }
      }
    ]);
    const firstOrderMap = new Map(firstOrders.map(f => [f._id, f.firstOrderDate]));

    let newCustomersCount = 0;
    let returningCustomersCount = 0;
    let newCustomersRevenue = 0;
    let returningCustomersRevenue = 0;

    ordersInRange.forEach(order => {
      const firstDate = firstOrderMap.get(order.shippingInfo.phone);
      if (firstDate && new Date(firstDate) >= startDate) {
        newCustomersCount++;
        newCustomersRevenue += order.totalAmount;
      } else {
        returningCustomersCount++;
        returningCustomersRevenue += order.totalAmount;
      }
    });

    // --- F. DAILY TREND LINE DATA ---
    const dailyEventStats = await AnalyticsEvent.aggregate([
      { $match: trafficMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          pageviews: { $sum: { $cond: [{ $eq: ["$eventType", "pageview"] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyOrderStats = await Order.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build day-by-day unified list
    const trendData = [];
    const tempDate = new Date(startDate);
    
    // Safety break in case of infinite loop
    let loops = 0;
    while (tempDate <= endDate && loops < 1000) {
      loops++;
      const dateStr = tempDate.toISOString().split('T')[0];
      const eventStat = dailyEventStats.find(s => s._id === dateStr);
      const orderStat = dailyOrderStats.find(s => s._id === dateStr);
      
      trendData.push({
        date: dateStr,
        label: tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pageviews: eventStat ? eventStat.pageviews : 0,
        clicks: eventStat ? eventStat.clicks : 0,
        revenue: orderStat ? orderStat.revenue : 0,
        orders: orderStat ? orderStat.orders : 0
      });
      
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // --- G. RECENT VISITOR SESSIONS (last 30) ---
    const sessionProfiles = await AnalyticsEvent.aggregate([
      { $sort: { timestamp: -1 } },
      { $limit: 1000 },
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

    sessionProfiles.forEach(session => {
      session.events.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    // --- PROFIT ANALYTICS REPORT ---
    // Fetch all products with costs to map details
    const allProducts = await Product.find({}, 'title costPrice marketingCost deliveryCost images');
    const productMap = new Map(allProducts.map(p => [
      p.title.toLowerCase().trim(), 
      {
        costPrice: p.costPrice || 0,
        marketingCost: p.marketingCost || 0,
        deliveryCost: p.deliveryCost || 0,
        image: p.images?.[0]?.url || ''
      }
    ]));

    let totalProfitRevenue = 0;
    let totalProfitCost = 0;

    const productBreakdown: Record<string, { 
      title: string; 
      image: string; 
      quantity: number; 
      revenue: number; 
      cost: number; 
      profit: number; 
      margin: number; 
    }> = {};

    ordersInRange.forEach(order => {
      order.orderItems.forEach((item: any) => {
        const pInfo = productMap.get(item.title.toLowerCase().trim()) || { costPrice: 0, marketingCost: 0, deliveryCost: 0, image: item.image || '' };
        const qty = item.quantity || 0;
        const itemRevenue = (item.price || 0) * qty;
        
        const itemCost = ((pInfo.costPrice || 0) + (pInfo.marketingCost || 0) + (pInfo.deliveryCost || 0)) * qty;
        const itemProfit = itemRevenue - itemCost;

        totalProfitRevenue += itemRevenue;
        totalProfitCost += itemCost;

        const prodTitle = item.title;
        if (!productBreakdown[prodTitle]) {
          productBreakdown[prodTitle] = {
            title: prodTitle,
            image: pInfo.image || item.image || '',
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
            margin: 0
          };
        }
        productBreakdown[prodTitle].quantity += qty;
        productBreakdown[prodTitle].revenue += itemRevenue;
        productBreakdown[prodTitle].cost += itemCost;
        productBreakdown[prodTitle].profit += itemProfit;
      });
    });

    Object.keys(productBreakdown).forEach(key => {
      const pb = productBreakdown[key];
      pb.margin = pb.revenue > 0 ? Math.round((pb.profit / pb.revenue) * 100) : 0;
    });

    const profitStats = {
      totalRevenue: totalProfitRevenue,
      totalCost: totalProfitCost,
      netProfit: totalProfitRevenue - totalProfitCost,
      productBreakdown: Object.values(productBreakdown).sort((a, b) => b.profit - a.profit)
    };

    // Landing Page traffic match (URLs starting with /lp/)
    const lpTrafficMatch = { ...trafficMatch, url: { $regex: /^\/lp\// } };
    const mainTrafficMatch = { ...trafficMatch, url: { $not: /^\/lp\// } };

    // Unique session counts (reach)
    const lpSessions = await AnalyticsEvent.distinct('sessionId', lpTrafficMatch);
    const mainSessions = await AnalyticsEvent.distinct('sessionId', mainTrafficMatch);

    // Pageview counts
    const lpPageviews = await AnalyticsEvent.countDocuments({ ...lpTrafficMatch, eventType: 'pageview' });
    const mainPageviews = await AnalyticsEvent.countDocuments({ ...mainTrafficMatch, eventType: 'pageview' });

    // Landing Page orders vs Main Website orders
    let lpOrdersCount = 0;
    let mainOrdersCount = 0;
    let lpRevenue = 0;
    let mainRevenue = 0;

    ordersInRange.forEach(order => {
      if (order.campaignSlug) {
        lpOrdersCount++;
        lpRevenue += order.totalAmount;
      } else {
        mainOrdersCount++;
        mainRevenue += order.totalAmount;
      }
    });

    const sourceComparison = {
      traffic: {
        landingPage: {
          sessions: lpSessions.length,
          pageviews: lpPageviews,
        },
        mainWebsite: {
          sessions: mainSessions.length,
          pageviews: mainPageviews,
        }
      },
      orders: {
        landingPage: {
          count: lpOrdersCount,
          revenue: lpRevenue,
        },
        mainWebsite: {
          count: mainOrdersCount,
          revenue: mainRevenue,
        }
      }
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions,
        totalPageviews,
        totalClicks,
        bounceRate,
        
        // Sales statistics
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalQuantitySold
      },
      sourceComparison,
      profitStats,
      topProducts: {
        byQuantity: topProductsByQuantity,
        byRevenue: topProductsByRevenue
      },
      categorySales,
      customerSegment: {
        newCustomersCount,
        returningCustomersCount,
        newCustomersRevenue,
        returningCustomersRevenue
      },
      trend: trendData,
      sessions: sessionProfiles
    });

  } catch (error) {
    console.error('Failed to load admin analytics:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
