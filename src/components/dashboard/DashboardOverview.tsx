'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Banknote,
  Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function DashboardOverview({ applications }: { applications: any[] }) {
  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter(a => !['rejected', 'denied', 'closed', 'withdrawn'].some(s => a.status.toLowerCase().includes(s))).length;
    const offers = applications.filter(a => ['offer', 'accepted'].some(s => a.status.toLowerCase().includes(s))).length;
    
    const statusCounts = applications.reduce((acc: any, app) => {
      const status = app.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const salApps = applications.filter(a => a.grossSalTo > 0);
    const avgGross = salApps.length > 0 
      ? salApps.reduce((acc, a) => acc + a.grossSalTo, 0) / salApps.length 
      : 0;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts: any = {};
    
    applications.forEach(app => {
      if (!app.applicationDate) return;
      const date = new Date(app.applicationDate);
      const month = months[date.getMonth()];
      counts[month] = (counts[month] || 0) + 1;
    });

    const activityData = months.map(name => ({ name, count: counts[name] || 0 }));

    return { total, active, offers, statusData, avgGross, activityData };
  }, [applications]);

  return (
    <div className="space-y-8">
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
                  <Bar dataKey="count" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={40} />
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


