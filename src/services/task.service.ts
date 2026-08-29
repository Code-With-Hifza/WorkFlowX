import { db } from '@/db';
import {
  tasks,
  subtasks,
  labels,
  taskLabels,
  users,
  projects,
} from '@/db/schema';
import { eq, and, like, or, sql, desc, asc, inArray } from 'drizzle-orm';
import { requireTenantPermission } from '@/lib/tenant-context';

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  labelIds?: string[];
}

export interface GetTasksQuery {
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  labelId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'due_date' | 'priority' | 'position';
}

export class TaskService {
  /**
   * Create Task
   */
  static async createTask(orgIdOrSlug: string, input: CreateTaskInput) {
    const context = await requireTenantPermission(orgIdOrSlug, 'tasks.create');

    // Resolve max position index for task column status
    const taskStatus = input.status || 'todo';
    const [maxPos] = await db
      .select({
        max: sql<number>`COALESCE(MAX(position), 0)`,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.organizationId, context.organization.id),
          eq(tasks.projectId, input.projectId),
          eq(tasks.status, taskStatus)
        )
      );

    const position = Number(maxPos?.max || 0) + 1;

    const [newTask] = await db
      .insert(tasks)
      .values({
        organizationId: context.organization.id,
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        status: taskStatus,
        priority: input.priority || 'medium',
        creatorId: context.user.id,
        assigneeId: input.assigneeId || null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        estimatedHours: input.estimatedHours || 0,
        actualHours: input.actualHours || 0,
        position,
      })
      .returning();

    // Assign Labels
    if (input.labelIds && input.labelIds.length > 0) {
      await db.insert(taskLabels).values(
        input.labelIds.map((labelId) => ({
          taskId: newTask.id,
          labelId,
        }))
      );
    }

    return newTask;
  }

  /**
   * Get Tasks for Organization / Project with filtering and pagination
   */
  static async getTasks(orgIdOrSlug: string, query: GetTasksQuery = {}) {
    const context = await requireTenantPermission(orgIdOrSlug, 'tasks.read');

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(tasks.organizationId, context.organization.id)];

    if (query.projectId) {
      conditions.push(eq(tasks.projectId, query.projectId));
    }

    if (query.status) {
      conditions.push(eq(tasks.status, query.status as any));
    }

    if (query.priority) {
      conditions.push(eq(tasks.priority, query.priority as any));
    }

    if (query.assigneeId) {
      conditions.push(eq(tasks.assigneeId, query.assigneeId));
    }

    if (query.search) {
      conditions.push(
        or(
          like(tasks.title, `%${query.search}%`),
          like(tasks.description, `%${query.search}%`)
        )!
      );
    }

    let orderBy = asc(tasks.position);
    if (query.sortBy === 'newest') orderBy = desc(tasks.createdAt);
    if (query.sortBy === 'oldest') orderBy = asc(tasks.createdAt);
    if (query.sortBy === 'due_date') orderBy = asc(tasks.dueDate);
    if (query.sortBy === 'priority') orderBy = desc(tasks.priority);

    const taskRecords = await db
      .select({
        task: tasks,
        projectName: projects.name,
        projectSlug: projects.slug,
        creatorName: users.fullName,
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .innerJoin(users, eq(tasks.creatorId, users.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Fetch Subtasks progress and Assignee information
    const taskIds = taskRecords.map((t) => t.task.id);
    let subtaskCountsMap = new Map<string, { total: number; completed: number }>();

    if (taskIds.length > 0) {
      const subtaskRecords = await db
        .select({
          taskId: subtasks.taskId,
          isCompleted: subtasks.isCompleted,
        })
        .from(subtasks)
        .where(inArray(subtasks.taskId, taskIds));

      for (const st of subtaskRecords) {
        const curr = subtaskCountsMap.get(st.taskId) || { total: 0, completed: 0 };
        curr.total += 1;
        if (st.isCompleted) curr.completed += 1;
        subtaskCountsMap.set(st.taskId, curr);
      }
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(...conditions));

    return {
      tasks: taskRecords.map((t) => {
        const st = subtaskCountsMap.get(t.task.id) || { total: 0, completed: 0 };
        return {
          ...t.task,
          project: {
            name: t.projectName,
            slug: t.projectSlug,
          },
          subtasksProgress: `${st.completed} / ${st.total} completed`,
          subtasksTotal: st.total,
          subtasksCompleted: st.completed,
        };
      }),
      pagination: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  /**
   * Update Task
   */
  static async updateTask(
    orgIdOrSlug: string,
    taskId: string,
    updates: Partial<CreateTaskInput> & { position?: number }
  ) {
    const context = await requireTenantPermission(orgIdOrSlug, 'tasks.update');

    const [updated] = await db
      .update(tasks)
      .set({
        ...updates,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.organizationId, context.organization.id)
        )
      )
      .returning();

    return updated;
  }

  /**
   * Delete Task
   */
  static async deleteTask(orgIdOrSlug: string, taskId: string) {
    const context = await requireTenantPermission(orgIdOrSlug, 'tasks.delete');

    await db
      .delete(tasks)
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.organizationId, context.organization.id)
        )
      );

    return { success: true };
  }

  /**
   * Subtasks Management
   */
  static async createSubtask(taskId: string, title: string) {
    const [subtask] = await db
      .insert(subtasks)
      .values({
        taskId,
        title,
        isCompleted: false,
      })
      .returning();

    return subtask;
  }

  static async toggleSubtask(subtaskId: string, isCompleted: boolean) {
    const [updated] = await db
      .update(subtasks)
      .set({ isCompleted, updatedAt: new Date() })
      .where(eq(subtasks.id, subtaskId))
      .returning();

    return updated;
  }
}
