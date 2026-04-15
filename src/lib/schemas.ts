import { z } from 'zod'

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Status is required"),
  link: z.string().optional().nullable(),
  grossSalFrom: z.number().optional().nullable(),
  grossSalTo: z.number().optional().nullable(),
  netSalFrom: z.number().optional().nullable(),
  netSalTo: z.number().optional().nullable(),
  salaryCurrency: z.string().optional().nullable(),
  salaryPeriod: z.string().optional().nullable(),
  salaryRangeSource: z.string().optional().nullable(),
  recruiterCo: z.string().optional().nullable(),
  jobType: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  mainRecruiter: z.string().optional().nullable(),
  recruiterContact: z.string().optional().nullable(),
  locationType: z.string().optional().nullable(),
  currentStep: z.string().optional().nullable(),
  nextAction: z.string().optional().nullable(),
  currentInterviewer: z.string().optional().nullable(),
  interviewType: z.string().optional().nullable(),
  currentStepNotes: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  finalFeedback: z.string().optional().nullable(),
  applicationDate: z.union([z.string(), z.date()]).optional().nullable(),
  stepDate: z.union([z.string(), z.date()]).optional().nullable(),
  deadline: z.union([z.string(), z.date()]).optional().nullable()
})

export type ApplicationFormData = z.infer<typeof applicationSchema>
