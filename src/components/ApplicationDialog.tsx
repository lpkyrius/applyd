'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ApplicationForm } from './ApplicationForm';
import { Button } from '@/components/ui/button';
import { type ApplicationFormData } from '@/lib/schemas';
import { Plus } from 'lucide-react';

export function ApplicationDialog({ 
  mode = 'create', 
  initData, 
  id,
  trigger,
  nativeButton 
}: { 
  mode?: 'create' | 'edit', 
  initData?: Partial<ApplicationFormData>, 
  id?: string,
  trigger?: React.ReactElement,
  nativeButton?: boolean
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        nativeButton={nativeButton}
        render={trigger || (
          <Button className="bg-slate-950 text-white hover:bg-indigo-600 px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 premium-shadow hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="mr-2 h-4 w-4" strokeWidth={3} /> New Entry
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-slate-200/60 p-0 shadow-2xl">
        <div className="bg-slate-50/50 p-8 border-b border-slate-100 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Management</span>
          </div>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
            {mode === 'create' ? 'Create Application' : 'Refine Application'}
          </DialogTitle>
        </div>
        <div className="p-8">
          <ApplicationForm 
            id={id} 
            initData={initData} 
            onSuccess={() => setOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
