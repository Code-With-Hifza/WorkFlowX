import path from 'path';
import crypto from 'crypto';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const FORBIDDEN_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.php',
  '.vbs',
  '.msi',
  '.com',
  '.scr',
  '.hta',
  '.jar',
]);

export function validateFile(fileSize: number, mimeType: string, fileName: string) {
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error('FILE_TOO_LARGE: Attachment exceeds maximum allowed limit of 10MB.');
  }

  const ext = path.extname(fileName).toLowerCase();
  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    throw new Error(`EXECUTABLE_BLOCKED: Uploading executable file type "${ext}" is strictly forbidden for security reasons.`);
  }

  // Prevent path traversal
  const sanitizedFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueStorageKey = `attachments/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${sanitizedFileName}`;

  return {
    sanitizedFileName,
    uniqueStorageKey,
  };
}
