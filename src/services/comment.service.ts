import { db } from '@/db';
import {
  comments,
  commentMentions,
  users,
  tasks,
  notifications,
  activities,
} from '@/db/schema';
import { eq, and, desc, or, like } from 'drizzle-orm';
import { requireTenantPermission } from '@/lib/tenant-context';

export class CommentService {
  /**
   * Create Task Comment & Parse Mentions
   */
  static async createComment(
    orgIdOrSlug: string,
    taskId: string,
    content: string
  ) {
    const context = await requireTenantPermission(orgIdOrSlug, 'tasks.read');

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

    const [newComment] = await db
      .insert(comments)
      .values({
        taskId,
        authorId: context.user.id,
        content,
      })
      .returning();

    // Parse @mentions
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const matches = Array.from(content.matchAll(mentionRegex), (m) => m[1]);

    if (matches.length > 0) {
      const mentionedUsers = await db
        .select()
        .from(users)
        .where(
          or(...matches.map((m) => like(users.fullName, `%${m}%`)))!
        );

      for (const mUser of mentionedUsers) {
        if (mUser.id !== context.user.id) {
          await db.insert(commentMentions).values({
            commentId: newComment.id,
            userId: mUser.id,
          });

          await db.insert(notifications).values({
            userId: mUser.id,
            organizationId: context.organization.id,
            type: 'TASK_MENTIONED',
            title: 'You were mentioned in a comment',
            message: `${context.user.fullName} mentioned you in task "${taskRecord.title}"`,
            entityType: 'task',
            entityId: taskRecord.id,
          });
        }
      }
    }

    // Log Activity
    await db.insert(activities).values({
      organizationId: context.organization.id,
      projectId: taskRecord.projectId,
      actorId: context.user.id,
      action: 'COMMENT_CREATED',
      entityType: 'comment',
      entityId: newComment.id,
      description: `${context.user.fullName} commented on "${taskRecord.title}"`,
    });

    return newComment;
  }

  /**
   * Get Comments for Task
   */
  static async getTaskComments(orgIdOrSlug: string, taskId: string) {
    const context = await requireTenantPermission(orgIdOrSlug, 'tasks.read');

    const commentList = await db
      .select({
        comment: comments,
        author: {
          id: users.id,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          email: users.email,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.taskId, taskId))
      .orderBy(desc(comments.createdAt));

    return commentList.map((c) => ({
      ...c.comment,
      author: c.author,
    }));
  }
}
