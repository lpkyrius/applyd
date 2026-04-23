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
const INITIATOR_OPTIONS = ['Candidate', 'Recruiter', 'Company', 'Referral'];
const FEEL_OPTIONS = ['😊', '😃', '😐', '🙁', '❌'];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-6 mb-2 col-span-2 flex items-center gap-3 after:h-px after:flex-1 after:bg-slate-100">
      {children}
    </h3>
  );
}

function FieldInput({ field, label, placeholder, type = 'text' }: any) {
  return (
    <FormItem className="space-y-1.5">
      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</FormLabel>
      <FormControl>
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          value={field.value ?? ''}
          className="h-12 text-sm rounded-md border-slate-100 bg-slate-50/30 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/5 transition-all focus:bg-white"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

function FieldSelect({ field, label, options }: any) {
  return (
    <FormItem className="space-y-1.5">
      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</FormLabel>
      <FormControl>
        <select
          {...field}
          value={field.value ?? ''}
          className="h-12 w-full rounded-md border border-slate-100 bg-slate-50/30 px-4 py-1 text-sm transition-all focus:outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 appearance-none focus:bg-white"
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
    <FormItem className="col-span-2 space-y-1.5">
      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</FormLabel>
      <FormControl>
        <textarea
          {...field}
          placeholder={placeholder}
          value={field.value ?? ''}
          rows={4}
          className="w-full rounded-md border border-slate-100 bg-slate-50/30 px-4 py-3 text-sm transition-all focus:outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5 resize-none focus:bg-white"
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
      company: initData?.company || '#NotInformed',
      companyUrl: initData?.companyUrl || '',
      role: initData?.role || '#NotInformed',
      status: initData?.status || 'Applied',
      name: initData?.name || '',
      initiator: initData?.initiator || 'Recruiter',
      feel: initData?.feel || '😊',
      link: initData?.link || '',
      locationType: initData?.locationType || '',
      jobType: initData?.jobType || '',
      duration: initData?.duration || '',
      companyLocation: initData?.companyLocation || '',
      grossSalFrom: initData?.grossSalFrom || 0,
      grossSalTo: initData?.grossSalTo || 0,
      netSalFrom: initData?.netSalFrom || 0,
      netSalTo: initData?.netSalTo || 0,
      salaryCurrency: initData?.salaryCurrency || 'EUR',
      salaryPeriod: initData?.salaryPeriod || 'month',
      salaryRangeSource: initData?.salaryRangeSource || '',
      recruiterCo: initData?.recruiterCo || '',
      recruiterCoUrl: initData?.recruiterCoUrl || '',
      mainRecruiter: initData?.mainRecruiter || '',
      recruiterContact: initData?.recruiterContact || '',
      applicationDate: initData?.applicationDate 
        ? format(new Date(initData.applicationDate), 'yyyy-MM-dd') 
        : format(new Date(), 'yyyy-MM-dd'),
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
          <FormField control={form.control} name="companyUrl" render={({ field }) => (
            <FieldInput field={field} label="Company Website" placeholder="https://..." />
          )} />
          <FormField control={form.control} name="role" render={({ field }) => (
            <FieldInput field={field} label="Role *" placeholder="Senior Engineer" />
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FieldSelect field={field} label="Status *" options={STATUS_OPTIONS} />
          )} />
          <FormField control={form.control} name="name" render={({ field }) => (
            <FieldInput field={field} label="Candidate Name" placeholder="Leandro" />
          )} />
          <FormField control={form.control} name="initiator" render={({ field }) => (
            <FieldSelect field={field} label="Initiator" options={INITIATOR_OPTIONS} />
          )} />
          <FormField control={form.control} name="feel" render={({ field }) => (
            <FieldSelect field={field} label="Feel / Mood" options={FEEL_OPTIONS} />
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
          <FormField control={form.control} name="companyLocation" render={({ field }) => (
            <FieldInput field={field} label="Company Location" placeholder="e.g. Amsterdam, Holland" />
          )} />

          <SectionTitle>Compensation</SectionTitle>
          <FormField control={form.control} name="salaryCurrency" render={({ field }) => (
            <FieldInput field={field} label="Currency" placeholder="EUR, USD, GBP..." />
          )} />
          
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="grossSalFrom" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Gross From</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? 0} type="number" placeholder="From" className="h-12 text-sm rounded-md border-slate-100 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/5 bg-slate-50/30 focus:bg-white" onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="grossSalTo" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Gross To</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? 0} type="number" placeholder="To" className="h-12 text-sm rounded-md border-slate-100 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/5 bg-slate-50/30 focus:bg-white" onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
                </FormControl>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="netSalFrom" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Net From</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? 0} type="number" placeholder="From" className="h-11 text-sm rounded-xl border-slate-200 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/10 bg-white/50 focus:bg-white" onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="netSalTo" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Net To</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? 0} type="number" placeholder="To" className="h-11 text-sm rounded-xl border-slate-200 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/10 bg-white/50 focus:bg-white" onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
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
          <FormField control={form.control} name="recruiterCoUrl" render={({ field }) => (
            <FieldInput field={field} label="Recruiter Co. Website" placeholder="https://..." />
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

        <Button 
          type="submit" 
          className="w-full h-14 bg-slate-950 hover:bg-[#8B5CF6] text-white rounded-md font-bold transition-all duration-500 shadow-xl shadow-slate-900/10 hover:scale-[1.01] active:scale-[0.99] mt-10" 
          disabled={isPending}
        >
          {isPending ? 'Saving…' : id ? 'Update Application' : 'Create Application'}
        </Button>
      </form>
    </Form>
  );
}
