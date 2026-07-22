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
  FileText
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
                {item.name.includes('Revenue') ? `৳${item.value.toLocaleString()}` : item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#A31F24', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#14B8A6'];

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Date Filtering States
  const [rangePreset, setRangePreset] = useState<'Today' | 'This Week' | 'This Month' | 'Custom'>('This Month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // UI Selection States
  const [activeSection, setActiveSection] = useState<'sales' | 'profit'>('sales');
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
    const { stats, topProducts, categorySales, customerSegment } = data;
    
    let csv = '';
    csv += `Business Analytics Report (${rangePreset})\n`;
    csv += `Date Range: ${startDate || 'N/A'} to ${endDate || 'N/A'}\n\n`;
    
    csv += `--- REVENUE & ORDER SUMMARY ---\n`;
    csv += `Metric,Value\n`;
    csv += `Total Revenue,BDT ${stats.totalRevenue}\n`;
    csv += `Total Orders,${stats.totalOrders}\n`;
    csv += `Average Order Value,BDT ${stats.averageOrderValue}\n`;
    csv += `Total Items Sold,${stats.totalQuantitySold}\n\n`;
    
    csv += `--- TOP SELLING PRODUCTS (BY QUANTITY) ---\n`;
    csv += `Product Title,Quantity Sold,Revenue Generated\n`;
    topProducts.byQuantity.forEach((p: any) => {
      csv += `"${p._id}",${p.quantity},BDT ${p.revenue}\n`;
    });
    csv += `\n`;
    
    csv += `--- TOP SELLING PRODUCTS (BY REVENUE) ---\n`;
    csv += `Product Title,Quantity Sold,Revenue Generated\n`;
    topProducts.byRevenue.forEach((p: any) => {
      csv += `"${p._id}",${p.quantity},BDT ${p.revenue}\n`;
    });
    csv += `\n`;
    
    csv += `--- CATEGORY SALES BREAKDOWN ---\n`;
    csv += `Category,Quantity Sold,Revenue Generated\n`;
    categorySales.forEach((c: any) => {
      csv += `"${c.category}",${c.quantity},BDT ${c.revenue}\n`;
    });
    csv += `\n`;
    
    csv += `--- CUSTOMER SEGMENTS ---\n`;
    csv += `Segment,Orders Count,Revenue Contribution\n`;
    csv += `New Customers,${customerSegment.newCustomersCount},BDT ${customerSegment.newCustomersRevenue}\n`;
    csv += `Returning Customers,${customerSegment.returningCustomersCount},BDT ${customerSegment.returningCustomersRevenue}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `business_report_${rangePreset.toLowerCase().replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportDropdownOpen(false);
  };

  // Export PDF / Print Handler
  const handleExportPDF = () => {
    if (!data) return;
    const { stats, topProducts, categorySales, customerSegment } = data;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <html>
        <head>
          <title>Business Report - AS SIDRAT</title>
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
            .segment-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 30px; }
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
              <h1>AS SIDRAT - Business Report</h1>
              <p>Exported on ${new Date().toLocaleDateString()} — Preset: ${rangePreset}</p>
            </div>
            <div class="text-right">
              <p style="margin:0; font-size:9px; uppercase; color:#64748b;">Report Period:</p>
              <p style="margin:5px 0 0 0; font-size: 12px; color: #0f172a; font-weight:bold;">${startDate ? new Date(startDate).toLocaleDateString() : 'N/A'} - ${endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div class="section-title">Revenue & Order Metrics</div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <p>Total Revenue</p>
              <h3>৳ ${stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div class="kpi-card">
              <p>Total Orders</p>
              <h3>${stats.totalOrders}</h3>
            </div>
            <div class="kpi-card">
              <p>Average Order Value</p>
              <h3>৳ ${stats.averageOrderValue.toLocaleString()}</h3>
            </div>
            <div class="kpi-card">
              <p>Total Items Sold</p>
              <h3>${stats.totalQuantitySold}</h3>
            </div>
          </div>

          <div class="section-title">Top Selling Products</div>
          <table>
            <thead>
              <tr>
                <th>Product Title</th>
                <th class="text-right">Quantity Sold</th>
                <th class="text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              ${topProducts.byRevenue.slice(0, 5).map((p: any) => `
                <tr>
                  <td>${p._id}</td>
                  <td class="text-right">${p.quantity}</td>
                  <td class="text-right">৳ ${p.revenue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="segment-grid">
            <div>
              <div class="section-title">Category-wise Sales</div>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${categorySales.map((c: any) => `
                    <tr>
                      <td>${c.category}</td>
                      <td class="text-right">${c.quantity}</td>
                      <td class="text-right">৳ ${c.revenue.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div>
              <div class="section-title">Customer Segmentation</div>
              <table>
                <thead>
                  <tr>
                    <th>Segment</th>
                    <th class="text-right">Orders</th>
                    <th class="text-right">Revenue Share</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>New Customers</td>
                    <td class="text-right">${customerSegment.newCustomersCount}</td>
                    <td class="text-right">৳ ${customerSegment.newCustomersRevenue.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Returning Customers</td>
                    <td class="text-right">${customerSegment.returningCustomersCount}</td>
                    <td class="text-right">৳ ${customerSegment.returningCustomersRevenue.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="footer">
            <p>AS SIDRAT Fashion Shop Analytics Report. Generated automatically. Confidential.</p>
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
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading Business Reports...</p>
      </div>
    );
  }

  const { stats, trend, topProducts, categorySales, customerSegment, profitStats } = data || {};

  // Profit KPI configurations
  const avgMargin = profitStats?.totalRevenue > 0 ? Math.round((profitStats?.netProfit / profitStats?.totalRevenue) * 100) : 0;
  const profitKPIs = [
    { title: 'Total Revenue', value: `৳${profitStats?.totalRevenue?.toLocaleString() || 0}`, desc: 'Selling price × quantity', icon: DollarSign, color: 'bg-indigo-50 text-indigo-600 border-indigo-105' },
    { title: 'Total Costs', value: `৳${profitStats?.totalCost?.toLocaleString() || 0}`, desc: 'Cost + Marketing + Delivery', icon: Package, color: 'bg-rose-50 text-[#A31F24] border-rose-105' },
    { title: 'Net Profit', value: `৳${profitStats?.netProfit?.toLocaleString() || 0}`, desc: 'Revenue - Costs', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 border-emerald-105' },
    { title: 'Average Margin', value: `${avgMargin}%`, desc: 'Profit margin ratio', icon: Percent, color: 'bg-amber-50 text-amber-600 border-amber-105' },
  ];

  // KPI configurations
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

  // Pie chart segment definitions
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Analytics & Reports</h1>
          <p className="text-xs text-slate-500 mt-1">Detailed date range filters, product sales charts, customer segmentation, and report downloads.</p>
        </div>
        
        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          
          {/* Preset Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 shrink-0">
            {(['Today', 'This Week', 'This Month', 'Custom'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setRangePreset(preset)}
                className={`px-3 py-2 rounded-lg transition-all ${
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

      {/* Section Switcher */}
      <div className="flex border-b border-slate-200 mt-2">
        <button
          onClick={() => setActiveSection('sales')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${
            activeSection === 'sales'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-950'
          }`}
        >
          General Sales Analytics
        </button>
        <button
          onClick={() => setActiveSection('profit')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${
            activeSection === 'profit'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-950'
          }`}
        >
          Profit Analytics (লাভ বিশ্লেষণ)
        </button>
      </div>

      {activeSection === 'sales' ? (
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
            <p className="text-xs text-slate-400">Timeline view for the current range: {startDate || 'N/A'} to {endDate || 'N/A'}.</p>
          </div>
          
          {/* Chart selector */}
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

        {/* Chart area */}
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

      {/* ── CHANNELS PERFORMANCE: WEBSITE VS LANDING PAGES ── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe size={20} className="text-[#A31F24]" /> Landing Page vs Main Website Comparison
          </h3>
          <p className="text-xs text-slate-400">Comparing reach (visitors), orders, and revenue generated between your landing pages and the main website.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traffic Reach comparison */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <Users size={16} className="text-[#A31F24]" /> Traffic & Reach (ভলিয়ুম ও রিচ)
            </h4>
            
            <div className="space-y-4">
              {/* Landing Page traffic */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Landing Pages (ল্যান্ডিং পেজসমূহ)</span>
                  <div className="flex gap-3 text-slate-500 font-medium">
                    <span>{data?.sourceComparison?.traffic?.landingPage?.sessions?.toLocaleString() || 0} Reach</span>
                    <span>•</span>
                    <span>{data?.sourceComparison?.traffic?.landingPage?.pageviews?.toLocaleString() || 0} Views</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full transition-all duration-1000"
                    style={{ 
                      width: `${
                        (data?.sourceComparison?.traffic?.landingPage?.sessions + data?.sourceComparison?.traffic?.mainWebsite?.sessions) > 0 
                          ? Math.round((data.sourceComparison.traffic.landingPage.sessions / (data.sourceComparison.traffic.landingPage.sessions + data.sourceComparison.traffic.mainWebsite.sessions)) * 100) 
                          : 0
                      }%` 
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  Share: {((data?.sourceComparison?.traffic?.landingPage?.sessions || 0) + (data?.sourceComparison?.traffic?.mainWebsite?.sessions || 0)) > 0 
                    ? Math.round((data.sourceComparison.traffic.landingPage.sessions / (data.sourceComparison.traffic.landingPage.sessions + data.sourceComparison.traffic.mainWebsite.sessions)) * 100) 
                    : 0}% of total reach
                </div>
              </div>

              {/* Main Website traffic */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Main Website (প্রধান ওয়েবসাইট)</span>
                  <div className="flex gap-3 text-slate-500 font-medium">
                    <span>{data?.sourceComparison?.traffic?.mainWebsite?.sessions?.toLocaleString() || 0} Reach</span>
                    <span>•</span>
                    <span>{data?.sourceComparison?.traffic?.mainWebsite?.pageviews?.toLocaleString() || 0} Views</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-1000"
                    style={{ 
                      width: `${
                        (data?.sourceComparison?.traffic?.landingPage?.sessions + data?.sourceComparison?.traffic?.mainWebsite?.sessions) > 0 
                          ? Math.round((data.sourceComparison.traffic.mainWebsite.sessions / (data.sourceComparison.traffic.landingPage.sessions + data.sourceComparison.traffic.mainWebsite.sessions)) * 100) 
                          : 0
                      }%` 
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  Share: {((data?.sourceComparison?.traffic?.landingPage?.sessions || 0) + (data?.sourceComparison?.traffic?.mainWebsite?.sessions || 0)) > 0 
                    ? Math.round((data.sourceComparison.traffic.mainWebsite.sessions / (data.sourceComparison.traffic.landingPage.sessions + data.sourceComparison.traffic.mainWebsite.sessions)) * 100) 
                    : 0}% of total reach
                </div>
              </div>
            </div>
          </div>

          {/* Orders & Revenue Comparison */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <ShoppingBag size={16} className="text-[#A31F24]" /> Orders & Revenue (অর্ডার ও বিক্রি)
            </h4>

            <div className="space-y-4">
              {/* Landing Page sales */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Landing Pages (ল্যান্ডিং পেজসমূহ)</span>
                  <div className="flex gap-3 text-slate-500 font-medium">
                    <span>{data?.sourceComparison?.orders?.landingPage?.count || 0} Orders</span>
                    <span>•</span>
                    <span className="font-black text-slate-900">৳{data?.sourceComparison?.orders?.landingPage?.revenue?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-1000"
                    style={{ 
                      width: `${
                        (data?.sourceComparison?.orders?.landingPage?.count + data?.sourceComparison?.orders?.mainWebsite?.count) > 0 
                          ? Math.round((data.sourceComparison.orders.landingPage.count / (data.sourceComparison.orders.landingPage.count + data.sourceComparison.orders.mainWebsite.count)) * 100) 
                          : 0
                      }%` 
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  Share: {((data?.sourceComparison?.orders?.landingPage?.count || 0) + (data?.sourceComparison?.orders?.mainWebsite?.count || 0)) > 0 
                    ? Math.round((data.sourceComparison.orders.landingPage.count / (data.sourceComparison.orders.landingPage.count + data.sourceComparison.orders.mainWebsite.count)) * 100) 
                    : 0}% of total orders
                </div>
              </div>

              {/* Main Website sales */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Main Website (প্রধান ওয়েবসাইট)</span>
                  <div className="flex gap-3 text-slate-500 font-medium">
                    <span>{data?.sourceComparison?.orders?.mainWebsite?.count || 0} Orders</span>
                    <span>•</span>
                    <span className="font-black text-slate-900">৳{data?.sourceComparison?.orders?.mainWebsite?.revenue?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-1000"
                    style={{ 
                      width: `${
                        (data?.sourceComparison?.orders?.landingPage?.count + data?.sourceComparison?.orders?.mainWebsite?.count) > 0 
                          ? Math.round((data.sourceComparison.orders.mainWebsite.count / (data.sourceComparison.orders.landingPage.count + data.sourceComparison.orders.mainWebsite.count)) * 100) 
                          : 0
                      }%` 
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  Share: {((data?.sourceComparison?.orders?.landingPage?.count || 0) + (data?.sourceComparison?.orders?.mainWebsite?.count || 0)) > 0 
                    ? Math.round((data.sourceComparison.orders.mainWebsite.count / (data.sourceComparison.orders.landingPage.count + data.sourceComparison.orders.mainWebsite.count)) * 100) 
                    : 0}% of total orders
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION (TOP SELLING PRODUCTS, BREAKDOWN CHANGER) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top Selling Products</h3>
              <p className="text-xs text-slate-400">Products with highest contribution in the selected date range.</p>
            </div>
            
            {/* Metric Switcher */}
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

        {/* Customer Segments: New vs Returning */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <Users size={20} className="text-[#A31F24]" /> Customer Segments
            </h3>
            <p className="text-xs text-slate-400">Comparing revenue contribution from new vs returning customers.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-4 relative">
            
            {/* Visual Splitting Bar Chart */}
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
                    <ChartTooltip 
                      formatter={(value: any) => value ? `৳${Number(value).toLocaleString()}` : ''}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Detail list */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                
                {/* New Customer ratio */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                      New Customers ({customerSegment?.newCustomersCount} orders)
                    </span>
                    <span>৳{customerSegment?.newCustomersRevenue?.toLocaleString() || 0}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-1000"
                      style={{ 
                        width: `${
                          stats?.totalRevenue > 0 
                            ? Math.round((customerSegment?.newCustomersRevenue / stats?.totalRevenue) * 100) 
                            : 0
                        }%` 
                      }}
                    />
                  </div>
                </div>

                {/* Returning Customer Ratio */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" />
                      Returning Customers ({customerSegment?.returningCustomersCount} orders)
                    </span>
                    <span>৳{customerSegment?.returningCustomersRevenue?.toLocaleString() || 0}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-1000"
                      style={{ 
                        width: `${
                          stats?.totalRevenue > 0 
                            ? Math.round((customerSegment?.returningCustomersRevenue / stats?.totalRevenue) * 100) 
                            : 0
                        }%` 
                      }}
                    />
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM ROW (CATEGORY SALES BREAKDOWN & LIVE SESSION STREAM) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:col-span-1">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <Tag size={20} className="text-[#A31F24]" /> Category sales
            </h3>
            <p className="text-xs text-slate-400">Total revenue generated by product category groups.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {(!categorySales || categorySales.length === 0) ? (
              <p className="text-slate-400 text-xs italic text-center p-12">No category sales data.</p>
            ) : (
              <div className="space-y-4">
                {categorySales.map((item: any, idx: number) => {
                  const maxRevenue = Math.max(...categorySales.map((c: any) => c.revenue));
                  const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  const color = PIE_COLORS[idx % PIE_COLORS.length];
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span className="capitalize">{item.category}</span>
                        <div className="flex gap-2 text-[10px] text-slate-450 font-medium">
                          <span>{item.quantity} sold</span>
                          <span>•</span>
                          <span className="font-bold text-slate-900">৳{item.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-50 h-2 rounded-full border border-slate-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Visitor Session Journey Streams */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-white">
            <h3 className="text-lg font-bold text-slate-900">Live Traffic Sessions</h3>
            <p className="text-xs text-slate-500 mt-1">Real-time click streams and path analysis of the last 30 active users.</p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {(!data?.sessions || data.sessions.length === 0) ? (
              <div className="p-12 text-center text-slate-400 text-sm italic">
                No traffic recorded yet. Visits will show up here.
              </div>
            ) : (
              data.sessions.map((session: any) => {
                const durationMs = new Date(session.lastActive).getTime() - new Date(session.firstActive).getTime();
                const durationSec = Math.round(durationMs / 1000);
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs ${
                          session.userDetails 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-bold' 
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {session.userDetails ? (
                            session.userDetails.name.charAt(0).toUpperCase()
                          ) : (
                            <UserIcon size={14} />
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              {session.userDetails ? session.userDetails.name : `Guest ${session._id.slice(-6).toUpperCase()}`}
                            </span>
                            {session.userDetails && (
                              <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-emerald-100">
                                Registered User
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Globe size={11} className="text-slate-400" />
                              {session.city || 'Unknown'}, {session.country || 'Unknown'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-1">
                              <DeviceIcon size={11} className="text-slate-400" />
                              {session.browser}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between lg:justify-end">
                        <div className="text-right">
                          <div className="flex gap-2 text-[10px] font-semibold text-slate-700">
                            <span className="flex items-center gap-1">
                              <Eye size={11} className="text-slate-400" /> {session.pageviews} views
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointerClick size={11} className="text-slate-400" /> {session.clicks} clicks
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                            <Clock size={10} /> 
                            Active {durationSec < 60 ? `${durationSec}s` : `${Math.round(durationSec / 60)}m`} ago
                          </p>
                        </div>
                        <button className="text-slate-400 hover:text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 bg-slate-50/50 border-t border-slate-100/70 p-3">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-3 px-3">Visitor Journey Timeline</p>
                        
                        <div className="relative pl-5 border-l-2 border-slate-200 ml-3 space-y-3 py-1">
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
                                      <span className="font-bold text-slate-700">
                                        {isClick ? 'Click' : 'View'}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-medium">
                                        {date.toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-800">
                                      {isClick ? (
                                        <span>Clicked <strong className="text-emerald-700 select-all">{event.clickText}</strong> on {event.url}</span>
                                      ) : (
                                        <span>Loaded <strong className="text-[#A31F24] select-all">{event.url}</strong></span>
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
      </>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Profit KPI Summary Grid */}
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

          {/* Product Profit Margin Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-white">
              <h3 className="text-base font-bold text-slate-900">Per-Product Profit Breakdown</h3>
              <p className="text-xs text-slate-400 mt-1">Breakdown of revenues, costs, margins and net profits for each product sold in the selected range.</p>
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

    </div>
  );
}
