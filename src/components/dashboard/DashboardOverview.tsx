'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { AlertCircle, Banknote, Briefcase, Calendar, CheckCircle2, Clock, Target, TrendingUp, Users, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationDialog } from '../ApplicationDialog';
import { ChevronRight } from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#F59E0B', '#10B981', '#64748B', '#F43F5E'];

const STATUS_COLORS: Record<string, string> = {
  'applied': '#3B82F6',
  'interviewing': '#8B5CF6',
  'screening': '#8B5CF6',
  'technical interview': '#F59E0B',
  'offer': '#10B981',
  'accepted': '#10B981',
  'rejected': '#EF4444',
  'closed': '#64748B',
  'withdrawn': '#94A3B8',
  'on hold': '#94A3B8',
  'prospecting': '#06B6D4',
};

export function DashboardOverview({ applications }: { applications: any[] }) {
  // ... existing memo logic ...
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = ['2023', '2024', '2025', '2026', '2027'];

  // Default to last 12 months
  const defaultDates = useMemo(() => {
    const now = new Date();
    const endM = months[now.getMonth()];
    const endY = now.getFullYear().toString();
    
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const startM = months[start.getMonth()];
    const startY = start.getFullYear().toString();
    
    return { startM, startY, endM, endY };
  }, []);

  const [startYear, setStartYear] = React.useState(defaultDates.startY);
  const [startMonth, setStartMonth] = React.useState(defaultDates.startM);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  const [endYear, setEndYear] = React.useState(defaultDates.endY);
  const [endMonth, setEndMonth] = React.useState(defaultDates.endM);

  const filteredApps = useMemo(() => {
    const sVal = parseInt(startYear) * 12 + months.indexOf(startMonth);
    const eVal = parseInt(endYear) * 12 + months.indexOf(endMonth);
    
    return applications.filter(app => {
      if (!app.applicationDate) return false;
      const d = new Date(app.applicationDate);
      const currentVal = d.getFullYear() * 12 + d.getMonth();
      return currentVal >= sVal && currentVal <= eVal;
    });
  }, [applications, startYear, startMonth, endYear, endMonth]);

  const stats = useMemo(() => {
    const total = filteredApps.length;
    const active = filteredApps.filter(a => !['rejected', 'denied', 'closed', 'withdrawn'].some(s => a.status.toLowerCase().includes(s))).length;
    const offers = filteredApps.filter(a => ['offer', 'accepted'].some(s => a.status.toLowerCase().includes(s))).length;
    
    const statusCounts = filteredApps.reduce((acc: any, app) => {
      const status = app.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const toYearly = (value: number, period: string | null | undefined): number => {
      switch ((period || 'year').toLowerCase()) {
        case 'hour':  return value * 8 * 220;
        case 'day':   return value * 220;
        case 'month': return value * 12;
        default:      return value;
      }
    };
    const salApps = filteredApps.filter(a => a.grossSalTo > 0);
    const avgGross = salApps.length > 0
      ? salApps.reduce((acc, a) => acc + toYearly(a.grossSalTo, a.salaryPeriod), 0) / salApps.length
      : 0;

    const counts: any = {};
    filteredApps.forEach(app => {
      const date = new Date(app.applicationDate);
      const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
      counts[label] = (counts[label] || 0) + 1;
    });

    const activityData: any[] = [];
    let currY = parseInt(startYear);
    let currM = months.indexOf(startMonth);
    const endY = parseInt(endYear);
    const endM = months.indexOf(endMonth);

    while (currY < endY || (currY === endY && currM <= endM)) {
      const label = `${months[currM]} ${currY}`;
      activityData.push({
        name: label,
        count: counts[label] || 0
      });
      currM++;
      if (currM > 11) {
        currM = 0;
        currY++;
      }
    }

    return { total, active, offers, statusData, avgGross, activityData };
  }, [filteredApps, startYear, startMonth, endYear, endMonth]);

  if (!isMounted) {
    return <div className="h-[70vh] flex items-center justify-center text-slate-300">Loading Dashboard...</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center mb-8 border border-slate-100/50 shadow-sm">
          <Briefcase size={40} className="text-slate-300" />
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">No applications yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-base leading-relaxed">
            Your career dashboard is waiting for its first entry. Start tracking your journey today!
          </p>
        </div>
        <div className="pt-8">
            <ApplicationDialog 
              mode="create" 
              trigger={
                <button className="bg-slate-950 text-white px-10 py-4 rounded-md font-bold text-sm hover:bg-[#8B5CF6] transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 group shadow-lg shadow-purple-500/10">
                   Create your first application
                   <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              } 
            />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-12 space-y-10 animate-in fade-in duration-1000 slide-in-from-bottom-4">
      {/* ── TOP NAV / FILTERS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mt-16 lg:mt-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Recruit Intelligence Engine</p>
        </div>
        
        <div className="bg-white p-2 rounded-xl border border-slate-100/80 flex flex-col md:flex-row md:items-center gap-4 pr-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-md bg-slate-950 text-white shrink-0 shadow-md shadow-slate-900/10">
              <Filter size={18} />
            </div>
            <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Data</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-2 md:p-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">From</span>
              <div className="flex items-center gap-2">
                <Select value={startYear} onValueChange={(v) => setStartYear(v ?? "")}>
                  <SelectTrigger className="h-10 w-full sm:w-[95px] rounded-md border-slate-100 bg-slate-50/50 focus:bg-white text-[11px] font-black uppercase tracking-tight" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md p-1 border-slate-100">
                    {years.map(y => <SelectItem key={y} value={y} className="rounded-sm">{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={startMonth} onValueChange={(v) => setStartMonth(v ?? "")}>
                  <SelectTrigger className="h-10 w-full sm:w-[105px] rounded-md border-slate-100 bg-slate-50/50 focus:bg-white text-[11px] font-black uppercase tracking-tight" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md p-1 border-slate-100">
                    {months.map(m => <SelectItem key={m} value={m} className="rounded-sm">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="hidden sm:block h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">To</span>
              <div className="flex items-center gap-2">
                <Select value={endYear} onValueChange={(v) => setEndYear(v ?? "")}>
                  <SelectTrigger className="h-10 w-full sm:w-[95px] rounded-md border-slate-100 bg-slate-50/50 focus:bg-white text-[11px] font-black uppercase tracking-tight" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md p-1 border-slate-100">
                    {years.map(y => <SelectItem key={y} value={y} className="rounded-sm">{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={endMonth} onValueChange={(v) => setEndMonth(v ?? "")}>
                  <SelectTrigger className="h-10 w-full sm:w-[105px] rounded-md border-slate-100 bg-slate-50/50 focus:bg-white text-[11px] font-black uppercase tracking-tight" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md p-1 border-slate-100">
                    {months.map(m => <SelectItem key={m} value={m} className="rounded-sm">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BENTO GRID LAYOUT ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Primary Metrics (Row 1) */}
        <div className="lg:col-span-3">
          <MetricCard 
            title="Total Applications" 
            value={stats.total} 
            trend="+12%"
            trendLabel="Volume trend"
            color="bg-indigo-500"
            gradient={['#8B5CF6', '#A78BFA', '#C4B5FD']}
            data={[40, 60, 45, 90, 65, 80]}
          />
        </div>
        <div className="lg:col-span-3">
          <MetricCard 
            title="Active Pipeline" 
            value={stats.active} 
            trend="+5.6%"
            trendLabel="Last 30 days"
            color="bg-blue-500"
            gradient={['#3B82F6', '#60A5FA', '#93C5FD']}
            data={[30, 45, 70, 50, 90, 100]}
          />
        </div>
        <div className="lg:col-span-3">
          <MetricCard 
            title="Success Rate" 
            value={`${((stats.offers / stats.total) * 100 || 0).toFixed(1)}%`} 
            trend="+0.6%"
            trendLabel="Applied → Offer"
            color="bg-cyan-500"
            gradient={['#06B6D4', '#22D3EE', '#67E8F9']}
            data={[20, 40, 30, 60, 50, 75]}
          />
        </div>
        <div className="lg:col-span-3">
          <MetricCard 
            title="Avg. Market Range" 
            value={`€${(stats.avgGross / 1000).toFixed(1)}k`} 
            trend="-0.4pts"
            trendLabel="Gross yearly"
            color="bg-slate-400"
            gradient={['#94A3B8', '#CBD5E1', '#E2E8F0']}
            data={[50, 40, 60, 45, 55, 40]}
            isNegativeTrend
          />
        </div>

        {/* Large Bento Sections (Row 2 & 3) */}
        
        {/* Status Chart (Increase to 5 columns out of 12) */}
        <Card className="lg:col-span-5 bento-card overflow-hidden">
          <CardContent className="p-6 md:p-10 h-[520px] flex flex-col">
            <div className="flex items-center gap-2.5 mb-12">
                <div className="w-1 h-5 bg-slate-900 rounded-full" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Analysis</h3>
            </div>
            <div className="w-full mt-2">
              <ResponsiveContainer width="99%" height={360}>
                <BarChart 
                  data={stats.statusData} 
                  layout="vertical" 
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 9, fontWeight: 900, textAnchor: 'start' }}
                    dx={-100}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 backdrop-blur-md border border-slate-100 px-3 py-2 rounded-lg shadow-xl z-[100]">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{payload[0].payload.name}</p>
                            <p className="text-sm font-black text-slate-900">{payload[0].value} Applications</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 100, 100, 0]} 
                    barSize={12}
                  >
                    {stats.statusData.map((entry, index) => {
                      const shades = ['#1e1b4b', '#312e81', '#3730a3', '#4338ca', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={shades[index % shades.length]} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Volume</span>
              <span className="text-xl font-black text-slate-900">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Momentum Chart (Reduce to 7 columns out of 12) */}
        <Card className="lg:col-span-7 bento-card overflow-hidden">
          <CardContent className="p-6 md:p-10 h-[520px] flex flex-col">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 bg-purple-600 rounded-full" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Momentum</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Submissions</span>
                    </div>
                </div>
            </div>
            <div className="w-full mt-2">
              <ResponsiveContainer width="99%" height={360}>
                <BarChart data={stats.activityData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 4 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', padding: '16px' }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, trendLabel, color, gradient, data, isNegativeTrend }: any) {
  return (
    <Card className="rounded-xl border-none premium-shadow bg-white hover:scale-[1.01] transition-all duration-500 group overflow-hidden">
      <CardContent className="p-8 relative">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] mb-3">{title}</h4>
            <div className="text-4xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                {value}
            </div>
            <div className="flex items-center gap-2">
                <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1",
                    isNegativeTrend ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                )}>
                    {isNegativeTrend ? "↘" : "↗"} {trend}
                </span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{trendLabel}</span>
            </div>
          </div>
        </div>

        {/* Mini Sparkline Bar Chart */}
        <div className="mt-8 h-12 flex items-end gap-1 px-1">
            {data.map((h: number, i: number) => (
                <div 
                    key={i} 
                    className="flex-1 rounded-sm transition-all duration-500 group-hover:opacity-100 opacity-40"
                    style={{ 
                        height: `${h}%`,
                        backgroundColor: gradient[i % 3],
                    }}
                />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}



