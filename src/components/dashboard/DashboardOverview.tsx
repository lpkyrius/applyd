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

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#64748B', '#8B5CF6', '#F43F5E', '#1E293B'];

const STATUS_COLORS: Record<string, string> = {
  'applied': '#10B981',
  'interviewing': '#3B82F6',
  'screening': '#6366F1',
  'technical interview': '#F59E0B',
  'offer': '#8B5CF6',
  'accepted': '#10B981',
  'rejected': '#1E293B',
  'closed': '#F43F5E',
  'withdrawn': '#64748B',
  'on hold': '#94A3B8',
  'prospecting': '#14B8A6',
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

  if (applications.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-4 premium-shadow-sm border border-white">
          <Briefcase size={40} className="text-slate-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No applications yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
            Your career dashboard is waiting for its first entry. Start tracking your journey today!
          </p>
        </div>
        <div className="pt-4">
            <ApplicationDialog 
              mode="create" 
              trigger={
                <button className="bg-slate-950 text-white px-8 py-4 rounded-[1.5rem] font-bold text-sm hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 premium-shadow flex items-center gap-2 group">
                   Create your first application
                   <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              } 
            />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 slide-in-from-bottom-4">
      {/* ── TOP NAV / FILTERS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Recruit Intelligence Engine</p>
        </div>
        
        <div className="glass-card p-2 rounded-[2rem] border-white/60 flex items-center gap-4 premium-shadow-sm pr-4">
          <div className="p-3 rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-200 shrink-0">
            <Filter size={18} />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">From</span>
              <div className="flex items-center gap-2">
                <Select value={startYear} onValueChange={(v) => setStartYear(v ?? "")}>
                  <SelectTrigger className="h-9 w-[90px] rounded-xl border-slate-200/40 bg-white/50 focus:bg-white text-xs font-bold" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl p-1 premium-shadow border-slate-100">
                    {years.map(y => <SelectItem key={y} value={y} className="rounded-lg">{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={startMonth} onValueChange={(v) => setStartMonth(v ?? "")}>
                  <SelectTrigger className="h-9 w-[100px] rounded-xl border-slate-200/40 bg-white/50 focus:bg-white text-xs font-bold" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl p-1 premium-shadow border-slate-100">
                    {months.map(m => <SelectItem key={m} value={m} className="rounded-lg">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200/60 shrink-0" />

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">To</span>
              <div className="flex items-center gap-2">
                <Select value={endYear} onValueChange={(v) => setEndYear(v ?? "")}>
                  <SelectTrigger className="h-9 w-[90px] rounded-xl border-slate-200/40 bg-white/50 focus:bg-white text-xs font-bold" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl p-1 premium-shadow border-slate-100">
                    {years.map(y => <SelectItem key={y} value={y} className="rounded-lg">{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={endMonth} onValueChange={(v) => setEndMonth(v ?? "")}>
                  <SelectTrigger className="h-9 w-[100px] rounded-xl border-slate-200/40 bg-white/50 focus:bg-white text-xs font-bold" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl p-1 premium-shadow border-slate-100">
                    {months.map(m => <SelectItem key={m} value={m} className="rounded-lg">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BENTO GRID LAYOUT ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Primary Metrics (Row 1) */}
        <MetricCard 
          title="Total Volume" 
          value={stats.total} 
          icon={Briefcase}
          trend="+12% growth"
          color="bg-indigo-600"
          glowColor="rgba(79, 70, 229, 0.2)"
        />
        <MetricCard 
          title="In Progress" 
          value={stats.active} 
          icon={Target}
          trend="Active pipeline"
          color="bg-blue-600"
          glowColor="rgba(37, 99, 235, 0.2)"
        />
        <MetricCard 
          title="Success Rate" 
          value={`${((stats.offers / stats.total) * 100 || 0).toFixed(1)}%`} 
          icon={CheckCircle2}
          trend={`${stats.offers} offers secured`}
          color="bg-emerald-500"
          glowColor="rgba(16, 185, 129, 0.2)"
        />
        <MetricCard 
          title="Avg. Market Range" 
          value={`€${(stats.avgGross / 1000).toFixed(1)}k`} 
          icon={Banknote}
          trend="Gross yearly"
          color="bg-amber-500"
          glowColor="rgba(245, 158, 11, 0.2)"
        />

        {/* Large Bento Sections (Row 2 & 3) */}
        
        {/* Status Chart (1 Column) */}
        <Card className="lg:col-span-1 bento-card">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Distribution</h3>
            </div>
            <div className="w-full relative" style={{ height: 400 }}>
              <ResponsiveContainer width="99%" height={400}>
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} 
                        className="focus:outline-none" 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    content={(props) => {
                      const { payload } = props;
                      return (
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
                          {payload?.map((entry: any, index: number) => (
                            <div key={`item-${index}`} className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: entry.color }} 
                              />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[100px]">
                                {entry.value.toLowerCase().includes('prospec') ? 'Prospecting' : entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Momentum Chart (3 Columns) */}
        <Card className="lg:col-span-3 bento-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Momentum</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Submissions</span>
                    </div>
                </div>
            </div>
            <div className="w-full relative" style={{ height: 400 }}>
              <ResponsiveContainer width="99%" height={400}>
                <BarChart data={stats.activityData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0.8} />
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
                    cursor={{ fill: '#f8fafc', radius: 16 }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px' }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[12, 12, 12, 12]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color, glowColor }: any) {
  return (
    <Card className="rounded-[2.5rem] border-slate-200/60 shadow-sm bg-white hover:premium-shadow transition-all duration-300 border-white/60 group">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className={cn("p-3 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 duration-300", color)} style={{ boxShadow: `0 8px 20px ${glowColor}` }}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">{title}</h4>
          <div className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
            {value}
          </div>
          {trend && (
            <div className="flex items-center gap-1.5 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{trend}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



