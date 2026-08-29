import { db } from '@/db';
import { notifications, notificationPreferences } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class NotificationService {
  /**
   * Get In-App Notifications for Authenticated User
   */
  static async getUserNotifications(userId: string, limit: number = 20) {
    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return list;
  }

  /**
   * Mark Specific Notification as Read
   */
  static async markAsRead(notificationId: string, userId: string) {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    return updated;
  }

  /**
   * Mark All Notifications as Read
   */
  static async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return { success: true };
  }
}
