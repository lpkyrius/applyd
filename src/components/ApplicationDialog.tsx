'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ApplicationForm } from './ApplicationForm';
import { Button } from '@/components/ui/button';
import { type ApplicationFormData } from '@/lib/schemas';
import { Plus, X } from 'lucide-react';

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
          <Button className="bg-slate-950 text-white hover:bg-[#8B5CF6] px-10 h-14 rounded-md font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl shadow-purple-500/10 hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="mr-3 h-5 w-5" strokeWidth={3} /> New Entry
          </Button>
        )}
      />
      <DialogContent showCloseButton={false} className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto rounded-xl border-none p-0 shadow-[0_20px_70px_rgba(0,0,0,0.15)] bg-white">
        <div className="bg-slate-50/40 p-10 border-b border-slate-100/60 backdrop-blur-xl sticky top-0 z-20 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-1 h-3.5 bg-[#8B5CF6] rounded-full" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Management</span>
            </div>
            <DialogTitle className="text-4xl font-black text-slate-900 tracking-tight">
              {mode === 'create' ? 'Create Application' : 'Refine Application'}
            </DialogTitle>
          </div>
          <DialogClose render={
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-400 hover:text-slate-900 shrink-0 mt-1">
              <X size={20} strokeWidth={3} />
            </Button>
          } />
        </div>
        <div className="p-10">
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
