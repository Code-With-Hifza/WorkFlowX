import { db } from '@/db';
import {
  organizations,
  organizationMembers,
  roles,
  users,
  plans,
  subscriptions,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireTenantPermission, requireTenantMember } from '@/lib/tenant-context';

export interface CreateOrgInput {
  name: string;
  slug: string;
  description?: string;
}

export class OrganizationService {
  /**
   * Create a new organization and assign creator as Owner
   */
  static async createOrganization(ownerId: string, input: CreateOrgInput) {
    const existingSlug = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, input.slug));

    if (existingSlug.length > 0) {
      throw new Error('SLUG_TAKEN: Organization slug is already in use.');
    }

    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        ownerId,
        status: 'active',
      })
      .returning();

    // Fetch Owner Role ID
    const [ownerRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'Owner'));

    if (ownerRole) {
      await db.insert(organizationMembers).values({
        organizationId: newOrg.id,
        userId: ownerId,
        roleId: ownerRole.id,
        status: 'active',
      });
    }

    // Default Free Subscription
    const [freePlan] = await db
      .select()
      .from(plans)
      .where(eq(plans.slug, 'free'));

    if (freePlan) {
      await db.insert(subscriptions).values({
        organizationId: newOrg.id,
        planId: freePlan.id,
        status: 'active',
      });
    }

    return newOrg;
  }

  /**
   * Get all active organizations for a user
   */
  static async getUserOrganizations(userId: string) {
    const orgs = await db
      .select({
        organization: organizations,
        roleName: roles.name,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id)
      )
      .innerJoin(roles, eq(organizationMembers.roleId, roles.id))
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, 'active'),
          eq(organizations.status, 'active')
        )
      );

    return orgs.map((o) => ({
      ...o.organization,
      roleName: o.roleName,
    }));
  }

  /**
   * Update Organization Settings
   */
  static async updateOrganization(
    orgIdOrSlug: string,
    updates: { name?: string; description?: string; logo?: string }
  ) {
    const context = await requireTenantPermission(
      orgIdOrSlug,
      'organization.update'
    );

    const [updated] = await db
      .update(organizations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, context.organization.id))
      .returning();

    return updated;
  }

  /**
   * List Organization Members
   */
  static async getMembers(orgIdOrSlug: string) {
    const context = await requireTenantPermission(orgIdOrSlug, 'members.read');

    const members = await db
      .select({
        memberId: organizationMembers.id,
        userId: users.id,
        fullName: users.fullName,
        email: users.email,
        avatarUrl: users.avatarUrl,
        status: organizationMembers.status,
        joinedAt: organizationMembers.joinedAt,
        role: {
          id: roles.id,
          name: roles.name,
          description: roles.description,
        },
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .innerJoin(roles, eq(organizationMembers.roleId, roles.id))
      .where(
        and(
          eq(
            organizationMembers.organizationId,
            context.organization.id
          ),
          eq(organizationMembers.status, 'active')
        )
      );

    return members;
  }

  /**
   * Update Member Role
   */
  static async updateMemberRole(
    orgIdOrSlug: string,
    memberId: string,
    newRoleId: string
  ) {
    const context = await requireTenantPermission(
      orgIdOrSlug,
      'members.update'
    );

    const [updated] = await db
      .update(organizationMembers)
      .set({ roleId: newRoleId })
      .where(
        and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, context.organization.id)
        )
      )
      .returning();

    return updated;
  }

  /**
   * Remove Member from Organization
   */
  static async removeMember(orgIdOrSlug: string, memberId: string) {
    const context = await requireTenantPermission(
      orgIdOrSlug,
      'members.remove'
    );

    await db
      .update(organizationMembers)
      .set({ status: 'removed' })
      .where(
        and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, context.organization.id)
        )
      );

    return { success: true };
  }
}
