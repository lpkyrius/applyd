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

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#64748B'];

export function DashboardOverview({ applications }: { applications: any[] }) {

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

    // Normalize each salary to a yearly equivalent before averaging
    const toYearly = (value: number, period: string | null | undefined): number => {
      switch ((period || 'year').toLowerCase()) {
        case 'hour':  return value * 8 * 220;   // 8h/day × 220 working days
        case 'day':   return value * 220;        // 220 working days/year
        case 'month': return value * 12;
        default:      return value;              // 'year' or unknown → as-is
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

    // Generate accurate activity data for the range
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

  return (
    <div className="space-y-8">
      {/* ── FILTERS ── */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="p-2 rounded-xl bg-slate-900 text-white shrink-0">
          <Filter size={18} />
        </div>
        <div className="flex-1 flex items-center gap-6">
          {/* FROM SECTION */}
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 border-l-2 border-slate-900 pl-1.5 ml-1 uppercase tracking-widest block">From</span>
              <div className="flex items-center gap-2">
                <Select value={startYear} onValueChange={setStartYear}>
                  <SelectTrigger className="h-9 w-[90px] rounded-lg border-slate-200">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={startMonth} onValueChange={setStartMonth}>
                  <SelectTrigger className="h-9 w-[100px] rounded-lg border-slate-200">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-100 shrink-0" />

          {/* TO SECTION */}
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 border-l-2 border-slate-400 pl-1.5 ml-1 uppercase tracking-widest block">To</span>
              <div className="flex items-center gap-2">
                <Select value={endYear} onValueChange={setEndYear}>
                  <SelectTrigger className="h-9 w-[90px] rounded-lg border-slate-200">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={endMonth} onValueChange={setEndMonth}>
                  <SelectTrigger className="h-9 w-[100px] rounded-lg border-slate-200">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-400 flex items-center gap-2 pr-2">
          <Calendar size={14} />
          {filteredApps.length} records in range
        </div>
      </div>

      {/* ── METRICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Applications" 
          value={stats.total} 
          icon={Briefcase}
          trend="+12% from last month"
          color="bg-blue-500"
        />
        <MetricCard 
          title="Active Tracks" 
          value={stats.active} 
          icon={Target}
          trend="Moving forward"
          color="bg-slate-900"
        />
        <MetricCard 
          title="Offers Received" 
          value={stats.offers} 
          icon={CheckCircle2}
          trend={`${((stats.offers / stats.total) * 100 || 0).toFixed(1)}% success rate`}
          color="bg-emerald-500"
        />
        <MetricCard 
          title="Avg. Market Value" 
          value={`€${(stats.avgGross / 1000).toFixed(1)}k`} 
          icon={Banknote}
          trend="Based on your top ranges"
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── STATUS DISTRIBUTION ── */}
        <Card className="lg:col-span-1 rounded-3xl border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Status Breakdown</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ── MONTHLY ACTIVITY ── */}
        <Card className="lg:col-span-2 rounded-3xl border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Application Momentum</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="rounded-3xl border-slate-200/60 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-xl text-white", color)}>
            <Icon size={20} />
          </div>
        </div>
        <div>
          <h4 className="text-slate-500 font-medium text-sm mb-1">{title}</h4>
          <div className="text-3xl font-extrabold text-slate-900 leading-tight">
            {value}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-slate-400 tracking-tight">
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


