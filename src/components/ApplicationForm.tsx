'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, type ApplicationFormData } from '@/lib/schemas';
import { saveApplication } from '@/lib/actions';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const STATUS_OPTIONS = [
  'Applied', 'Screening', 'Interview', 'Technical Interview', 'Final Interview',
  'Offer', 'Negotiating', 'Accepted', 'Rejected', 'Withdrawn', 'On Hold', 'Closed'
];

const JOB_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const LOCATION_OPTIONS = ['Remote', 'Hybrid', 'On-site'];
const PERIOD_OPTIONS = ['hour', 'day', 'month', 'year'];
const RANGE_SOURCE_OPTIONS = ['Company', 'Me', 'Research', 'Other'];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-1 col-span-2">
      {children}
    </h3>
  );
}

function FieldInput({ field, label, placeholder, type = 'text' }: any) {
  return (
    <FormItem>
      <FormLabel className="text-xs text-slate-500 font-medium">{label}</FormLabel>
      <FormControl>
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          value={field.value ?? ''}
          className="h-9 text-sm"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

function FieldSelect({ field, label, options }: any) {
  return (
    <FormItem>
      <FormLabel className="text-xs text-slate-500 font-medium">{label}</FormLabel>
      <FormControl>
        <select
          {...field}
          value={field.value ?? ''}
          className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— Select —</option>
          {options.map((o: string) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

function FieldTextarea({ field, label, placeholder }: any) {
  return (
    <FormItem className="col-span-2">
      <FormLabel className="text-xs text-slate-500 font-medium">{label}</FormLabel>
      <FormControl>
        <textarea
          {...field}
          placeholder={placeholder}
          value={field.value ?? ''}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export function ApplicationForm({ initData, id, onSuccess }: {
  initData?: Partial<ApplicationFormData>,
  id?: string,
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: initData?.company || '',
      role: initData?.role || '',
      status: initData?.status || 'Applied',
      link: initData?.link || '',
      locationType: initData?.locationType || '',
      jobType: initData?.jobType || '',
      duration: initData?.duration || '',
      grossSalFrom: initData?.grossSalFrom || 0,
      grossSalTo: initData?.grossSalTo || 0,
      netSalFrom: initData?.netSalFrom || 0,
      netSalTo: initData?.netSalTo || 0,
      salaryCurrency: initData?.salaryCurrency || 'EUR',
      salaryPeriod: initData?.salaryPeriod || 'month',
      salaryRangeSource: initData?.salaryRangeSource || '',
      recruiterCo: initData?.recruiterCo || '',
      mainRecruiter: initData?.mainRecruiter || '',
      recruiterContact: initData?.recruiterContact || '',
      applicationDate: initData?.applicationDate ? format(new Date(initData.applicationDate), 'yyyy-MM-dd') : '',
      deadline: initData?.deadline ? format(new Date(initData.deadline), 'yyyy-MM-dd') : '',
      currentStep: initData?.currentStep || '',
      nextAction: initData?.nextAction || '',
      currentInterviewer: initData?.currentInterviewer || '',
      interviewType: initData?.interviewType || '',
      currentStepNotes: initData?.currentStepNotes || '',
      notes: initData?.notes || '',
      finalFeedback: initData?.finalFeedback || '',
    }
  });

  const onSubmit = (data: ApplicationFormData) => {
    startTransition(async () => {
      const res = await saveApplication(data, id);
      if (res.success) {
        onSuccess();
      } else {
        alert("Failed to save: " + res.error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">

          <SectionTitle>Core Info</SectionTitle>
          <FormField control={form.control} name="company" render={({ field }) => (
            <FieldInput field={field} label="Company *" placeholder="Acme Corp" />
          )} />
          <FormField control={form.control} name="role" render={({ field }) => (
            <FieldInput field={field} label="Role *" placeholder="Senior Engineer" />
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FieldSelect field={field} label="Status *" options={STATUS_OPTIONS} />
          )} />
          <FormField control={form.control} name="link" render={({ field }) => (
            <FieldInput field={field} label="Job Post URL" placeholder="https://..." />
          )} />
          <FormField control={form.control} name="locationType" render={({ field }) => (
            <FieldSelect field={field} label="Location Type" options={LOCATION_OPTIONS} />
          )} />
          <FormField control={form.control} name="jobType" render={({ field }) => (
            <FieldSelect field={field} label="Job Type" options={JOB_TYPE_OPTIONS} />
          )} />
          <FormField control={form.control} name="duration" render={({ field }) => (
            <FieldInput field={field} label="Duration" placeholder="e.g. Permanent, 6 months" />
          )} />

          <SectionTitle>Compensation</SectionTitle>
          <FormField control={form.control} name="salaryCurrency" render={({ field }) => (
            <FieldInput field={field} label="Currency" placeholder="EUR, USD, GBP..." />
          )} />
          
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="grossSalFrom" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-slate-500 font-medium">Gross From</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? 0} type="number" placeholder="From" className="h-9 text-sm" onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="grossSalTo" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-slate-500 font-medium">Gross To</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? 0} type="number" placeholder="To" className="h-9 text-sm" onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
                </FormControl>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="netSalFrom" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-slate-500 font-medium">Net From</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? 0} type="number" placeholder="From" className="h-9 text-sm" onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="netSalTo" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-slate-500 font-medium">Net To</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? 0} type="number" placeholder="To" className="h-9 text-sm" onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
                </FormControl>
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="salaryPeriod" render={({ field }) => (
            <FieldSelect field={field} label="Salary Period *" options={PERIOD_OPTIONS} />
          )} />
          <FormField control={form.control} name="salaryRangeSource" render={({ field }) => (
            <FieldSelect field={field} label="Range informed by" options={RANGE_SOURCE_OPTIONS} />
          )} />

          <SectionTitle>Recruitment</SectionTitle>
          <FormField control={form.control} name="recruiterCo" render={({ field }) => (
            <FieldInput field={field} label="Recruiter Company" placeholder="Acme Recruitment" />
          )} />
          <FormField control={form.control} name="mainRecruiter" render={({ field }) => (
            <FieldInput field={field} label="Recruiter Name" placeholder="Jane Smith" />
          )} />
          <FormField control={form.control} name="recruiterContact" render={({ field }) => (
            <FieldInput field={field} label="Recruiter Contact" placeholder="jane@acme.com" />
          )} />

          <SectionTitle>Dates</SectionTitle>
          <FormField control={form.control} name="applicationDate" render={({ field }) => (
            <FieldInput field={field} label="Application Date" type="date" />
          )} />
          <FormField control={form.control} name="deadline" render={({ field }) => (
            <FieldInput field={field} label="Deadline" type="date" />
          )} />

          <SectionTitle>Current Status</SectionTitle>
          <FormField control={form.control} name="currentStep" render={({ field }) => (
            <FieldInput field={field} label="Current Step" placeholder="Screening" />
          )} />
          <FormField control={form.control} name="nextAction" render={({ field }) => (
            <FieldInput field={field} label="Next Action" placeholder="Follow-up on Thursday" />
          )} />
          <FormField control={form.control} name="currentInterviewer" render={({ field }) => (
            <FieldInput field={field} label="Current Interviewer" placeholder="John Doe" />
          )} />
          <FormField control={form.control} name="interviewType" render={({ field }) => (
            <FieldInput field={field} label="Interview Type" placeholder="Technical, Behavioural…" />
          )} />
          <FormField control={form.control} name="currentStepNotes" render={({ field }) => (
            <FieldTextarea field={field} label="Step Notes" placeholder="Notes about the current step…" />
          )} />

          <SectionTitle>Notes & Feedback</SectionTitle>
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FieldTextarea field={field} label="General Notes" placeholder="Any general observations…" />
          )} />
          <FormField control={form.control} name="finalFeedback" render={({ field }) => (
            <FieldTextarea field={field} label="Final Feedback" placeholder="Outcome feedback from employer…" />
          )} />

        </div>

        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={isPending}>
          {isPending ? 'Saving…' : id ? 'Update Application' : 'Create Application'}
        </Button>
      </form>
    </Form>
  );
}
