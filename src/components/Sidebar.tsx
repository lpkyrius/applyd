'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  LayoutDashboard, 
  ListTodo, 
  Settings, 
  BriefcaseBusiness,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ListTodo, label: 'Applications', href: '/' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 border-b border-slate-100/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-slate-900 text-white p-2 rounded-xl group-hover:bg-blue-600 transition-colors">
            <BriefcaseBusiness size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">Applyd</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={18} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency</span>
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">Keep applying!</p>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full w-[45%]" />
          </div>
        </div>
      </div>

      <div className="p-6 text-xs text-slate-400 font-medium">
        &copy; 2026 Applyd Dashboard
      </div>
    </aside>
  );
}
