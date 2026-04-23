'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  LayoutDashboard, 
  ListTodo, 
  Settings, 
  BriefcaseBusiness,
  TrendingUp,
  UserCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ListTodo, label: 'Applications', href: '/applications' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-slate-200/60 bg-[#F8FAFC] flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-8 mb-4">
        <Link href="/dashboard" className="flex items-center gap-4 group">
          <div className="bg-slate-950 text-white p-3 rounded-[1.25rem] group-hover:bg-indigo-600 transition-all duration-500 premium-shadow rotate-3 group-hover:rotate-0">
            <BriefcaseBusiness size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-slate-900 leading-none">Applyd</span>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1.5 opacity-80">Recruit OS</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-6 space-y-2">
        <div className="px-3 mb-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group",
                isActive 
                  ? "bg-white text-slate-950 premium-shadow border border-slate-100 scale-[1.02]" 
                  : "text-slate-500 hover:bg-slate-200/40 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-900 transition-colors")} />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {isActive && <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mb-6">
        <div className="glass-card rounded-[2rem] p-6 border-white/60 shadow-xl overflow-hidden relative group/efficiency transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl transition-all group-hover/efficiency:bg-indigo-500/20" />
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <TrendingUp size={16} className="text-indigo-600" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Momentum</span>
          </div>
          <p className="text-base font-black text-slate-900 mb-4 tracking-tight">Level Up!</p>
          <div className="w-full bg-slate-200/40 rounded-full h-2.5 overflow-hidden mb-2">
            <div className="bg-indigo-600 h-full w-[45%] rounded-full shadow-[0_0_12px_rgba(79,70,229,0.5)] transition-all duration-1000" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Weekly Goal</p>
            <p className="text-[10px] text-indigo-600 font-black">45%</p>
          </div>
        </div>
      </div>

      <div className="p-6 mt-auto border-t border-slate-100/60">
        <button className="w-full flex items-center justify-between p-4 rounded-[1.5rem] hover:bg-white hover:premium-shadow transition-all duration-300 group border border-transparent hover:border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white premium-shadow overflow-hidden group-hover:scale-105 transition-transform">
               <UserCircle className="text-slate-400 w-full h-full p-1" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-black text-slate-900 tracking-tight">Leandro P.</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Premium</span>
            </div>
          </div>
          <Settings size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors rotate-0 group-hover:rotate-45 duration-500" />
        </button>
      </div>
    </aside>
  );
}

