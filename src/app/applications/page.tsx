import { prisma } from '@/lib/prisma'
import { DataTable } from '@/components/DataTable'
import { ApplicationDialog } from '@/components/ApplicationDialog'
import { Plus } from 'lucide-react'

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    orderBy: {
      applicationDate: 'desc',
    },
  })

  return (
    <main className="p-12 pb-24 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Applications</h1>
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
              {applications.length} Active
            </div>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Operational Tracking Interface</p>
        </div>
        
        <div className="flex items-center gap-4">
          <ApplicationDialog 
            mode="create" 
            trigger={
                <button className="bg-slate-950 text-white px-8 py-4 rounded-[1.5rem] font-bold text-sm hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 premium-shadow flex items-center gap-2 group">
                   <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                   New Application
                </button>
            }
          />
        </div>
      </header>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <DataTable applications={applications} />
      </section>
    </main>

  )
}
