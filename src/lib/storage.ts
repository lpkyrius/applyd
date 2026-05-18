import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Resolves the directory where the SQLite database is located
 * by parsing the DATABASE_URL environment variable.
 */
export function getStorageDir(): string {
  const dbUrl = process.env.DATABASE_URL;
  let dbFolder: string;

  if (dbUrl && dbUrl.startsWith('file:')) {
    const dbPath = dbUrl.replace(/^file:/, '');
    if (path.isAbsolute(dbPath)) {
      dbFolder = path.dirname(dbPath);
    } else {
      // Relative paths in prisma are resolved from prisma directory
      dbFolder = path.resolve(process.cwd(), 'prisma', path.dirname(dbPath));
    }
  } else {
    // Default fallback to project root /prisma folder
    dbFolder = path.join(process.cwd(), 'prisma');
  }

  const attachmentsFolder = path.join(dbFolder, 'attachments');
  
  if (!fs.existsSync(attachmentsFolder)) {
    fs.mkdirSync(attachmentsFolder, { recursive: true });
  }

  return attachmentsFolder;
}

/**
 * Saves a file attachment to the attachments directory and returns its metadata path.
 */
export async function saveAttachment(file: File): Promise<{ relativePath: string; fileName: string }> {
  const storageDir = getStorageDir();
  const fileExtension = path.extname(file.name);
  const uniqueId = crypto.randomUUID();
  const uniqueFileName = `${uniqueId}${fileExtension}`;
  const absolutePath = path.join(storageDir, uniqueFileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(absolutePath, buffer);

  return {
    relativePath: `attachments/${uniqueFileName}`,
    fileName: file.name,
  };
}

/**
 * Deletes a physical file attachment based on its stored relative path.
 */
export async function deleteAttachmentFile(relativePath: string): Promise<boolean> {
  try {
    const storageDir = getStorageDir();
    const fileName = path.basename(relativePath);
    const absolutePath = path.join(storageDir, fileName);

    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
      return true;
    }
  } catch (error) {
    console.error('Failed to delete physical file:', error);
  }
  return false;
}
