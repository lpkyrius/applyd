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
          <Button className="bg-slate-950 text-white hover:bg-indigo-600 px-6 h-11 rounded-xl font-bold transition-all duration-300 premium-shadow hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="mr-2 h-5 w-5" strokeWidth={3} /> Add Application
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Application' : 'Edit Application'}</DialogTitle>
        </DialogHeader>
        <ApplicationForm 
          id={id} 
          initData={initData} 
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
