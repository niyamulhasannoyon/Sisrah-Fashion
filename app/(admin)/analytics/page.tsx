'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, 
  MousePointerClick, 
  Users, 
  Percent, 
  Loader2, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  User as UserIcon,
  Compass,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartRange, setChartRange] = useState<'daily' | 'weekly' | 'yearly'>('daily');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const toggleExpandSession = (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(sessionId);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-[#A31F24]" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading Traffic Analytics...</p>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Sessions', 
      value: data?.stats?.totalSessions || 0, 
      description: 'Unique visitors', 
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    { 
      title: 'Page Views', 
      value: data?.stats?.totalPageviews || 0, 
      description: 'Total screen loads', 
      icon: Eye,
      color: 'bg-rose-50 text-[#A31F24] border-rose-100'
    },
    { 
      title: 'Total Clicks', 
      value: data?.stats?.totalClicks || 0, 
      description: 'Button & link interaction', 
      icon: MousePointerClick,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    { 
      title: 'Bounce Rate', 
      value: `${data?.stats?.bounceRate || 0}%`, 
      description: 'Left after 1 view', 
      icon: Percent,
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
  ];

  // Pick chart data source based on selection
  const chartData = data?.charts?.[chartRange] || [];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Traffic & Interaction Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor pageviews, clicks, and follow actual visitor paths in real-time.</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Traffic KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Traffic Performance Trend</h3>
            <p className="text-xs text-slate-400">Comparing page views and link/button clicks.</p>
          </div>
          
          {/* Chart Period Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600">
            {(['daily', 'weekly', 'yearly'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setChartRange(range)}
                className={`px-4 py-2 rounded-md transition-all ${
                  chartRange === range 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A31F24" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#A31F24" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F172A" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
              <ChartTooltip 
                contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                labelStyle={{fontWeight: 'bold', color: '#64748b', fontSize: '11px'}}
                itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
              />
              <Area type="monotone" name="Page Views" dataKey="pageviews" stroke="#A31F24" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" name="Clicks" dataKey="clicks" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visitor Session Streams ("Who Visited") */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h3 className="text-lg font-bold text-slate-900">Live Visitor Sessions</h3>
          <p className="text-xs text-slate-500 mt-1">Real-time click streams and path analysis of the last 30 active users.</p>
        </div>

        <div className="divide-y divide-slate-100">
          {(!data?.sessions || data.sessions.length === 0) ? (
            <div className="p-12 text-center text-slate-400 text-sm italic">
              No traffic recorded yet. Visits will show up here.
            </div>
          ) : (
            data.sessions.map((session: any) => {
              const durationMs = new Date(session.lastActive).getTime() - new Date(session.firstActive).getTime();
              const durationSec = Math.round(durationMs / 1000);
              const isExpanded = expandedSessionId === session._id;
              
              // Device Icon Selector
              let DeviceIcon = Monitor;
              if (session.device?.toLowerCase() === 'mobile') DeviceIcon = Smartphone;
              if (session.device?.toLowerCase() === 'tablet') DeviceIcon = Tablet;

              return (
                <div key={session._id} className="transition-all hover:bg-slate-50/40">
                  {/* Session Summary Row */}
                  <div 
                    onClick={() => toggleExpandSession(session._id)}
                    className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                        session.userDetails 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-bold' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {session.userDetails ? (
                          session.userDetails.name.charAt(0).toUpperCase()
                        ) : (
                          <UserIcon size={18} />
                        )}
                      </div>

                      {/* Visitor details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {session.userDetails ? session.userDetails.name : `Guest ${session._id.slice(-6).toUpperCase()}`}
                          </span>
                          
                          {session.userDetails && (
                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-100">
                              Registered User
                            </span>
                          )}
                          
                          <span className="text-xs text-slate-400 font-mono">
                            {session.ip}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Globe size={13} className="text-slate-400" />
                            {session.city || 'Unknown'}, {session.country || 'Unknown'}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span className="flex items-center gap-1">
                            <DeviceIcon size={13} className="text-slate-400" />
                            {session.browser} ({session.os})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline summary values */}
                    <div className="flex items-center gap-6 justify-between lg:justify-end">
                      <div className="text-right">
                        <div className="flex gap-3 text-xs font-semibold text-slate-700">
                          <span className="flex items-center gap-1">
                            <Eye size={13} className="text-slate-400" /> {session.pageviews} views
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointerClick size={13} className="text-slate-400" /> {session.clicks} clicks
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1 font-medium">
                          <Clock size={11} /> 
                          Active {durationSec < 60 ? `${durationSec}s` : `${Math.round(durationSec / 60)}m`} ago
                        </p>
                      </div>
                      
                      <button className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-lg transition-colors">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Timeline Journey */}
                  {isExpanded && (
                    <div className="px-6 pb-6 bg-slate-50/50 border-t border-slate-100/70 p-4">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-4 px-4">Visitor Journey Timeline</p>
                      
                      <div className="relative pl-6 border-l-2 border-slate-200 ml-4 space-y-4 py-2">
                        {session.events.map((event: any, evIdx: number) => {
                          const date = new Date(event.timestamp);
                          const isClick = event.eventType === 'click';

                          return (
                            <div key={evIdx} className="relative">
                              {/* Timeline indicator node */}
                              <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 ${
                                isClick 
                                  ? 'bg-emerald-500 border-white ring-2 ring-emerald-100' 
                                  : 'bg-[#A31F24] border-white ring-2 ring-rose-100'
                              }`} />

                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-700">
                                      {isClick ? 'Click Event' : 'Page View'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {date.toLocaleTimeString()}
                                    </span>
                                  </div>

                                  {isClick ? (
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-slate-800">
                                        Clicked <span className="text-emerald-700 underline font-black">{event.clickText}</span> on {event.url}
                                      </p>
                                      <code className="block bg-slate-100 text-[10px] text-slate-500 font-mono p-1 rounded overflow-x-auto max-w-full">
                                        {event.clickTarget}
                                      </code>
                                    </div>
                                  ) : (
                                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                      Loaded page <span className="text-[#A31F24] font-bold">{event.url}</span>
                                      <ArrowUpRight size={13} className="text-slate-400" />
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
