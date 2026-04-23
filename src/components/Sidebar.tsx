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
    <aside className="w-64 border-r border-slate-200/60 bg-[#F8FAFC] flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-7 mb-2">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-slate-950 text-white p-2.5 rounded-2xl group-hover:bg-indigo-600 transition-all duration-300 premium-shadow">
            <BriefcaseBusiness size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">Applyd</span>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">Recruit OS</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all group",
                isActive 
                  ? "bg-white text-slate-900 premium-shadow-sm border border-slate-100" 
                  : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-900")} />
                {item.label}
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mb-4">
        <div className="glass-morphism rounded-3xl p-5 border border-white/40 shadow-sm overflow-hidden relative group/efficiency">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl transition-all group-hover/efficiency:bg-indigo-500/20" />
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <TrendingUp size={14} className="text-indigo-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</span>
          </div>
          <p className="text-sm font-bold text-slate-800 mb-3">Keep applying!</p>
          <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden mb-1">
            <div className="bg-indigo-600 h-full w-[45%] rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">45% of weekly goal reached</p>
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-slate-100/60">
        <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-200/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white premium-shadow-sm overflow-hidden">
               <UserCircle className="text-slate-400 w-full h-full p-0.5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold text-slate-900">Leandro P.</span>
              <span className="text-[10px] font-medium text-slate-500">Premium Plan</span>
            </div>
          </div>
          <Settings size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
        </button>
      </div>
    </aside>
  );
}

