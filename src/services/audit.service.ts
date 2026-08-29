import { db } from '@/db';
import { activities, auditLogs, users, projects } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireTenantPermission } from '@/lib/tenant-context';

export interface AuditLogInput {
  organizationId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  targetUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  /**
   * Insert Audit Log Entry
   */
  static async logAudit(input: AuditLogInput) {
    const [logEntry] = await db
      .insert(auditLogs)
      .values({
        organizationId: input.organizationId,
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        targetUserId: input.targetUserId || null,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        metadata: input.metadata || null,
      })
      .returning();

    return logEntry;
  }

  /**
   * Get Organization Activity Feed
   */
  static async getOrganizationActivities(
    orgIdOrSlug: string,
    limit: number = 20
  ) {
    const context = await requireTenantPermission(orgIdOrSlug, 'organization.read');

    const activityRecords = await db
      .select({
        activity: activities,
        actor: {
          id: users.id,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(activities)
      .innerJoin(users, eq(activities.actorId, users.id))
      .where(eq(activities.organizationId, context.organization.id))
      .orderBy(desc(activities.createdAt))
      .limit(limit);

    return activityRecords.map((a) => ({
      ...a.activity,
      actor: a.actor,
    }));
  }

  /**
   * Get Organization Compliance Audit Logs (Admin only)
   */
  static async getAuditLogs(orgIdOrSlug: string, page: number = 1, limit: number = 20) {
    const context = await requireTenantPermission(orgIdOrSlug, 'audit_logs.read');
    const offset = (page - 1) * limit;

    const logRecords = await db
      .select({
        auditLog: auditLogs,
        actor: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.actorId, users.id))
      .where(eq(auditLogs.organizationId, context.organization.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(eq(auditLogs.organizationId, context.organization.id));

    return {
      auditLogs: logRecords.map((l) => ({
        ...l.auditLog,
        actor: l.actor,
      })),
      pagination: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }
}
