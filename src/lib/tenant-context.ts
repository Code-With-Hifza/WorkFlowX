import { getCurrentUser } from './auth';
import { db } from '@/db';
import {
  organizations,
  organizationMembers,
  roles,
  rolePermissions,
  permissions,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface TenantContext {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  organization: typeof organizations.$inferSelect;
  member: typeof organizationMembers.$inferSelect;
  role: typeof roles.$inferSelect;
  permissions: Set<string>;
}

export async function getTenantContext(
  orgIdOrSlug: string
): Promise<TenantContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // Resolve Organization by UUID or slug
  const [org] = await db
    .select()
    .from(organizations)
    .where(
      orgIdOrSlug.includes('-') && orgIdOrSlug.length === 36
        ? eq(organizations.id, orgIdOrSlug)
        : eq(organizations.slug, orgIdOrSlug)
    );

  if (!org || org.status === 'archived') return null;

  // Verify Active Membership
  const [member] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, org.id),
        eq(organizationMembers.userId, user.id),
        eq(organizationMembers.status, 'active')
      )
    );

  if (!member) return null;

  // Fetch Member Role
  const [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.id, member.roleId));

  if (!role) return null;

  // Fetch Role Permissions
  const rolePerms = await db
    .select({
      key: permissions.key,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, role.id));

  const permSet = new Set<string>(rolePerms.map((p) => p.key));

  return {
    user,
    organization: org,
    member,
    role,
    permissions: permSet,
  };
}

export async function requireTenantMember(orgIdOrSlug: string): Promise<TenantContext> {
  const context = await getTenantContext(orgIdOrSlug);
  if (!context) {
    throw new Error('FORBIDDEN: You do not have active access to this organization tenant.');
  }
  return context;
}

export async function requireTenantPermission(
  orgIdOrSlug: string,
  requiredPermission: string
): Promise<TenantContext> {
  const context = await requireTenantMember(orgIdOrSlug);
  if (!context.permissions.has(requiredPermission)) {
    throw new Error(`FORBIDDEN: Missing required permission "${requiredPermission}".`);
  }
  return context;
}
