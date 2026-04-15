'use client'

import React, { useState, useTransition, useMemo } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format, isValid } from 'date-fns'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Calendar, Briefcase, Building2, ExternalLink,
  MoreHorizontal, Edit, Trash2, Plus, X, Search, Filter, RotateCcw,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react'
import { ApplicationDialog } from './ApplicationDialog'
import { deleteApplication, addTimelineEntry, deleteTimelineEntry } from '@/lib/actions'
import { ScrollArea } from "@/components/ui/scroll-area"

interface Step {
  type: 'STEP' | 'CONTACT'
  isStep: boolean
  date: string
  description: string
}

type SortKey = 'company' | 'role' | 'status' | 'applicationDate' | 'latestActivityDate';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  'Applied', 'Screening', 'Interview', 'Technical Interview', 'Final Interview',
  'Offer', 'Negotiating', 'Accepted', 'Rejected', 'Withdrawn', 'On Hold', 'Closed'
];
const JOB_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

// ─── Helpers ────────────────────────────────────────────────────────────────
const parseSteps = (stepsJson: string): Step[] => {
  try { return JSON.parse(stepsJson || '[]') } catch { return [] }
}

const getLatestStepDate = (stepsJson: string): Date | null => {
  const steps = parseSteps(stepsJson)
  if (steps.length === 0) return null
  const dates = steps
    .map(s => new Date(s.date))
    .filter(d => isValid(d))
  
  if (dates.length === 0) return null
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

// ─── Add-entry inline form ───────────────────────────────────────────────────
function AddTimelineEntry({ appId, onSaved }: { appId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'STEP' | 'CONTACT'>('STEP')
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
  const [description, setDescription] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!description.trim()) return
    startTransition(async () => {
      const res = await addTimelineEntry(appId, { type, date, description })
      if (res.success) {
        setDescription('')
        setDate(new Date().toISOString().substring(0, 10))
        setOpen(false)
        onSaved()
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 w-full mb-6"
      >
        <Plus size={15} /> Add Timeline Entry
      </button>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">New Entry</span>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setType('STEP')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${type === 'STEP' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
        >
          Interview Step
        </button>
        <button
          onClick={() => setType('CONTACT')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${type === 'CONTACT' ? 'bg-slate-700 text-white border-slate-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
        >
          Contact / Note
        </button>
      </div>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <textarea
        placeholder="Describe what happened…"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
      />
      <div className="flex gap-2">
        <Button
            onClick={handleSave}
            disabled={isPending || !description.trim()}
            size="sm"
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
        >
            {isPending ? 'Saving…' : 'Save Entry'}
        </Button>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export function DataTable({ applications: initialApps }: { applications: any[] }) {
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [isPending, startTransition] = useTransition()

  // Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'applicationDate', direction: 'desc' })

  const filteredApplications = useMemo(() => {
    // 1. Calculate derived activity dates
    const withActivity = initialApps.map(app => ({
      ...app,
      latestActivityDate: getLatestStepDate(app.steps)
    }));

    // 2. Filter
    const filtered = withActivity.filter(app => {
      const matchesSearch = 
        (app.company?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (app.role?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesType = typeFilter === 'all' || app.jobType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // 3. Sort
    return filtered.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else {
        // Fallback for mixed or other types (e.g. applicationDate might be string from DB)
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();
        if (!isNaN(dateA) && !isNaN(dateB)) {
          comparison = dateA - dateB;
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [initialApps, searchQuery, statusFilter, typeFilter, sortConfig]);

  // Keep selectedApp in sync when initialApps change
  React.useEffect(() => {
    if (selectedApp) {
      const updated = initialApps.find(a => a.id === selectedApp.id)
      if (updated) setSelectedApp(updated)
    }
  }, [initialApps])

  const handleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const deleteApp = (id: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      startTransition(async () => {
        await deleteApplication(id)
        if (selectedApp?.id === id) setSelectedApp(null)
      })
    }
  }

  const handleTimelineDelete = (idx: number) => {
    if (!selectedApp) return
    if (!confirm("Remove this timeline entry?")) return
    startTransition(async () => {
      await deleteTimelineEntry(selectedApp.id, idx)
    })
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
    setSortConfig({ key: 'applicationDate', direction: 'desc' })
  }

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('applied')) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (s.includes('interview') || s.includes('screening')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (s.includes('rejected') || s.includes('denied') || s.includes('closed') || s.includes('withdrawn')) return 'bg-slate-100 text-slate-800 border-slate-200'
    if (s.includes('offer') || s.includes('accepted') || s.includes('negotiat')) return 'bg-amber-100 text-amber-800 border-amber-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-3 w-3 text-blue-600" /> : <ArrowDown className="ml-2 h-3 w-3 text-blue-600" />;
  };

  return (
    <div className="w-full space-y-4">
      {/* ─── Search & Filters ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search by company or role..." 
                className="pl-9 bg-slate-50/50 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-40">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select 
                    className="w-full h-9 pl-8 pr-3 rounded-md border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 appearance-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
            </div>

            <div className="relative flex-1 sm:w-36">
                <select 
                    className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 appearance-none text-center"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">All Types</option>
                    {JOB_TYPE_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>

            <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-slate-400 hover:text-slate-600"
                onClick={resetFilters}
                title="Reset filters & sort"
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead 
                className="font-semibold text-slate-900 py-4 pl-6 cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center">Company <SortIndicator column="company" /></div>
              </TableHead>
              <TableHead 
                className="font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100/50 transition-colors max-w-[300px]"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center">Role <SortIndicator column="role" /></div>
              </TableHead>
              <TableHead 
                className="font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">Status <SortIndicator column="status" /></div>
              </TableHead>
              <TableHead 
                className="font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100/50 transition-colors whitespace-nowrap"
                onClick={() => handleSort('applicationDate')}
              >
                <div className="flex items-center">Date Applied <SortIndicator column="applicationDate" /></div>
              </TableHead>
              <TableHead 
                className="font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100/50 transition-colors whitespace-nowrap"
                onClick={() => handleSort('latestActivityDate')}
              >
                <div className="flex items-center">Latest Activity <SortIndicator column="latestActivityDate" /></div>
              </TableHead>
              <TableHead className="font-semibold text-slate-900 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <TableRow key={app.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <TableCell className="font-medium text-slate-900 pl-6" onClick={() => setSelectedApp(app)}>{app.company}</TableCell>
                  <TableCell className="text-slate-600 truncate max-w-[300px]" onClick={() => setSelectedApp(app)} title={app.role}>{app.role}</TableCell>
                  <TableCell onClick={() => setSelectedApp(app)}>
                    <Badge variant="outline" className={`${getStatusColor(app.status)} shadow-none font-medium`}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 whitespace-nowrap" onClick={() => setSelectedApp(app)}>
                    {app.applicationDate ? format(new Date(app.applicationDate), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell className="text-slate-500 whitespace-nowrap" onClick={() => setSelectedApp(app)}>
                    {app.latestActivityDate ? format(app.latestActivityDate, 'MMM d, yyyy') : (
                        app.applicationDate ? format(new Date(app.applicationDate), 'MMM d, yyyy') : '—'
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-40">
                        <ApplicationDialog
                          mode="edit"
                          id={app.id}
                          initData={app}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          onClick={() => deleteApp(app.id)}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500 italic">
                        No applications found matching your criteria.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Detail Sheet ─── */}
      <Sheet open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <SheetContent className="sm:max-w-2xl border-l border-slate-200 bg-white p-0 shadow-2xl flex flex-col h-full overflow-hidden">
          {selectedApp && (
            <>
              {/* Header */}
              <div className="p-8 pb-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium tracking-wide uppercase">
                    <Building2 size={14} />
                    {selectedApp.locationType || 'General'}
                  </div>
                  {/* Edit + Delete quick actions */}
                  <div className="flex items-center gap-1">
                    <ApplicationDialog
                      mode="edit"
                      id={selectedApp.id}
                      initData={selectedApp}
                      trigger={
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-colors">
                          <Edit size={13} /> Edit
                        </button>
                      }
                    />
                    <button
                      onClick={() => deleteApp(selectedApp.id)}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
                <SheetTitle className="text-3xl font-bold tracking-tight text-slate-900 mt-2 mb-2">
                  {selectedApp.company}
                </SheetTitle>
                <SheetDescription render={<div className="flex flex-col gap-3 text-slate-600 mt-1 text-base" />}>
                  <div className="flex items-center gap-2 font-medium">
                    <Briefcase size={17} className="text-slate-400" />
                    {selectedApp.role}
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <Badge className={`${getStatusColor(selectedApp.status)} shadow-none border`}>
                      {selectedApp.status}
                    </Badge>
                    {selectedApp.jobType && <Badge variant="secondary" className="shadow-none">{selectedApp.jobType}</Badge>}
                    {selectedApp.link && (
                      <a href={selectedApp.link} target="_blank" rel="noopener noreferrer"
                        className="text-sm flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full font-medium ml-1 transition-colors">
                        <ExternalLink size={13} /> Job Post
                      </a>
                    )}
                  </div>
                </SheetDescription>
              </div>

              {/* Scrollable body */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-8 pt-6 pb-20">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="mb-6 bg-slate-100/80 p-1 w-full justify-start h-11 rounded-lg">
                      <TabsTrigger value="details" className="px-6 data-[state=active]:shadow-sm rounded-md">Details</TabsTrigger>
                      <TabsTrigger value="timeline" className="px-6 data-[state=active]:shadow-sm rounded-md">Timeline</TabsTrigger>
                    </TabsList>

                    {/* ── DETAILS ── */}
                    <TabsContent value="details" className="space-y-8">

                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Job Specifications</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                          <div><span className="text-slate-500 block mb-0.5">Gross Salary</span><span className="font-medium text-slate-900">{selectedApp.avgGrossSal || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Net Salary</span><span className="font-medium text-slate-900">{selectedApp.avgNetSal || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Duration</span><span className="font-medium text-slate-900">{selectedApp.duration || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Interview Type</span><span className="font-medium text-slate-900">{selectedApp.interviewType || '—'}</span></div>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Recruitment Contact</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                          <div><span className="text-slate-500 block mb-0.5">Recruiting Co.</span><span className="font-medium text-slate-900">{selectedApp.recruiterCo || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Main Recruiter</span><span className="font-medium text-slate-900">{selectedApp.mainRecruiter || '—'}</span></div>
                          <div className="col-span-2"><span className="text-slate-500 block mb-0.5">Contact</span><span className="font-medium text-slate-900">{selectedApp.recruiterContact || '—'}</span></div>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Dates & Next Steps</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                          <div>
                            <span className="text-slate-500 block mb-0.5">Application Date</span>
                            <span className="font-medium text-slate-900">
                              {selectedApp.applicationDate ? format(new Date(selectedApp.applicationDate), 'MMM d, yyyy') : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5">Deadline</span>
                            <span className="font-medium text-slate-900">
                              {selectedApp.deadline ? format(new Date(selectedApp.deadline), 'MMM d, yyyy') : '—'}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500 block mb-0.5">Next Action</span>
                            <span className="font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded inline-block mt-0.5">
                              {selectedApp.nextAction || '—'}
                            </span>
                          </div>
                        </div>
                      </section>

                      {(selectedApp.notes || selectedApp.finalFeedback) && (
                        <section>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Notes & Feedback</h4>
                          <div className="space-y-4 text-sm">
                            {selectedApp.notes && (
                              <div>
                                <span className="text-slate-500 block mb-1">General Notes</span>
                                <p className="text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-100 whitespace-pre-wrap leading-relaxed">{selectedApp.notes}</p>
                              </div>
                            )}
                            {selectedApp.finalFeedback && (
                              <div>
                                <span className="text-slate-500 block mb-1">Final Feedback</span>
                                <p className="text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-100 whitespace-pre-wrap leading-relaxed">{selectedApp.finalFeedback}</p>
                              </div>
                            )}
                          </div>
                        </section>
                      )}
                    </TabsContent>

                    {/* ── TIMELINE ── */}
                    <TabsContent value="timeline">
                      {/* Activity history */}
                      <h3 className="text-sm font-semibold text-slate-900 mb-5 flex items-center gap-2">
                        <Calendar size={17} className="text-slate-400" />
                        Activity History
                      </h3>

                      <AddTimelineEntry
                        appId={selectedApp.id}
                        onSaved={() => {/* revalidation handles update */}}
                      />

                      <div className="relative pl-7 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                        {parseSteps(selectedApp.steps).length > 0 ? (
                          parseSteps(selectedApp.steps).map((step, idx) => (
                            <div key={idx} className="relative group/step">
                              <div className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-[3px] shadow-sm z-10 ${step.type === 'STEP' ? 'bg-blue-500 border-white' : 'bg-slate-400 border-white'}`} />
                              <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                      {format(new Date(step.date), 'MMM d, yyyy')}
                                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${step.type === 'STEP' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {step.type === 'STEP' ? 'Interview Step' : 'Contact'}
                                      </span>
                                    </p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{step.description}</p>
                                  </div>
                                  <button
                                    onClick={() => handleTimelineDelete(idx)}
                                    className="opacity-0 group-hover/step:opacity-100 transition-opacity text-slate-300 hover:text-red-400 shrink-0 mt-0.5"
                                    title="Remove entry"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
                            No timeline entries yet. Add one above!
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
