'use client'

import React, { useState, useTransition, useMemo } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format, isValid } from 'date-fns'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Calendar, Briefcase, Building2, ExternalLink,
  MoreHorizontal, Edit, Trash2, Plus, X, Search, Filter, RotateCcw,
  ArrowUpDown, ArrowUp, ArrowDown, Users, Bell, Boxes, SlidersHorizontal, 
  CheckCircle2, XCircle, PauseCircle, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { ApplicationDialog } from './ApplicationDialog'
import { deleteApplication, addTimelineEntry, deleteTimelineEntry, updateTimelineEntry } from '@/lib/actions'
import { ScrollArea } from "@/components/ui/scroll-area"

interface Step {
  type: 'STEP' | 'CONTACT'
  isStep: boolean
  date: string
  description: string
}

type SortKey = 'company' | 'recruiterCo' | 'role' | 'status' | 'applicationDate' | 'latestActivityDate';
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
  try {
    const steps = JSON.parse(stepsJson || '[]') as Step[]
    return steps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch {
    return []
  }
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

// ─── Timeline Item Component ───────────────────────────────────────────────
function TimelineItem({ appId, step, idx, onDelete }: { appId: string; step: Step; idx: number; onDelete: (idx: number) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [type, setType] = useState<'STEP' | 'CONTACT'>(step.type)
  const [date, setDate] = useState(new Date(step.date).toISOString().substring(0, 10))
  const [description, setDescription] = useState(step.description)
  const [isPending, startTransition] = useTransition()

  const handleUpdate = () => {
    if (!description.trim()) return
    startTransition(async () => {
      const res = await updateTimelineEntry(appId, idx, { type, date, description })
      if (res.success) {
        setIsEditing(false)
      }
    })
  }

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-700">Edit Entry</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
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
                onClick={handleUpdate}
                disabled={isPending || !description.trim()}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
                {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                size="sm"
                className="flex-1"
            >
                Cancel
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group/step">
      <div className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-[3px] shadow-sm z-10 ${step.type === 'STEP' ? 'bg-blue-500 border-white' : 'bg-slate-400 border-white'}`} />
      <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              {format(new Date(step.date), 'MMM d, yyyy')}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${step.type === 'STEP' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                {step.type === 'STEP' ? 'Interview Step' : 'Contact'}
              </span>
            </p>
            <p className="text-sm text-slate-700 leading-relaxed break-words whitespace-pre-wrap">{step.description}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover/step:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-300 hover:text-blue-500 p-1 transition-colors"
              title="Edit entry"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(idx)}
              className="text-slate-300 hover:text-red-400 p-1 transition-colors"
              title="Remove entry"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const renderStatusIcon = (status: string) => {
  const s = (status || '').toLowerCase();
  let icon = <Bell size={18} className="text-slate-600" />;
  
  if (s.includes('applied')) {
    icon = <Bell size={18} className="text-slate-600" />;
  } else if (s.includes('screening')) {
    icon = <Search size={18} className="text-slate-600" />;
  } else if (s.includes('interview')) {
    icon = <Boxes size={18} className="text-slate-600" />;
  } else if (s.includes('offer') || s.includes('negotiat')) {
    icon = <SlidersHorizontal size={18} className="text-slate-600" />;
  } else if (s.includes('accepted')) {
    icon = <CheckCircle2 size={18} className="text-emerald-600" />;
  } else if (s.includes('rejected') || s.includes('denied') || s.includes('closed') || s.includes('withdrawn')) {
    icon = <XCircle size={18} className="text-red-400" />;
  } else if (s.includes('on hold')) {
    icon = <PauseCircle size={18} className="text-amber-500" />;
  }

  return (
    <div className="w-10 h-10 min-w-[40px] rounded-xl border border-slate-100 flex items-center justify-center bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)] group-hover:border-slate-200 transition-colors">
      {icon}
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
export function DataTable({ applications: initialApps }: { applications: any[] }) {
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [isPending, startTransition] = useTransition()

  // Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'latestActivityDate', direction: 'desc' })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Column Resizing state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    statusIcon: 80,
    recruiterCo: 180,
    company: 200,
    role: 300,
    status: 150,
    applicationDate: 150,
    latestActivityDate: 150,
    _actions: 80, // Actions column
  })

  const [resizing, setResizing] = useState<string | null>(null)

  const handleResizeStart = (e: React.MouseEvent, column: string) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.pageX
    const startWidth = columnWidths[column]

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.pageX - startX
      const newWidth = Math.max(80, startWidth + delta) // Min width 80px
      setColumnWidths(prev => ({ ...prev, [column]: newWidth }))
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      setResizing(null)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    setResizing(column)
  }

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
        (app.role?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (app.recruiterCo?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (app.companyLocation?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(app.status);
      const matchesType = typeFilter.length === 0 || typeFilter.includes((app.jobType as string) || '');

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

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredApplications.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredApplications, currentPage, rowsPerPage])

  // Reset page on filter/search change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, typeFilter])

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
    setStatusFilter([])
    setTypeFilter([])
    setSortConfig({ key: 'latestActivityDate', direction: 'desc' })
  }

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('applied') || s.includes('prospec')) return 'bg-slate-100/80 text-slate-600 border-slate-200 uppercase text-[10px] font-bold tracking-wider px-2 shadow-none'
    if (s.includes('interview') || s.includes('screening') || s.includes('test')) return 'bg-indigo-50 text-indigo-700 border-indigo-100 uppercase text-[10px] font-bold tracking-wider px-2 shadow-none'
    if (s.includes('rejected') || s.includes('denied') || s.includes('closed') || s.includes('withdrawn')) return 'bg-red-50 text-red-600 border-red-100 uppercase text-[10px] font-bold tracking-wider px-2 shadow-none'
    if (s.includes('offer') || s.includes('accepted') || s.includes('negotiat')) return 'bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px] font-bold tracking-wider px-2 shadow-none'
    return 'bg-slate-50 text-slate-500 border-slate-100 shadow-none'
  }

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-3 w-3 text-blue-600" /> : <ArrowDown className="ml-2 h-3 w-3 text-blue-600" />;
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const formatSalary = (from: number | null, to: number | null, currency: string | null) => {
    const f = from || 0;
    const t = to || 0;
    if (f === 0 && t === 0) return '—';
    
    const curr = currency || 'EUR';
    const symbol = curr === 'EUR' ? '€' : curr === 'USD' ? '$' : curr === 'GBP' ? '£' : `${curr} `;

    if (f === t || (f === 0 && t > 0)) {
      return `${symbol}${t.toLocaleString()}`;
    }
    if (f > 0 && t === 0) {
      return `${symbol}${f.toLocaleString()}`;
    }
    return `${symbol}${f.toLocaleString()} – ${symbol}${t.toLocaleString()}`;
  }

  return (
    <div className="w-full space-y-4">
      {/* ─── Search & Filters ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search by company, role or recruiter..." 
                className="pl-9 bg-slate-50/50 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
            <DropdownMenu>
                <DropdownMenuTrigger render={
                    <Button variant="outline" className="h-9 px-3 font-normal bg-slate-50/50 border-slate-200 text-slate-700 min-w-[130px] justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                                {statusFilter.length === 0 ? "All Status" : 
                                 statusFilter.length === 1 ? statusFilter[0] : 
                                 `${statusFilter.length} Status`}
                            </span>
                        </div>
                    </Button>
                } />
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={statusFilter.length === 0}
                        onCheckedChange={() => setStatusFilter([])}
                    >
                        All Status
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <div className="max-h-60 overflow-y-auto">
                        {STATUS_OPTIONS.map(status => (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={statusFilter.includes(status)}
                                onCheckedChange={() => toggleStatusFilter(status)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {status}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger render={
                    <Button variant="outline" className="h-9 px-3 font-normal bg-slate-50/50 border-slate-200 text-slate-700 min-w-[120px] justify-between">
                        <span className="truncate">
                            {typeFilter.length === 0 ? "All Types" : 
                             typeFilter.length === 1 ? typeFilter[0] : 
                             `${typeFilter.length} Types`}
                        </span>
                    </Button>
                } />
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Filter by Job Type</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={typeFilter.length === 0}
                        onCheckedChange={() => setTypeFilter([])}
                    >
                        All Types
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <div className="max-h-60 overflow-y-auto">
                        {JOB_TYPE_OPTIONS.map(type => (
                            <DropdownMenuCheckboxItem
                                key={type}
                                checked={typeFilter.includes(type)}
                                onCheckedChange={() => toggleTypeFilter(type)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {type}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

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
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto relative">
        <Table className="table-fixed w-full min-w-max border-collapse">
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead 
                style={{ width: columnWidths.statusIcon }}
                className="py-4 pl-6 relative"
              >
                <div className="w-10" /> {/* Spacer for icon */}
              </TableHead>
              <TableHead 
                style={{ width: columnWidths.recruiterCo }}
                className="font-semibold text-slate-900 py-4 cursor-pointer select-none hover:bg-slate-100/50 transition-colors relative"
                onClick={() => handleSort('recruiterCo')}
              >
                <div className="flex items-center truncate">Recruiter Co. <SortIndicator column="recruiterCo" /></div>
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'recruiterCo')}
                  className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400/50 transition-colors ${resizing === 'recruiterCo' ? 'bg-blue-500' : ''}`}
                />
              </TableHead>
              <TableHead 
                style={{ width: columnWidths.company }}
                className="font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100/50 transition-colors relative"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center truncate">Company <SortIndicator column="company" /></div>
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'company')}
                  className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400/50 transition-colors ${resizing === 'company' ? 'bg-blue-500' : ''}`}
                />
              </TableHead>
              <TableHead 
                style={{ width: columnWidths.role }}
                className="font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100/50 transition-colors relative"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center truncate">Role <SortIndicator column="role" /></div>
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'role')}
                  className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400/50 transition-colors ${resizing === 'role' ? 'bg-blue-500' : ''}`}
                />
              </TableHead>
              <TableHead 
                style={{ width: columnWidths.status }}
                className="font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100/50 transition-colors relative"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center truncate">Status <SortIndicator column="status" /></div>
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'status')}
                  className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400/50 transition-colors ${resizing === 'status' ? 'bg-blue-500' : ''}`}
                />
              </TableHead>
              <TableHead 
                style={{ width: columnWidths.applicationDate }}
                className="font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100/50 transition-colors whitespace-nowrap relative"
                onClick={() => handleSort('applicationDate')}
              >
                <div className="flex items-center truncate">Date Applied <SortIndicator column="applicationDate" /></div>
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'applicationDate')}
                  className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400/50 transition-colors ${resizing === 'applicationDate' ? 'bg-blue-500' : ''}`}
                />
              </TableHead>
              <TableHead 
                style={{ width: columnWidths.latestActivityDate }}
                className="font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100/50 transition-colors whitespace-nowrap relative"
                onClick={() => handleSort('latestActivityDate')}
              >
                <div className="flex items-center truncate">Latest Activity <SortIndicator column="latestActivityDate" /></div>
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'latestActivityDate')}
                  className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400/50 transition-colors ${resizing === 'latestActivityDate' ? 'bg-blue-500' : ''}`}
                />
              </TableHead>
              <TableHead style={{ width: columnWidths._actions }} className="font-semibold text-slate-900 text-right pr-6 relative">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplications.length > 0 ? (
              paginatedApplications.map((app) => (
                <TableRow key={app.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <TableCell 
                    style={{ width: columnWidths.statusIcon }} 
                    className="pl-6 py-3"
                    onClick={() => setSelectedApp(app)}
                  >
                    {renderStatusIcon(app.status)}
                  </TableCell>
                  <TableCell style={{ width: columnWidths.recruiterCo }} className="font-medium text-slate-900 truncate" onClick={() => setSelectedApp(app)}>{app.recruiterCo || '—'}</TableCell>
                  <TableCell style={{ width: columnWidths.company }} className="text-slate-500 truncate" onClick={() => setSelectedApp(app)}>{app.company}</TableCell>
                  <TableCell style={{ width: columnWidths.role }} className="text-slate-600 truncate" onClick={() => setSelectedApp(app)} title={app.role}>{app.role}</TableCell>
                  <TableCell style={{ width: columnWidths.status }} className="truncate" onClick={() => setSelectedApp(app)}>
                    <Badge variant="outline" className={`${getStatusColor(app.status)} shadow-none font-medium text-[10px]`}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ width: columnWidths.applicationDate }} className="text-slate-500 whitespace-nowrap truncate" onClick={() => setSelectedApp(app)}>
                    {app.applicationDate ? format(new Date(app.applicationDate), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell style={{ width: columnWidths.latestActivityDate }} className="text-slate-500 whitespace-nowrap truncate" onClick={() => setSelectedApp(app)}>
                    {app.latestActivityDate ? format(app.latestActivityDate, 'MMM d, yyyy') : (
                        app.applicationDate ? format(new Date(app.applicationDate), 'MMM d, yyyy') : '—'
                    )}
                  </TableCell>
                  <TableCell style={{ width: columnWidths._actions }} className="text-right pr-6">
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
                    <TableCell colSpan={8} className="h-32 text-center text-slate-500 italic">
                        No applications found matching your criteria.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>

        {/* ─── Pagination ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <div className="flex-1 text-sm text-slate-500">
            {filteredApplications.length > 0 ? (
              <>Showing <span className="font-semibold text-slate-900">{((currentPage - 1) * rowsPerPage) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(currentPage * rowsPerPage, filteredApplications.length)}</span> of <span className="font-semibold text-slate-900">{filteredApplications.length}</span> entries</>
            ) : (
              "No entries to show"
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-slate-700">Rows per page</p>
              <Select
                value={`${rowsPerPage}`}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-9 w-[70px] bg-white border-slate-200">
                  <SelectValue placeholder={rowsPerPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50, 100, 200].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-slate-700">
              Page {currentPage} of {Math.ceil(filteredApplications.length / rowsPerPage) || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-9 w-9 p-0 lg:flex bg-white border-slate-200 hover:bg-slate-50"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-9 w-9 p-0 bg-white border-slate-200 hover:bg-slate-50"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-9 w-9 p-0 bg-white border-slate-200 hover:bg-slate-50"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredApplications.length / rowsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredApplications.length / rowsPerPage) || filteredApplications.length === 0}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-9 w-9 p-0 lg:flex bg-white border-slate-200 hover:bg-slate-50"
                onClick={() => setCurrentPage(Math.ceil(filteredApplications.length / rowsPerPage))}
                disabled={currentPage === Math.ceil(filteredApplications.length / rowsPerPage) || filteredApplications.length === 0}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
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
                <SheetTitle className="text-2xl font-bold flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-slate-900 group flex items-center gap-2">
                        {selectedApp.company}
                        {selectedApp.companyUrl && (
                        <a href={selectedApp.companyUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                            <ExternalLink size={14} />
                        </a>
                        )}
                    </span>
                    <span className="text-slate-500 text-lg font-normal">{selectedApp.role}</span>
                  </div>
                  <Badge className={cn("px-4 py-1.5 rounded-full border shadow-sm self-start mt-1", getStatusColor(selectedApp.status))}>
                    {selectedApp.status}
                  </Badge>
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
                          <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center mb-2">
                             <div>
                               <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Candidate</span>
                               <span className="font-semibold text-slate-900 text-base">{selectedApp.name || '—'}</span>
                             </div>
                             <div className="text-2xl">{selectedApp.feel || '—'}</div>
                          </div>
                          <div><span className="text-slate-500 block mb-0.5">Job Type</span><span className="font-medium text-slate-900">{selectedApp.jobType || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Location Type</span><span className="font-medium text-slate-900">{selectedApp.locationType || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Duration</span><span className="font-medium text-slate-900">{selectedApp.duration || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Company Location</span><span className="font-medium text-slate-900">{selectedApp.companyLocation || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Initiator</span><span className="font-medium text-slate-900">{selectedApp.initiator || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Feel</span><span className="font-medium text-slate-900">{selectedApp.feel || '—'}</span></div>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Compensation</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                          <div>
                            <span className="text-slate-500 block mb-0.5">Gross Salary</span>
                            <span className="font-medium text-slate-900">
                              {formatSalary(selectedApp.grossSalFrom, selectedApp.grossSalTo, selectedApp.salaryCurrency)}
                              {selectedApp.salaryPeriod ? ` / ${selectedApp.salaryPeriod}` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5">Net Salary</span>
                            <span className="font-medium text-slate-900">
                              {formatSalary(selectedApp.netSalFrom, selectedApp.netSalTo, selectedApp.salaryCurrency)}
                              {selectedApp.salaryPeriod ? ` / ${selectedApp.salaryPeriod}` : ''}
                            </span>
                          </div>
                          <div><span className="text-slate-500 block mb-0.5">Salary Period</span><span className="font-medium text-slate-900">{selectedApp.salaryPeriod || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Range informed by</span><span className="font-medium text-slate-900">{selectedApp.salaryRangeSource || '—'}</span></div>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Recruitment Contact</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                          <div>
                            <span className="text-slate-500 block mb-0.5">Recruiting Co.</span>
                            <span className="font-medium text-slate-900 flex items-center gap-1.5">
                              {selectedApp.recruiterCo || '—'}
                              {selectedApp.recruiterCoUrl && (
                                <a href={selectedApp.recruiterCoUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </span>
                          </div>
                          <div><span className="text-slate-500 block mb-0.5">Main Recruiter</span><span className="font-medium text-slate-900">{selectedApp.mainRecruiter || '—'}</span></div>
                          <div className="col-span-2"><span className="text-slate-500 block mb-0.5">Contact</span><span className="font-medium text-slate-900">{selectedApp.recruiterContact || '—'}</span></div>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Dates & Progress</h4>
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
                          <div>
                            <span className="text-slate-500 block mb-0.5">Date Found</span>
                            <span className="font-medium text-slate-900">
                              {selectedApp.dateFound ? format(new Date(selectedApp.dateFound), 'MMM d, yyyy') : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5">Step Date</span>
                            <span className="font-medium text-slate-900">
                              {selectedApp.stepDate ? format(new Date(selectedApp.stepDate), 'MMM d, yyyy') : '—'}
                            </span>
                          </div>
                          <div><span className="text-slate-500 block mb-0.5">Current Step</span><span className="font-medium text-slate-900">{selectedApp.currentStep || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Next Action</span><span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block">{selectedApp.nextAction || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Interview Type</span><span className="font-medium text-slate-900">{selectedApp.interviewType || '—'}</span></div>
                          <div><span className="text-slate-500 block mb-0.5">Current Interviewer</span><span className="font-medium text-slate-900">{selectedApp.currentInterviewer || '—'}</span></div>
                        </div>
                      </section>

                      {(selectedApp.notes || selectedApp.finalFeedback) && (
                        <section>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Notes & Feedback</h4>
                          <div className="space-y-4 text-sm">
                            {selectedApp.currentStepNotes && (
                              <div>
                                <span className="text-slate-500 block mb-1">Current Step Notes</span>
                                <p className="text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-100 whitespace-pre-wrap leading-relaxed">{selectedApp.currentStepNotes}</p>
                              </div>
                            )}
                            {selectedApp.notes && (
                              <div>
                                <span className="text-slate-500 block mb-1">General Notes</span>
                                <p className="text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-100 whitespace-pre-wrap leading-relaxed">{selectedApp.notes}</p>
                              </div>
                            )}
                            {selectedApp.finalFeedback && (
                              <div>
                                <span className="text-slate-500 block mb-1">Final Feedback</span>
                                <p className="text-slate-800 bg-slate-100 p-3 rounded-md border border-slate-200 whitespace-pre-wrap leading-relaxed font-medium">{selectedApp.finalFeedback}</p>
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
                            <TimelineItem 
                                key={idx} 
                                appId={selectedApp.id} 
                                step={step} 
                                idx={idx} 
                                onDelete={handleTimelineDelete} 
                            />
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
