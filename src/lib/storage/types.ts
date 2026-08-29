export interface StorageAdapter {
  uploadFile(file: Buffer, key: string, mimeType: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
