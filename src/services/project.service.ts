import { db } from '@/db';
import {
  projects,
  projectMembers,
  organizations,
  users,
  tasks,
} from '@/db/schema';
import { eq, and, like, or, sql, desc, asc } from 'drizzle-orm';
import { requireTenantMember, requireTenantPermission } from '@/lib/tenant-context';

export interface CreateProjectInput {
  name: string;
  slug: string;
  description?: string;
  status?: 'planning' | 'active' | 'completed' | 'archived';
  visibility?: 'private' | 'organization';
  startDate?: string;
  dueDate?: string;
}

export interface GetProjectsQuery {
  search?: string;
  status?: string;
  visibility?: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'alphabetical' | 'due_date';
}

export class ProjectService {
  /**
   * Create Project
   */
  static async createProject(orgIdOrSlug: string, input: CreateProjectInput) {
    const context = await requireTenantPermission(
      orgIdOrSlug,
      'projects.create'
    );

    // Verify slug uniqueness within organization
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.organizationId, context.organization.id),
          eq(projects.slug, input.slug)
        )
      );

    if (existing.length > 0) {
      throw new Error('SLUG_TAKEN: A project with this slug already exists in this organization.');
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        organizationId: context.organization.id,
        name: input.name,
        slug: input.slug,
        description: input.description,
        status: input.status || 'active',
        visibility: input.visibility || 'organization',
        ownerId: context.user.id,
        startDate: input.startDate ? new Date(input.startDate) : null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      })
      .returning();

    // Assign Creator as Project Owner
    await db.insert(projectMembers).values({
      projectId: newProject.id,
      userId: context.user.id,
      role: 'owner',
    });

    return newProject;
  }

  /**
   * Get Projects for Organization with filtering, search, and pagination
   */
  static async getProjects(orgIdOrSlug: string, query: GetProjectsQuery = {}) {
    const context = await requireTenantPermission(orgIdOrSlug, 'projects.read');

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(projects.organizationId, context.organization.id)];

    if (query.status) {
      conditions.push(eq(projects.status, query.status as any));
    }

    if (query.visibility) {
      conditions.push(eq(projects.visibility, query.visibility as any));
    }

    if (query.search) {
      conditions.push(
        or(
          like(projects.name, `%${query.search}%`),
          like(projects.description, `%${query.search}%`)
        )!
      );
    }

    let orderBy = desc(projects.createdAt);
    if (query.sortBy === 'oldest') orderBy = asc(projects.createdAt);
    if (query.sortBy === 'alphabetical') orderBy = asc(projects.name);
    if (query.sortBy === 'due_date') orderBy = asc(projects.dueDate);

    const projectRecords = await db
      .select({
        project: projects,
        ownerName: users.fullName,
        ownerAvatar: users.avatarUrl,
      })
      .from(projects)
      .innerJoin(users, eq(projects.ownerId, users.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Total Count for Pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(and(...conditions));

    return {
      projects: projectRecords.map((p) => ({
        ...p.project,
        owner: {
          name: p.ownerName,
          avatarUrl: p.ownerAvatar,
        },
      })),
      pagination: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  /**
   * Get Single Project by Slug or ID
   */
  static async getProject(orgIdOrSlug: string, projectSlugOrId: string) {
    const context = await requireTenantPermission(orgIdOrSlug, 'projects.read');

    const [projectRecord] = await db
      .select({
        project: projects,
        ownerName: users.fullName,
        ownerEmail: users.email,
        ownerAvatar: users.avatarUrl,
      })
      .from(projects)
      .innerJoin(users, eq(projects.ownerId, users.id))
      .where(
        and(
          eq(projects.organizationId, context.organization.id),
          projectSlugOrId.includes('-') && projectSlugOrId.length === 36
            ? eq(projects.id, projectSlugOrId)
            : eq(projects.slug, projectSlugOrId)
        )
      );

    if (!projectRecord) {
      throw new Error('NOT_FOUND: Project not found or accessible.');
    }

    return {
      ...projectRecord.project,
      owner: {
        name: projectRecord.ownerName,
        email: projectRecord.ownerEmail,
        avatarUrl: projectRecord.ownerAvatar,
      },
    };
  }

  /**
   * Update Project
   */
  static async updateProject(
    orgIdOrSlug: string,
    projectId: string,
    updates: Partial<CreateProjectInput>
  ) {
    const context = await requireTenantPermission(
      orgIdOrSlug,
      'projects.update'
    );

    const [updated] = await db
      .update(projects)
      .set({
        ...updates,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.organizationId, context.organization.id)
        )
      )
      .returning();

    return updated;
  }

  /**
   * Delete Project
   */
  static async deleteProject(orgIdOrSlug: string, projectId: string) {
    const context = await requireTenantPermission(
      orgIdOrSlug,
      'projects.delete'
    );

    await db
      .delete(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.organizationId, context.organization.id)
        )
      );

    return { success: true };
  }
}
