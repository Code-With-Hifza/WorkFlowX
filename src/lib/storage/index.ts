import { StorageAdapter } from './types';
import { LocalStorageAdapter } from './local-adapter';
import { S3StorageAdapter } from './s3-adapter';

let activeStorageAdapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!activeStorageAdapter) {
    const driver = process.env.STORAGE_DRIVER || 'local';
    if (driver === 's3') {
      activeStorageAdapter = new S3StorageAdapter();
    } else {
      activeStorageAdapter = new LocalStorageAdapter();
    }
  }
  return activeStorageAdapter;
}

export * from './types';
export * from './file-validation';
