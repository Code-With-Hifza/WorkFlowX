import { db } from '@/db';
import {
  projects,
  tasks,
  organizationMembers,
  users,
} from '@/db/schema';
import { eq, and, sql, gte, lt } from 'drizzle-orm';
import { requireTenantPermission } from '@/lib/tenant-context';

export class AnalyticsService {
  /**
   * Get Organization Analytics Overview & Charts Data
   */
  static async getOrganizationAnalytics(orgIdOrSlug: string) {
    const context = await requireTenantPermission(orgIdOrSlug, 'analytics.read');
    const orgId = context.organization.id;

    // 1. Projects Count
    const [{ totalProjects }] = await db
      .select({ totalProjects: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.organizationId, orgId));

    const [{ activeProjects }] = await db
      .select({ activeProjects: sql<number>`count(*)` })
      .from(projects)
      .where(and(eq(projects.organizationId, orgId), eq(projects.status, 'active')));

    // 2. Tasks Summary
    const [{ totalTasks }] = await db
      .select({ totalTasks: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.organizationId, orgId));

    const [{ completedTasks }] = await db
      .select({ completedTasks: sql<number>`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.organizationId, orgId), eq(tasks.status, 'done')));

    const [{ overdueTasks }] = await db
      .select({ overdueTasks: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.organizationId, orgId),
          lt(tasks.dueDate, new Date()),
          sql`${tasks.status} != 'done'`
        )
      );

    const completionRate =
      Number(totalTasks) > 0
        ? Math.round((Number(completedTasks) / Number(totalTasks)) * 100)
        : 0;

    // 3. Tasks Distribution by Status
    const tasksByStatus = await db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)`,
      })
      .from(tasks)
      .where(eq(tasks.organizationId, orgId))
      .groupBy(tasks.status);

    // 4. Tasks Distribution by Priority
    const tasksByPriority = await db
      .select({
        priority: tasks.priority,
        count: sql<number>`count(*)`,
      })
      .from(tasks)
      .where(eq(tasks.organizationId, orgId))
      .groupBy(tasks.priority);

    // 5. Team Members Productivity
    const teamProductivity = await db
      .select({
        memberId: users.id,
        memberName: users.fullName,
        assignedTasks: sql<number>`count(${tasks.id})`,
        completedTasks: sql<number>`count(CASE WHEN ${tasks.status} = 'done' THEN 1 END)`,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .leftJoin(tasks, and(eq(tasks.assigneeId, users.id), eq(tasks.organizationId, orgId)))
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.status, 'active')
        )
      )
      .groupBy(users.id, users.fullName);

    return {
      kpi: {
        totalProjects: Number(totalProjects),
        activeProjects: Number(activeProjects),
        totalTasks: Number(totalTasks),
        completedTasks: Number(completedTasks),
        remainingTasks: Number(totalTasks) - Number(completedTasks),
        overdueTasks: Number(overdueTasks),
        completionRate,
      },
      charts: {
        tasksByStatus: tasksByStatus.map((s) => ({
          status: s.status.replace('_', ' ').toUpperCase(),
          count: Number(s.count),
        })),
        tasksByPriority: tasksByPriority.map((p) => ({
          priority: p.priority.toUpperCase(),
          count: Number(p.count),
        })),
        teamProductivity: teamProductivity.map((t) => ({
          name: t.memberName,
          assigned: Number(t.assignedTasks),
          completed: Number(t.completedTasks),
        })),
      },
    };
  }
}
