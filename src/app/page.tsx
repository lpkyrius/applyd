import { prisma } from '@/lib/prisma'
import { DataTable } from '@/components/DataTable'
import { ApplicationDialog } from '@/components/ApplicationDialog'

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    orderBy: {
      applicationDate: 'desc',
    },
  })

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Applications
            </h1>
            <p className="text-slate-500 font-medium">
              Manage and track your active job opportunities
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-4">
            <div>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                Active Tracks
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {applications.length}
              </span>
            </div>
            <ApplicationDialog mode="create" />
          </div>
        </header>

        <section>
          <DataTable applications={applications} />
        </section>
        
        <footer className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            Applyd &bull; Clean Tech Dashboard v0.1.0
          </p>
        </footer>
      </div>
    </main>
  )
}
