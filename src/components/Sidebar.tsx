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
  ChevronRight,
  Menu,
  X as CloseIcon
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ListTodo, label: 'Applications', href: '/applications' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[110] w-72 bg-slate-50 flex flex-col h-screen shrink-0 transition-transform duration-500 ease-in-out md:translate-x-0 md:static border-r border-slate-200/40",
        isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none md:pointer-events-auto"
      )}>
        <div className="p-8 mb-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="bg-slate-950 text-white p-3 rounded-lg group-hover:bg-[#8B5CF6] transition-all duration-500 border border-slate-100/10 rotate-3 group-hover:rotate-0 shadow-sm">
              <BriefcaseBusiness size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-slate-900 leading-none">Applyd</span>
              <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-[0.3em] mt-1.5 opacity-80">Recruit OS</span>
            </div>
          </Link>
          
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <CloseIcon size={20} />
          </button>
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
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between px-6 py-4 rounded-md text-sm font-bold transition-all duration-200 group",
                  isActive 
                    ? "bg-white text-slate-950 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] scale-[1.01]" 
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-[#8B5CF6]" : "text-slate-400 group-hover:text-slate-900 transition-colors")} />
                  <span className="tracking-tight">{item.label}</span>
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.4)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 mb-8">
          <div className="bg-white rounded-xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group/efficiency transition-all duration-500">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl transition-all" />
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                <TrendingUp size={14} className="text-[#8B5CF6]" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Momentum</span>
            </div>
            <p className="text-sm font-black text-slate-900 mb-4 tracking-tight">Level Up!</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
              <div className="bg-[#8B5CF6] h-full w-[45%] rounded-full transition-all duration-1000" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Weekly Goal</p>
              <p className="text-[10px] text-[#8B5CF6] font-black">45%</p>
            </div>
          </div>
        </div>

        <div className="p-6 mt-auto border-t border-slate-200/40">
          <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-white transition-all duration-300 group border border-transparent hover:border-slate-100 hover:shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform">
                 <UserCircle className="text-slate-400 w-full h-full p-1" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-black text-slate-900 tracking-tight">Leandro P.</span>
                <span className="text-[9px] font-bold text-[#8B5CF6] uppercase tracking-widest">Premium</span>
              </div>
            </div>
            <Settings size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors rotate-0 group-hover:rotate-45 duration-500" />
          </button>
        </div>
      </aside>

      {/* Overlay Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] z-[90] animate-in fade-in duration-300" 
        />
      )}

      {/* Mobile Menu Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-6 left-6 z-[200] p-3 bg-white border border-slate-100 rounded-xl shadow-lg text-slate-600 hover:text-[#8B5CF6] transition-all active:scale-95 cursor-pointer pointer-events-auto"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
      )}
    </>
  );
}

