import { db } from '@/db';
import { attachments, tasks, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireTenantPermission } from '@/lib/tenant-context';
import { getStorageAdapter, validateFile } from '@/lib/storage';

export class AttachmentService {
  /**
   * Upload Attachment to Object Storage & Save Database Metadata
   */
  static async uploadAttachment(
    orgIdOrSlug: string,
    taskId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ) {
    const context = await requireTenantPermission(orgIdOrSlug, 'tasks.update');

    // Fetch Task
    const [taskRecord] = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.organizationId, context.organization.id)
        )
      );

    if (!taskRecord) {
      throw new Error('NOT_FOUND: Task not found.');
    }

    // Validate File Security
    const { sanitizedFileName, uniqueStorageKey } = validateFile(
      fileBuffer.length,
      mimeType,
      fileName
    );

    // Upload to Active Storage Driver
    const storage = getStorageAdapter();
    await storage.uploadFile(fileBuffer, uniqueStorageKey, mimeType);

    // Record Attachment metadata
    const [attachmentRecord] = await db
      .insert(attachments)
      .values({
        organizationId: context.organization.id,
        projectId: taskRecord.projectId,
        taskId: taskRecord.id,
        uploaderId: context.user.id,
        fileName: sanitizedFileName,
        fileKey: uniqueStorageKey,
        fileSize: fileBuffer.length,
        mimeType,
      })
      .returning();

    const signedUrl = await storage.getSignedUrl(uniqueStorageKey);

    return {
      ...attachmentRecord,
      downloadUrl: signedUrl,
    };
  }

  /**
   * Get Attachments for Task
   */
  static async getTaskAttachments(orgIdOrSlug: string, taskId: string) {
    const context = await requireTenantPermission(orgIdOrSlug, 'tasks.read');
    const storage = getStorageAdapter();

    const attachmentList = await db
      .select({
        attachment: attachments,
        uploader: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(attachments)
      .innerJoin(users, eq(attachments.uploaderId, users.id))
      .where(
        and(
          eq(attachments.taskId, taskId),
          eq(attachments.organizationId, context.organization.id)
        )
      )
      .orderBy(desc(attachments.createdAt));

    const result = [];
    for (const item of attachmentList) {
      const downloadUrl = await storage.getSignedUrl(item.attachment.fileKey);
      result.push({
        ...item.attachment,
        uploader: item.uploader,
        downloadUrl,
      });
    }

    return result;
  }

  /**
   * Delete Attachment
   */
  static async deleteAttachment(orgIdOrSlug: string, attachmentId: string) {
    const context = await requireTenantPermission(orgIdOrSlug, 'tasks.update');

    const [attachmentRecord] = await db
      .select()
      .from(attachments)
      .where(
        and(
          eq(attachments.id, attachmentId),
          eq(attachments.organizationId, context.organization.id)
        )
      );

    if (!attachmentRecord) {
      throw new Error('NOT_FOUND: Attachment not found.');
    }

    // Delete from Object Storage
    const storage = getStorageAdapter();
    await storage.deleteFile(attachmentRecord.fileKey);

    // Delete Database record
    await db.delete(attachments).where(eq(attachments.id, attachmentId));

    return { success: true };
  }
}
