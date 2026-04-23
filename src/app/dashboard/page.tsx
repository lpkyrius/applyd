import { prisma } from '@/lib/prisma';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ArrowUpRight, Plus } from 'lucide-react';
import { ApplicationDialog } from '@/components/ApplicationDialog';

export default async function DashboardPage() {
  const applications = await prisma.application.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="p-8 pb-20 max-w-7xl mx-auto space-y-10">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Insights
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            A birds-eye view of your career progression and market value.
          </p>
        </div>
        <div className="flex gap-3">
          <ApplicationDialog mode="create" trigger={
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-[#8B5CF6] transition-all flex items-center gap-2 border border-slate-900 group shadow-sm">
              <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" /> New Application
            </button>
          } />
        </div>
      </header>

      <DashboardOverview applications={applications} />
    </main>
  );
}
