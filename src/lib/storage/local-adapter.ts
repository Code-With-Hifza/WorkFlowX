import fs from 'fs/promises';
import path from 'path';
import { StorageAdapter } from './types';

export class LocalStorageAdapter implements StorageAdapter {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (err) {
      // Directory exists
    }
  }

  async uploadFile(file: Buffer, key: string, mimeType: string): Promise<string> {
    await this.ensureDir();
    const filePath = path.join(this.uploadsDir, path.basename(key));
    await fs.writeFile(filePath, file);
    return `/uploads/${path.basename(key)}`;
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, path.basename(key));
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // File may not exist
    }
  }

  async getSignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    return `/uploads/${path.basename(key)}`;
  }
}
