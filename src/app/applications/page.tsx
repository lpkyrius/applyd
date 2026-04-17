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
    <main className="p-8 pb-20 max-w-7xl mx-auto space-y-10">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Applications
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Manage and track your active job opportunities.
          </p>
        </div>
        <div className="flex gap-3">
          <ApplicationDialog mode="create" />
        </div>
      </header>

      <section>
        <DataTable applications={applications} />
      </section>
    </main>
  )
}
