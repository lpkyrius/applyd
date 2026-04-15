'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'
import { applicationSchema, type ApplicationFormData } from './schemas'

export async function saveApplication(data: ApplicationFormData, id?: string) {
  const result = applicationSchema.safeParse(data);
  if (!result.success) return { success: false, error: result.error.issues[0]?.message };

  try {
    const payload = {
      ...result.data,
      applicationDate: result.data.applicationDate ? new Date(result.data.applicationDate) : null,
      stepDate: result.data.stepDate ? new Date(result.data.stepDate) : null,
      deadline: result.data.deadline ? new Date(result.data.deadline) : null,
    };

    if (id) {
      await prisma.application.update({
        where: { id },
        data: payload as any
      });
    } else {
      await prisma.application.create({
        data: {
          ...payload,
          steps: JSON.stringify([{ type: 'STEP', isStep: true, date: new Date(), description: 'Application recorded manually.' }])
        } as any
      });
    }

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteApplication(id: string) {
  try {
    await prisma.application.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addTimelineEntry(
  appId: string,
  entry: { type: 'STEP' | 'CONTACT'; date: string; description: string }
) {
  try {
    const app = await prisma.application.findUnique({ where: { id: appId } });
    if (!app) return { success: false, error: 'Not found' };

    let steps: any[] = [];
    try { steps = JSON.parse(app.steps as string || '[]'); } catch {}

    steps.unshift({
      type: entry.type,
      isStep: entry.type === 'STEP',
      date: new Date(entry.date).toISOString(),
      description: entry.description,
    });

    await prisma.application.update({
      where: { id: appId },
      data: { steps: JSON.stringify(steps) }
    });

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteTimelineEntry(appId: string, index: number) {
  try {
    const app = await prisma.application.findUnique({ where: { id: appId } });
    if (!app) return { success: false, error: 'Not found' };

    let steps: any[] = [];
    try { steps = JSON.parse(app.steps as string || '[]'); } catch {}

    steps.splice(index, 1);

    await prisma.application.update({
      where: { id: appId },
      data: { steps: JSON.stringify(steps) }
    });

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
