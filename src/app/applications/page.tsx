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
    <main className="p-10 pb-24 max-w-[1400px] mx-auto space-y-12">
      <header className="flex justify-between items-end pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Applications
            </h1>
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 mt-1">
              {applications.length} Total
            </span>
          </div>
          <p className="text-slate-500 font-medium text-lg">
            Manage and track your active job opportunities.
          </p>
        </div>
        <div className="flex gap-3 mb-1">
          <ApplicationDialog mode="create" />
        </div>
      </header>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <DataTable applications={applications} />
      </section>
    </main>

  )
}
