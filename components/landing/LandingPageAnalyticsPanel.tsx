'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Eye, MousePointerClick, Users, Percent, Loader2, Smartphone, Monitor, Tablet, Globe, Clock, TrendingUp, ShoppingCart, ChevronRight, Calendar, BarChart3, PieChart as PieIcon, Activity, DollarSign, ShoppingBag } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ── Types ──
interface SummaryData {
  views: number;
  clicks: number;
  conversions: number;
  uniqueSessions: number;
  conversionRate: number;
  firstActivity?: string;
  lastActivity?: string;
}

interface TimelinePoint {
  date: string;
  views: number;
  clicks: number;
  conversions: number;
}

interface DeviceCount {
  device: string;
  count: number;
}

interface BrowserCount {
  browser: string;
  count: number;
}

interface RecentEvent {
  _id: string;
  eventType: string;
  clickText?: string;
  clickTarget?: string;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  timestamp: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  avgOrderValue: number;
}

interface OrderTimelinePoint {
  date: string;
  orders: number;
  revenue: number;
}

interface DetailData {
  slug: string;
  summary: SummaryData;
  timeline: TimelinePoint[];
  deviceBreakdown: DeviceCount[];
  browserBreakdown: BrowserCount[];
  recentEvents: RecentEvent[];
  orderStats?: OrderStats;
  orderTimeline?: OrderTimelinePoint[];
}

// ── Colors ──
const PIE_COLORS = ['#A31F24', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'];
const CHART_PRIMARY = '#A31F24';
const CHART_SECONDARY = '#3B82F6';
const CHART_TERTIARY = '#10B981';
const CHART_RATE = '#8B5CF6';

type Tab = 'timeline' | 'devices' | 'orders' | 'activity';

// ── Custom Tooltip ──
const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-white/10 text-white rounded-xl p-3.5 shadow-xl backdrop-blur-md min-w-[140px]">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color ?? item.stroke }} />
                <span className="text-[11px] text-gray-300 font-medium">{item.name}</span>
              </div>
              <span className="text-[11px] font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface LandingPageAnalyticsPanelProps {
  slug: string;
  pageTitle: string;
  onClose: () => void;
}

export default function LandingPageAnalyticsPanel({ slug, pageTitle, onClose }: LandingPageAnalyticsPanelProps) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/landing-pages/analytics?slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Network error loading analytics');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="fixed inset-0 z-[300] flex justify-end animate-in slide-in-from-right">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[#A31F24]" size={32} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div className="fixed inset-0 z-[300] flex justify-end animate-in slide-in-from-right">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Percent size={28} className="text-red-400" />
          </div>
          <p className="text-sm font-bold text-slate-900">{error || 'No analytics data available'}</p>
          <p className="text-xs text-slate-500">No events have been tracked for this campaign yet.</p>
          <button onClick={onClose} className="mt-2 px-5 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 active:scale-[0.97] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
            Close
          </button>
        </div>
      </div>
    );
  }

  const { summary, timeline, deviceBreakdown, browserBreakdown, recentEvents, orderStats, orderTimeline } = data;
  const totalEvents = summary.views + summary.clicks + summary.conversions;
  const daysActive = summary.firstActivity
    ? Math.max(1, Math.round((Date.now() - new Date(summary.firstActivity).getTime()) / 86400000))
    : 1;

  // Fill gaps in timeline with zeroes for consistent charting
  const filledTimeline = () => {
    if (timeline.length === 0) return [];
    const sorted = [...timeline].sort((a, b) => a.date.localeCompare(b.date));
    const start = new Date(sorted[0].date);
    const end = new Date(sorted[sorted.length - 1].date);
    const result: TimelinePoint[] = [];
    const map = new Map(sorted.map((d) => [d.date, d]));
    const current = new Date(start);
    while (current <= end) {
      const key = current.toISOString().split('T')[0];
      result.push(map.get(key) || { date: key, views: 0, clicks: 0, conversions: 0 });
      current.setDate(current.getDate() + 1);
    }
    return result;
  };

  const chartTimeline = filledTimeline();

  // Compute daily conversion rate from timeline data (conversions / views * 100)
  const conversionRateTimeline = chartTimeline.map((d) => ({
    ...d,
    conversionRate: d.views > 0 ? Number(((d.conversions / d.views) * 100).toFixed(1)) : 0,
  }));

  const deviceTotal = deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
  const browserTotal = browserBreakdown.reduce((sum, d) => sum + d.count, 0);

  // Revenue KPIs (from order attribution)
  const revStats = orderStats || { totalOrders: 0, totalRevenue: 0, totalPaid: 0, avgOrderValue: 0 };

  // ── KPIs ──
  const kpis = [
    { label: 'Page Views', value: summary.views.toLocaleString(), icon: Eye, color: 'bg-rose-50 text-[#A31F24] border-rose-100' },
    { label: 'Clicks', value: summary.clicks.toLocaleString(), icon: MousePointerClick, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Add to Cart', value: summary.conversions.toLocaleString(), icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Orders Placed', value: revStats.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Revenue', value: `৳${revStats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  ];

  // Extra revenue KPIs in a second row
  const revenueKpis = [
    { label: 'Avg Order Value', value: `৳${revStats.avgOrderValue.toLocaleString()}`, icon: TrendingUp, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    { label: 'Total Paid', value: `৳${revStats.totalPaid.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Cart→Order Rate', value: summary.conversions > 0 ? `${((revStats.totalOrders / summary.conversions) * 100).toFixed(1)}%` : '0%', icon: Percent, color: 'bg-rose-50 text-[#A31F24] border-rose-100' },
  ];

  // Device icons
  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d === 'mobile') return Smartphone;
    if (d === 'tablet') return Tablet;
    return Monitor;
  };

  return (
    <div className="fixed inset-0 z-[300] flex justify-end animate-in slide-in-from-right duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 truncate">{pageTitle}</h2>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                /lp/{slug}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
              <Calendar size={11} />
              <span>{daysActive} day{daysActive !== 1 ? 's' : ''} of data</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{totalEvents.toLocaleString()} total events</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-all shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 space-y-3">
          <div className="grid grid-cols-5 gap-3">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
                <div className={`w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center border ${kpi.color}`}>
                  <kpi.icon size={14} />
                </div>
                <p className="text-sm font-black text-slate-900">{kpi.value}</p>
                <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mt-0.5">{kpi.label}</p>
              </div>
            ))}
          </div>
          {/* Revenue KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {revenueKpis.map((kpi) => (
              <div key={kpi.label} className="bg-slate-50/60 rounded-xl border border-slate-100 p-2.5 text-center">
                <div className={`w-6 h-6 rounded-lg mx-auto mb-1 flex items-center justify-center border ${kpi.color}`}>
                  <kpi.icon size={12} />
                </div>
                <p className="text-xs font-black text-slate-900">{kpi.value}</p>
                <p className="text-[7px] font-bold uppercase text-slate-400 tracking-wider mt-0.5">{kpi.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="shrink-0 px-6 border-b border-slate-200">
          <div className="flex gap-0">
            {([
              { key: 'timeline' as Tab, label: 'Timeline', icon: BarChart3 },
              { key: 'devices' as Tab, label: 'Devices', icon: PieIcon },
              { key: 'orders' as Tab, label: 'Orders', icon: ShoppingBag },
              { key: 'activity' as Tab, label: 'Activity', icon: Activity },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600 active:text-slate-800'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Content Area ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 pb-[max(5rem,env(safe-area-inset-bottom))]">

          {/* ═══ TIMELINE TAB ═══ */}
          {activeTab === 'timeline' && (
            <React.Fragment>
              {/* Click-through Chart */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Click-Through Overview</h3>
                <p className="text-[10px] text-slate-400 mb-4">Daily page views vs. click interactions.</p>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartTimeline.length > 0 ? chartTimeline : [{ date: 'No data', views: 0, clicks: 0, conversions: 0 }]}>
                        <defs>
                          <linearGradient id="lpViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="lpClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_SECONDARY} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={CHART_SECONDARY} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" name="Views" dataKey="views" stroke={CHART_PRIMARY} strokeWidth={2.5} fillOpacity={1} fill="url(#lpViews)" />
                        <Area type="monotone" name="Clicks" dataKey="clicks" stroke={CHART_SECONDARY} strokeWidth={2.5} fillOpacity={1} fill="url(#lpClicks)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_PRIMARY }} />
                      <span className="text-[10px] font-bold text-slate-600">Views ({summary.views})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_SECONDARY }} />
                      <span className="text-[10px] font-bold text-slate-600">Clicks ({summary.clicks})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Timeline */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Conversion Timeline</h3>
                <p className="text-[10px] text-slate-400 mb-4">Add-to-cart conversions per day.</p>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartTimeline.length > 0 ? chartTimeline : [{ date: 'No data', views: 0, clicks: 0, conversions: 0 }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="conversions" name="Add to Cart" radius={[4, 4, 0, 0]} fill={CHART_TERTIARY} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_TERTIARY }} />
                      <span className="text-[10px] font-bold text-slate-600">Conversions ({summary.conversions})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#A31F24' }} />
                      <span className="text-[10px] font-bold text-slate-600">Rate ({summary.conversionRate}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Rate Over Time */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Conversion Rate Over Time</h3>
                <p className="text-[10px] text-slate-400 mb-4">Daily add-to-cart conversion rate (conversions ÷ page views).</p>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={conversionRateTimeline.length > 0 ? conversionRateTimeline : [{ date: 'No data', views: 0, clicks: 0, conversions: 0, conversionRate: 0 }]}>
                        <defs>
                          <linearGradient id="lpConversionRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_RATE} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={CHART_RATE} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 'auto']} tickFormatter={(v: number) => `${v}%`} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" name="Conv. Rate" dataKey="conversionRate" stroke={CHART_RATE} strokeWidth={2.5} fillOpacity={1} fill="url(#lpConversionRate)" dot={{ r: 3, fill: CHART_RATE }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_RATE }} />
                      <span className="text-[10px] font-bold text-slate-600">Conversion Rate ({summary.conversionRate}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Percent size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{summary.conversions} conversions / {summary.views} views</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTR summary */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#A31F24]/10 flex items-center justify-center shrink-0">
                  <Percent size={18} className="text-[#A31F24]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Click-Through Rate: {summary.views > 0 ? ((summary.clicks / summary.views) * 100).toFixed(1) : '0'}%
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {summary.clicks} clicks from {summary.views} page views
                    {summary.conversions > 0 && ` • ${summary.conversions} add-to-cart actions`}
                  </p>
                </div>
              </div>
            </React.Fragment>
          )}

          {/* ═══ DEVICES TAB ═══ */}
          {activeTab === 'devices' && (
            <React.Fragment>
              {/* Device Breakdown Pie */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Device Breakdown</h3>
                <p className="text-[10px] text-slate-400 mb-4">Visitor device distribution across all events.</p>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  {deviceBreakdown.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-8">No device data available.</p>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="h-[180px] w-[180px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={deviceBreakdown.map((d) => ({ name: d.device, value: d.count }))}
                              cx="50%" cy="50%"
                              innerRadius={45} outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {deviceBreakdown.map((_, idx) => (
                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-2.5">
                        {deviceBreakdown.map((d, idx) => {
                          const DeviceIcon = getDeviceIcon(d.device);
                          const pct = deviceTotal > 0 ? ((d.count / deviceTotal) * 100).toFixed(1) : 0;
                          return (
                            <div key={d.device} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                  <DeviceIcon size={13} className="text-slate-400" />
                                  {d.device}
                                </div>
                                <span className="font-bold text-slate-900">{pct}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Browser Breakdown */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Browser Breakdown</h3>
                <p className="text-[10px] text-slate-400 mb-4">Top browsers used by visitors.</p>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  {browserBreakdown.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-8">No browser data available.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {browserBreakdown.map((b, idx) => {
                        const pct = browserTotal > 0 ? ((b.count / browserTotal) * 100).toFixed(1) : 0;
                        return (
                          <div key={b.browser} className="flex items-center gap-3 py-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-800">{b.browser || 'Unknown'}</span>
                                <span className="text-[11px] font-bold text-slate-500">{b.count}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          )}

          {/* ═══ ORDERS TAB ═══ */}
          {activeTab === 'orders' && (
            <React.Fragment>
              {/* Order Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Orders</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{revStats.totalOrders.toLocaleString()}</p>
                  {summary.conversions > 0 && (
                    <p className="text-[9px] text-slate-500 mt-1">
                      {((revStats.totalOrders / summary.conversions) * 100).toFixed(1)}% of add-to-carts
                    </p>
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Revenue</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">৳{revStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Avg. Order Value</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">৳{revStats.avgOrderValue.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Paid</p>
                  <p className="text-2xl font-black text-indigo-700 mt-1">৳{revStats.totalPaid.toLocaleString()}</p>
                </div>
              </div>

              {/* Revenue Timeline Chart */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Revenue Timeline</h3>
                <p className="text-[10px] text-slate-400 mb-4">Daily order revenue from this campaign.</p>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(orderTimeline || []).length > 0 ? orderTimeline : [{ date: 'No data', orders: 0, revenue: 0 }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" name="Revenue (৳)" radius={[4, 4, 0, 0]} fill={CHART_PRIMARY} maxBarSize={32} />
                        <Bar dataKey="orders" name="Orders" radius={[4, 4, 0, 0]} fill={CHART_SECONDARY} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_PRIMARY }} />
                      <span className="text-[10px] font-bold text-slate-600">Revenue (৳{revStats.totalRevenue.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_SECONDARY }} />
                      <span className="text-[10px] font-bold text-slate-600">Orders ({revStats.totalOrders})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROAS Summary */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <DollarSign size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Revenue per Add-to-Cart: {summary.conversions > 0 ? `৳${Math.round(revStats.totalRevenue / summary.conversions).toLocaleString()}` : 'N/A'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {revStats.totalOrders} orders from {summary.conversions} add-to-cart actions
                    {revStats.totalOrders > 0 && ` • ৳${revStats.totalRevenue.toLocaleString()} total revenue`}
                  </p>
                </div>
              </div>
            </React.Fragment>
          )}

          {/* ═══ ACTIVITY TAB ═══ */}
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Recent Activity</h3>
              <p className="text-[10px] text-slate-400 mb-4">Last {recentEvents.length} events on this landing page.</p>

              {recentEvents.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                  <Activity size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400 italic">No recent events recorded.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {recentEvents.map((event) => {
                    const isExpanded = expandedEventId === event._id;
                    const isClick = event.eventType === 'click';
                    const isConversion = event.clickText === 'lp_add_to_cart';
                    const date = new Date(event.timestamp);
                    const DeviceIcon = event.device?.toLowerCase() === 'mobile' ? Smartphone
                      : event.device?.toLowerCase() === 'tablet' ? Tablet : Monitor;

                    return (
                      <div key={event._id} className="transition-colors hover:bg-slate-50/40">
                        <div
                          onClick={() => setExpandedEventId(isExpanded ? null : event._id)}
                          className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Badge */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isConversion
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : isClick
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-rose-50 text-[#A31F24] border-rose-100'
                            }`}>
                              {isConversion ? <ShoppingCart size={14} /> : isClick ? <MousePointerClick size={14} /> : <Eye size={14} />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[11px] font-bold ${
                                  isConversion ? 'text-emerald-700' : isClick ? 'text-blue-700' : 'text-slate-800'
                                }`}>
                                  {isConversion ? 'Add to Cart' : isClick ? 'Click' : 'Page View'}
                                </span>
                                {isConversion && (
                                  <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-1 py-0.5 rounded border border-emerald-100">
                                    Conversion
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                {isClick ? (
                                  <React.Fragment>Clicked: <span className="font-medium text-slate-700">{event.clickText || event.clickTarget || 'Unknown'}</span></React.Fragment>
                                ) : (
                                  <span className="text-slate-400">Page loaded</span>
                                )}
                              </p>
                              <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock size={9} />
                                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {event.country && (
                                  <React.Fragment>
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                    <span className="flex items-center gap-1">
                                      <Globe size={9} />
                                      {event.city || event.country}
                                    </span>
                                  </React.Fragment>
                                )}
                                {event.device && (
                                  <React.Fragment>
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                    <span className="flex items-center gap-1">
                                      <DeviceIcon size={9} />
                                      {event.device}
                                    </span>
                                  </React.Fragment>
                                )}
                              </div>
                            </div>
                          </div>

                          <ChevronRight
                            size={14}
                            className={`text-slate-300 mt-2 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 bg-slate-50/50 border-t border-slate-100">
                            <div className="ml-11 space-y-1 text-[10px] text-slate-600">
                              <div className="flex gap-2">
                                <span className="font-bold text-slate-400 w-20 shrink-0">Event Type:</span>
                                <span>{event.eventType}</span>
                              </div>
                              {event.clickText && (
                                <div className="flex gap-2">
                                  <span className="font-bold text-slate-400 w-20 shrink-0">Click Text:</span>
                                  <span className="font-mono text-emerald-700">{event.clickText}</span>
                                </div>
                              )}
                              {event.browser && (
                                <div className="flex gap-2">
                                  <span className="font-bold text-slate-400 w-20 shrink-0">Browser:</span>
                                  <span>{event.browser}</span>
                                </div>
                              )}
                              {event.device && (
                                <div className="flex gap-2">
                                  <span className="font-bold text-slate-400 w-20 shrink-0">Device:</span>
                                  <span className="capitalize">{event.device}</span>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <span className="font-bold text-slate-400 w-20 shrink-0">Timestamp:</span>
                                <span>{date.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
