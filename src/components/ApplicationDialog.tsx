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
  trigger 
}: { 
  mode?: 'create' | 'edit', 
  initData?: Partial<ApplicationFormData>, 
  id?: string,
  trigger?: React.ReactElement 
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={trigger || (
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" /> Add Application
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
