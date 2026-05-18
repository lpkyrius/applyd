'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'
import { applicationSchema, type ApplicationFormData } from './schemas'
import { saveAttachment, deleteAttachmentFile } from './storage'

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

    let returnedId = id;

    if (id) {
      await prisma.application.update({
        where: { id },
        data: payload as any
      });
    } else {
      const created = await prisma.application.create({
        data: {
          ...payload,
          steps: JSON.stringify([{ type: 'CONTACT', isStep: false, date: new Date(), description: 'Application recorded manually.' }])
        } as any
      });
      returnedId = created.id;
    }

    revalidatePath('/');
    revalidatePath('/applications');
    return { success: true, id: returnedId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteApplication(id: string) {
  try {
    await prisma.application.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/applications');
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

    // Sort existing steps to ensure index consistency
    steps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    steps.unshift({
      type: entry.type,
      isStep: entry.type === 'STEP',
      date: new Date(entry.date).toISOString(),
      description: entry.description,
    });

    // Sort again after adding new entry
    steps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await prisma.application.update({
      where: { id: appId },
      data: { steps: JSON.stringify(steps) }
    });

    revalidatePath('/');
    revalidatePath('/applications');
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

    // Ensure sorted order before deleting by index
    steps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    steps.splice(index, 1);

    await prisma.application.update({
      where: { id: appId },
      data: { steps: JSON.stringify(steps) }
    });

    revalidatePath('/');
    revalidatePath('/applications');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
export async function updateTimelineEntry(
  appId: string,
  index: number,
  entry: { type: 'STEP' | 'CONTACT'; date: string; description: string }
) {
  try {
    const app = await prisma.application.findUnique({ where: { id: appId } });
    if (!app) return { success: false, error: 'Not found' };

    let steps: any[] = [];
    try { steps = JSON.parse(app.steps as string || '[]'); } catch {}

    // Ensure sorted order before updating by index
    steps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (steps[index]) {
      steps[index] = {
        ...steps[index],
        type: entry.type,
        isStep: entry.type === 'STEP',
        date: new Date(entry.date).toISOString(),
        description: entry.description,
      };
    }
    
    // Re-sort in case date was changed
    steps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await prisma.application.update({
      where: { id: appId },
      data: { steps: JSON.stringify(steps) }
    });

    revalidatePath('/');
    revalidatePath('/applications');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleFavorite(appId: string, isFavorite: boolean) {
  try {
    await prisma.application.update({
      where: { id: appId },
      data: { isFavorite }
    });
    revalidatePath('/');
    revalidatePath('/applications');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function uploadAttachment(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const id = formData.get('id') as string | null;

    if (!id) {
      return { success: false, error: 'Application ID is required' };
    }

    if (!file || file.size === 0) {
      return { success: false, error: 'No file uploaded or file is empty' };
    }

    // Get current application to check for existing attachment to delete
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      return { success: false, error: 'Application not found' };
    }

    // Save new file
    const { relativePath, fileName } = await saveAttachment(file);

    // Delete old attachment if there was one
    if (app.attachmentPath) {
      await deleteAttachmentFile(app.attachmentPath);
    }

    // Update database
    await prisma.application.update({
      where: { id },
      data: {
        attachmentPath: relativePath,
        attachmentName: fileName,
      },
    });

    revalidatePath('/');
    revalidatePath('/applications');
    return { success: true, attachmentPath: relativePath, attachmentName: fileName };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAttachment(id: string) {
  try {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      return { success: false, error: 'Application not found' };
    }

    if (app.attachmentPath) {
      await deleteAttachmentFile(app.attachmentPath);
    }

    await prisma.application.update({
      where: { id },
      data: {
        attachmentPath: null,
        attachmentName: null,
      },
    });

    revalidatePath('/');
    revalidatePath('/applications');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
