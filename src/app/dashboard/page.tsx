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
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
              <Plus size={18} /> New Application
            </button>
          } />
        </div>
      </header>

      <DashboardOverview applications={applications} />
    </main>
  );
}
