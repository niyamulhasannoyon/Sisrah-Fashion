'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  Download,
  PieChart as PieIcon,
  Tag,
  FileText,
  MapPin,
  Mail,
  Search,
  Cpu,
  Activity,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-white/10 text-white rounded-xl p-4 shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color ?? item.stroke }} 
                />
                <span className="text-xs text-gray-300 font-medium">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-white">
                {item.name.includes('Revenue') || item.name.includes('৳') ? `৳${item.value.toLocaleString()}` : item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#A31F24', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#14B8A6', '#6366F1'];

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Date Filtering States
  const [rangePreset, setRangePreset] = useState<'Today' | 'This Week' | 'This Month' | 'Custom'>('This Month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Search & Filter state for Visitor Intelligence log
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');

  // UI Selection States
  const [activeSection, setActiveSection] = useState<'sales' | 'devices' | 'geo' | 'profit'>('sales');
  const [chartType, setChartType] = useState<'traffic' | 'sales'>('sales');
  const [topProductsMetric, setTopProductsMetric] = useState<'quantity' | 'revenue'>('quantity');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.append('rangePreset', rangePreset);
      if (rangePreset === 'Custom') {
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }

      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
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
  }, [rangePreset, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [rangePreset, fetchAnalytics]);

  const handleCustomDateApply = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    fetchAnalytics();
  };

  const toggleExpandSession = (sessionId: string) => {
    setExpandedSessionId(prev => prev === sessionId ? null : sessionId);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!data) return;
    const { stats, topProducts, categorySales, customerSegment, geographicBreakdown, deviceBreakdown } = data;
    
    let csv = '';
    csv += `Business & Telemetry Analytics Report (${rangePreset})\n`;
    csv += `Date Range: ${startDate || 'N/A'} to ${endDate || 'N/A'}\n\n`;
    
    csv += `--- REVENUE & ORDER SUMMARY ---\n`;
    csv += `Metric,Value\n`;
    csv += `Total Revenue,BDT ${stats.totalRevenue}\n`;
    csv += `Total Orders,${stats.totalOrders}\n`;
    csv += `Average Order Value,BDT ${stats.averageOrderValue}\n`;
    csv += `Total Items Sold,${stats.totalQuantitySold}\n\n`;
    
    csv += `--- BANGLADESH DIVISION SALES & TRAFFIC ---\n`;
    csv += `Division,Orders Count,Revenue Generated,Session Share\n`;
    geographicBreakdown?.divisions?.forEach((d: any) => {
      csv += `"${d.division}",${d.orders},BDT ${d.revenue},${d.percentage}%\n`;
    });
    csv += `\n`;

    csv += `--- DEVICE & OS BREAKDOWN ---\n`;
    csv += `Device Type,Visitor Count,Share\n`;
    deviceBreakdown?.devices?.forEach((d: any) => {
      csv += `"${d.name}",${d.count},${d.percentage}%\n`;
    });
    csv += `\n`;
    
    csv += `--- TOP SELLING PRODUCTS ---\n`;
    csv += `Product Title,Quantity Sold,Revenue Generated\n`;
    topProducts.byQuantity.forEach((p: any) => {
      csv += `"${p._id}",${p.quantity},BDT ${p.revenue}\n`;
    });
    csv += `\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics_report_${rangePreset.toLowerCase().replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportDropdownOpen(false);
  };

  // Export PDF / Print Handler
  const handleExportPDF = () => {
    if (!data) return;
    const { stats, topProducts, categorySales, customerSegment, geographicBreakdown, deviceBreakdown } = data;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <html>
        <head>
          <title>Executive Analytics & Telemetry Report - AS SIDRAT</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; padding: 40px; margin: 0; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; color: #a31f24; }
            .header p { margin: 5px 0 0 0; font-size: 11px; color: #64748b; font-weight: bold; }
            .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #475569; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; margin-top: 35px; margin-bottom: 15px; font-weight: 800; }
            .kpi-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .kpi-card { background: #f8fafc; border: 1px solid #f1f5f9; padding: 15px; border-radius: 8px; }
            .kpi-card p { margin: 0; font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px; }
            .kpi-card h3 { margin: 6px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 10px 12px; text-align: left; font-size: 11px; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
            .text-right { text-align: right; }
            .footer { margin-top: 60px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              .no-print { display: none; }
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="background-color: #a31f24; color: white; border: none; padding: 8px 16px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;">Print / Save as PDF</button>
          </div>
          
          <div class="header">
            <div>
              <h1>AS SIDRAT — Executive Analytics & Telemetry Report</h1>
              <p>Exported on ${new Date().toLocaleDateString()} — Preset: ${rangePreset}</p>
            </div>
          </div>

          <div class="section-title">Revenue & Order Summary</div>
          <div class="kpi-grid">
            <div class="kpi-card"><p>Total Revenue</p><h3>৳ ${stats.totalRevenue.toLocaleString()}</h3></div>
            <div class="kpi-card"><p>Total Orders</p><h3>${stats.totalOrders}</h3></div>
            <div class="kpi-card"><p>Total Visitors</p><h3>${stats.totalSessions}</h3></div>
            <div class="kpi-card"><p>Bounce Rate</p><h3>${stats.bounceRate}%</h3></div>
          </div>

          <div class="section-title">Bangladesh Division Performance</div>
          <table>
            <thead>
              <tr>
                <th>Division</th>
                <th class="text-right">Orders</th>
                <th class="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${geographicBreakdown?.divisions?.map((d: any) => `
                <tr>
                  <td>${d.division}</td>
                  <td class="text-right">${d.orders}</td>
                  <td class="text-right">৳ ${d.revenue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>AS SIDRAT Executive Business & Telemetry Analytics Report. Confidential.</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setExportDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3">
        <Loader2 className="animate-spin text-[#A31F24]" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading Business & Telemetry Intelligence...</p>
      </div>
    );
  }

  const { 
    stats, 
    trend, 
    topProducts, 
    categorySales, 
    customerSegment, 
    profitStats, 
    deviceBreakdown, 
    hourlyPeak, 
    geographicBreakdown,
    demographics,
    sessions 
  } = data || {};

  // Filter sessions based on search query
  const filteredSessions = (sessions || []).filter((session: any) => {
    if (!sessionSearchQuery) return true;
    const q = sessionSearchQuery.toLowerCase();
    const email = session.customerEmail?.toLowerCase() || '';
    const name = session.customerName?.toLowerCase() || '';
    const phone = session.customerPhone?.toLowerCase() || '';
    const city = session.city?.toLowerCase() || '';
    const div = session.division?.toLowerCase() || '';
    const ip = session.ip?.toLowerCase() || '';
    const device = session.device?.toLowerCase() || '';
    
    return email.includes(q) || name.includes(q) || phone.includes(q) || city.includes(q) || div.includes(q) || ip.includes(q) || device.includes(q);
  });

  // KPIs
  const avgMargin = profitStats?.totalRevenue > 0 ? Math.round((profitStats?.netProfit / profitStats?.totalRevenue) * 100) : 0;
  const profitKPIs = [
    { title: 'Total Revenue', value: `৳${profitStats?.totalRevenue?.toLocaleString() || 0}`, desc: 'Selling price × quantity', icon: DollarSign, color: 'bg-indigo-50 text-indigo-600 border-indigo-105' },
    { title: 'Total Costs', value: `৳${profitStats?.totalCost?.toLocaleString() || 0}`, desc: 'Cost + Marketing + Delivery', icon: Package, color: 'bg-rose-50 text-[#A31F24] border-rose-105' },
    { title: 'Net Profit', value: `৳${profitStats?.netProfit?.toLocaleString() || 0}`, desc: 'Revenue - Costs', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 border-emerald-105' },
    { title: 'Average Margin', value: `${avgMargin}%`, desc: 'Profit margin ratio', icon: Percent, color: 'bg-amber-50 text-amber-600 border-amber-105' },
  ];

  const trafficKPIs = [
    { title: 'Total Sessions', value: stats?.totalSessions || 0, desc: 'Unique visitors', icon: Users, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { title: 'Page Views', value: stats?.totalPageviews || 0, desc: 'Total screen loads', icon: Eye, color: 'bg-rose-50 text-[#A31F24] border-rose-100' },
    { title: 'Total Clicks', value: stats?.totalClicks || 0, desc: 'Interactions', icon: MousePointerClick, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { title: 'Bounce Rate', value: `${stats?.bounceRate || 0}%`, desc: 'Left after 1 view', icon: Percent, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  ];

  const salesKPIs = [
    { title: 'Total Revenue', value: `৳${stats?.totalRevenue?.toLocaleString() || 0}`, desc: 'Total bill paid', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, desc: 'Processed checkouts', icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { title: 'Average Order Value', value: `৳${stats?.averageOrderValue?.toLocaleString() || 0}`, desc: 'Per order spend', icon: TrendingUp, color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { title: 'Total Items Sold', value: stats?.totalQuantitySold || 0, desc: 'Clothing count', icon: Package, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  ];

  const customerRatioData = [
    { name: 'New Customers', value: customerSegment?.newCustomersRevenue || 0, count: customerSegment?.newCustomersCount || 0 },
    { name: 'Returning Customers', value: customerSegment?.returningCustomersRevenue || 0, count: customerSegment?.returningCustomersCount || 0 }
  ];

  const topProductsList = topProductsMetric === 'quantity' ? topProducts?.byQuantity : topProducts?.byRevenue;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header and Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="text-[#A31F24]" size={26} /> Business & User Intelligence Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time device breakdown, peak browsing hours, Bangladesh division analytics & customer email logs.</p>
        </div>
        
        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          
          {/* Preset Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 shrink-0">
            {(['Today', 'This Week', 'This Month', 'Custom'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setRangePreset(preset)}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  rangePreset === preset 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'hover:text-slate-900'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {rangePreset === 'Custom' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1 border border-slate-200 rounded-xl">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-semibold px-2 py-1 outline-none text-slate-700"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-semibold px-2 py-1 outline-none text-slate-700"
              />
              <button
                onClick={handleCustomDateApply}
                className="bg-slate-900 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-[#A31F24] transition-all uppercase tracking-wider"
              >
                Apply
              </button>
            </div>
          )}

          {/* Export Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider bg-[#A31F24] text-white rounded-xl hover:bg-[#A31F24]/90 transition-all shadow-sm shadow-[#A31F24]/10 cursor-pointer"
            >
              <Download size={14} /> Export Report
            </button>
            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-black font-semibold flex items-center gap-2"
                >
                  <Package size={14} /> Export as Excel (CSV)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-black font-semibold flex items-center gap-2"
                >
                  <FileText size={14} /> Print / Save as PDF
                </button>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button 
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 mt-2 gap-2">
        <button
          onClick={() => setActiveSection('sales')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSection === 'sales'
              ? 'border-[#A31F24] text-[#A31F24] font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag size={16} /> Sales & Traffic
        </button>

        <button
          onClick={() => setActiveSection('devices')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSection === 'devices'
              ? 'border-[#A31F24] text-[#A31F24] font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Smartphone size={16} /> Device, Peak Time & Age
        </button>

        <button
          onClick={() => setActiveSection('geo')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSection === 'geo'
              ? 'border-[#A31F24] text-[#A31F24] font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin size={16} /> BD Division & Location
        </button>

        <button
          onClick={() => setActiveSection('profit')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSection === 'profit'
              ? 'border-[#A31F24] text-[#A31F24] font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign size={16} /> Profit & Cost Margin
        </button>
      </div>

      {/* ──────────────── TAB 1: GENERAL SALES & TRAFFIC ──────────────── */}
      {activeSection === 'sales' && (
        <>
          {/* SALES REPORT METRICS GRID */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Business Sales Report Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {salesKPIs.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl border ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* VISITOR TRAFFIC METRICS GRID */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Traffic & Engagement Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trafficKPIs.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl border ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TREND CHART PANEL */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Performance Trend</h3>
                <p className="text-xs text-slate-400">Timeline view for range: {rangePreset}</p>
              </div>
              
              <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600">
                <button
                  onClick={() => setChartType('sales')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center gap-1.5 ${
                    chartType === 'sales' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                  }`}
                >
                  <DollarSign size={14} /> Sales & Orders
                </button>
                <button
                  onClick={() => setChartType('traffic')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center gap-1.5 ${
                    chartType === 'traffic' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                  }`}
                >
                  <Eye size={14} /> Traffic Views
                </button>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartType === 'sales' ? '#10B981' : '#A31F24'} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={chartType === 'sales' ? '#10B981' : '#A31F24'} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartType === 'sales' ? '#6366F1' : '#10B981'} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={chartType === 'sales' ? '#6366F1' : '#10B981'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                  <ChartTooltip content={<CustomTooltip />} />
                  {chartType === 'sales' ? (
                    <>
                      <Area type="monotone" name="Revenue (৳)" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
                      <Area type="monotone" name="Orders Count" dataKey="orders" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorSecondary)" />
                    </>
                  ) : (
                    <>
                      <Area type="monotone" name="Page Views" dataKey="pageviews" stroke="#A31F24" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
                      <Area type="monotone" name="Clicks Count" dataKey="clicks" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSecondary)" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TOP SELLING PRODUCTS & CUSTOMER SEGMENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Top Selling Products</h3>
                  <p className="text-xs text-slate-400">Products with highest contribution in the selected date range.</p>
                </div>
                
                <div className="flex p-0.5 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600">
                  <button
                    onClick={() => setTopProductsMetric('quantity')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      topProductsMetric === 'quantity' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                    }`}
                  >
                    By Qty Sold
                  </button>
                  <button
                    onClick={() => setTopProductsMetric('revenue')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      topProductsMetric === 'revenue' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                    }`}
                  >
                    By Revenue (৳)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="p-4 pl-6">Product</th>
                      <th className="p-4 text-center">Items Sold</th>
                      <th className="p-4 text-right pr-6">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!topProductsList || topProductsList.length === 0) ? (
                      <tr>
                        <td colSpan={3} className="p-12 text-center text-slate-400 italic">No sales recorded.</td>
                      </tr>
                    ) : (
                      topProductsList.map((product: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-12 bg-slate-100 rounded overflow-hidden shrink-0 border">
                                <Image src={product.image} alt={product._id} fill sizes="40px" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-950 line-clamp-1">{product._id}</p>
                                <span className="text-[10px] font-bold text-[#A31F24] uppercase">Rank #{idx+1}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-700">{product.quantity}</td>
                          <td className="p-4 text-right font-black text-slate-950 pr-6">৳{product.revenue.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <Users size={20} className="text-[#A31F24]" /> Customer Segments
                </h3>
                <p className="text-xs text-slate-400">Comparing revenue from new vs returning customers.</p>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center py-4 relative">
                <div className="w-full space-y-5">
                  <div className="h-[150px] w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerRatioData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          <Cell fill="#F59E0B" />
                          <Cell fill="#6366F1" />
                        </Pie>
                        <ChartTooltip formatter={(value: any) => value ? `৳${Number(value).toLocaleString()}` : ''} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                          New Customers ({customerSegment?.newCustomersCount} orders)
                        </span>
                        <span>৳{customerSegment?.newCustomersRevenue?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" />
                          Returning Customers ({customerSegment?.returningCustomersCount} orders)
                        </span>
                        <span>৳{customerSegment?.returningCustomersRevenue?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ──────────────── TAB 2: DEVICE, PEAK TIME & DEMOGRAPHICS ──────────────── */}
      {activeSection === 'devices' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Device & OS Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Device Types */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone size={18} className="text-[#A31F24]" /> Device Category Breakdown
                </h3>
                <p className="text-xs text-slate-400">Mobile vs Desktop vs Tablet ratio</p>
              </div>

              <div className="space-y-4 flex-1 flex flex-col justify-center">
                {deviceBreakdown?.devices?.map((dev: any, idx: number) => {
                  const colors = ['#A31F24', '#3B82F6', '#10B981'];
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-2">
                          {dev.name === 'Mobile' ? <Smartphone size={14} /> : dev.name === 'Desktop' ? <Monitor size={14} /> : <Tablet size={14} />}
                          {dev.name}
                        </span>
                        <span>{dev.count} ({dev.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700" 
                          style={{ width: `${dev.percentage}%`, backgroundColor: colors[idx % colors.length] }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operating System Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cpu size={18} className="text-indigo-600" /> Operating Systems
                </h3>
                <p className="text-xs text-slate-400">Android, iOS, Windows, macOS</p>
              </div>

              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {deviceBreakdown?.osList?.slice(0, 5).map((os: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800">{os.name}</span>
                    <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{os.count} visitors</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browsers Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe size={18} className="text-emerald-600" /> Web Browsers
                </h3>
                <p className="text-xs text-slate-400">Chrome, Safari, Firefox, Edge</p>
              </div>

              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {deviceBreakdown?.browsers?.slice(0, 5).map((b: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800">{b.name}</span>
                    <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{b.count} visitors</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 24-HOUR PEAK BROWSING TIME CHART */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock size={20} className="text-[#A31F24]" /> 24-Hour Peak Visitor Traffic Heatmap (পিক আওয়ার ট্রেণ্ড)
              </h3>
              <p className="text-xs text-slate-400">Visitors traffic distribution by hour of day (00:00 to 23:00) in Bangladesh time.</p>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyPeak}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Bar dataKey="visitors" name="Unique Visitors" fill="#A31F24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DEMOGRAPHICS & ESTIMATED AGE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-indigo-600" /> Customer Age Demographics & Target Segments
              </h3>
              <p className="text-xs text-slate-400">Estimated audience age distribution based on shopping interests and profile data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {demographics?.map((group: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age Group #{idx+1}</span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{group.group}</h4>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#A31F24]">{group.percentage}%</span>
                    <span className="text-xs text-slate-500 font-semibold">~{group.count} shoppers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ──────────────── TAB 3: BANGLADESH DIVISION & GEOGRAPHIC MAP ──────────────── */}
      {activeSection === 'geo' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* BANGLADESH 8 DIVISIONS BREAKDOWN */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={22} className="text-[#A31F24]" /> Bangladesh Division Sales & Traffic Distribution (বিভাগ ভিত্তিক পরিসংখ্যান)
              </h3>
              <p className="text-xs text-slate-400">Order count and revenue generated across all 8 Bangladesh divisions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Division Bar Chart */}
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geographicBreakdown?.divisions} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis dataKey="division" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#334155'}} width={120} />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue (৳)" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Division Ranking List */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                {geographicBreakdown?.divisions?.map((div: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#A31F24]/10 text-[#A31F24] text-[10px] font-black flex items-center justify-center">
                          #{idx+1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{div.division}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {div.orders} Orders • {div.sessions} Visitor Sessions ({div.percentage}% share)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-950">৳{div.revenue.toLocaleString()}</span>
                      <span className="block text-[10px] text-emerald-600 font-bold uppercase">Total Revenue</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* TOP CITIES & DISTRICTS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-white">
              <h3 className="text-base font-bold text-slate-900">Top Bangladesh Cities & Districts</h3>
              <p className="text-xs text-slate-400 mt-1">Rankings by orders and revenue generated from city addresses.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="p-4 pl-6">City / District</th>
                    <th className="p-4">Division</th>
                    <th className="p-4 text-center">Sessions</th>
                    <th className="p-4 text-center">Orders</th>
                    <th className="p-4 text-right pr-6">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {geographicBreakdown?.topCities?.map((city: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900 flex items-center gap-2">
                        <MapPin size={14} className="text-[#A31F24]" /> {city.city}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{city.division}</td>
                      <td className="p-4 text-center font-semibold text-slate-700">{city.sessions}</td>
                      <td className="p-4 text-center font-bold text-slate-900">{city.orders}</td>
                      <td className="p-4 text-right font-black text-slate-950 pr-6">৳{city.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ──────────────── TAB 4: PROFIT ANALYTICS ──────────────── */}
      {activeSection === 'profit' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Profitability Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profitKPIs.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl border ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-white">
              <h3 className="text-base font-bold text-slate-900">Per-Product Profit Breakdown</h3>
              <p className="text-xs text-slate-400 mt-1">Revenues, costs, margins and net profits for products sold.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150">
                    <th className="p-4 pl-6 text-xs font-semibold text-slate-500 uppercase tracking-widest">Product</th>
                    <th className="p-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-widest">Units Sold</th>
                    <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Revenue</th>
                    <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Costs</th>
                    <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Net Profit</th>
                    <th className="p-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-widest pr-6">Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm">
                  {!profitStats?.productBreakdown || profitStats.productBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-450 italic font-medium">No profit data available for this range.</td>
                    </tr>
                  ) : (
                    profitStats.productBreakdown.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 bg-slate-50 border border-slate-200 rounded overflow-hidden shrink-0">
                              <Image src={item.image} alt={item.title} fill sizes="40px" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-slate-900 leading-tight">{item.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-700">{item.quantity}</td>
                        <td className="p-4 text-right font-medium text-slate-800">৳{item.revenue.toLocaleString()}</td>
                        <td className="p-4 text-right font-medium text-slate-500">৳{item.cost.toLocaleString()}</td>
                        <td className={`p-4 text-right font-black ${item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ৳{item.profit.toLocaleString()}
                        </td>
                        <td className="p-4 text-center pr-6">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            item.margin >= 40 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            item.margin >= 20 ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            item.margin >= 0 ? 'bg-yellow-50 text-yellow-800 border-yellow-250' :
                            'bg-rose-50 text-rose-800 border-rose-250'
                          }`}>
                            {item.margin}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── VISITOR IDENTITY, EMAIL & LIVE STREAM INTELLIGENCE ──────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-4">
        
        {/* Header & Search */}
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail size={20} className="text-[#A31F24]" /> Visitor Identity & Detailed Clickstream Intelligence
            </h3>
            <p className="text-xs text-slate-500 mt-1">Captured visitor emails, customer phone, IP location, browsing duration & step-by-step path history.</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search email, name, city or IP..."
              value={sessionSearchQuery}
              onChange={(e) => setSessionSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#A31F24] transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Sessions Stream List */}
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {(!filteredSessions || filteredSessions.length === 0) ? (
            <div className="p-12 text-center text-slate-400 text-sm italic">
              No matching visitor sessions found.
            </div>
          ) : (
            filteredSessions.map((session: any) => {
              const isExpanded = expandedSessionId === session._id;
              
              let DeviceIcon = Monitor;
              if (session.device?.toLowerCase() === 'mobile') DeviceIcon = Smartphone;
              if (session.device?.toLowerCase() === 'tablet') DeviceIcon = Tablet;

              return (
                <div key={session._id} className="transition-all hover:bg-slate-50/40">
                  <div 
                    onClick={() => toggleExpandSession(session._id)}
                    className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold ${
                        session.customerEmail 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {session.customerEmail ? (
                          session.customerName.charAt(0).toUpperCase()
                        ) : (
                          <UserIcon size={16} />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">
                            {session.customerName}
                          </span>
                          
                          {session.customerEmail ? (
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <Mail size={10} /> {session.customerEmail}
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[9px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                              Guest Session
                            </span>
                          )}

                          {session.customerPhone && (
                            <span className="bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                              {session.customerPhone}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin size={11} className="text-[#A31F24]" />
                            {session.city || 'Dhaka'}, {session.division}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <DeviceIcon size={11} className="text-slate-400" />
                            {session.device} ({session.os} / {session.browser})
                          </span>
                          <span>•</span>
                          <span className="text-slate-400 font-mono text-[10px]">IP: {session.ip}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between lg:justify-end">
                      <div className="text-right">
                        <div className="flex gap-2 text-[11px] font-bold text-slate-800">
                          <span className="flex items-center gap-1">
                            <Eye size={12} className="text-slate-400" /> {session.pageviews} views
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointerClick size={12} className="text-slate-400" /> {session.clicks} clicks
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center justify-end gap-1">
                          <Clock size={11} className="text-[#A31F24]" /> 
                          Browsing Duration: <strong className="text-slate-900">{session.durationFormatted}</strong>
                        </p>
                      </div>

                      <button className="text-slate-400 hover:text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Clickstream History */}
                  {isExpanded && (
                    <div className="px-5 pb-5 bg-slate-50/70 border-t border-slate-200 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Step-by-Step Clickstream Timeline</p>
                        <span className="text-[10px] text-slate-500 font-semibold">Session ID: {session._id}</span>
                      </div>
                      
                      <div className="relative pl-5 border-l-2 border-slate-300 ml-2 space-y-3 py-1">
                        {session.events.map((event: any, evIdx: number) => {
                          const date = new Date(event.timestamp);
                          const isClick = event.eventType === 'click';

                          return (
                            <div key={evIdx} className="relative text-xs">
                              <div className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                                isClick ? 'bg-emerald-500 border-white' : 'bg-[#A31F24] border-white'
                              }`} />

                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`font-bold text-[10px] uppercase px-1.5 py-0.2 rounded ${
                                      isClick ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {isClick ? 'Click Event' : 'Page View'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {date.toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-800 font-medium">
                                    {isClick ? (
                                      <span>Clicked <strong className="text-emerald-700">{event.clickText}</strong> on path <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] text-slate-900">{event.url}</code></span>
                                    ) : (
                                      <span>Visited page <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] text-slate-900">{event.url}</code></span>
                                    )}
                                  </p>
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
