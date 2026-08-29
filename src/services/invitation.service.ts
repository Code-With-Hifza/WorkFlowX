import { db } from '@/db';
import {
  organizationInvitations,
  organizationMembers,
  organizations,
  users,
} from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import crypto from 'crypto';
import { requireTenantPermission } from '@/lib/tenant-context';

export class InvitationService {
  /**
   * Invite Member to Organization
   */
  static async inviteMember(
    orgIdOrSlug: string,
    email: string,
    roleId: string
  ) {
    const context = await requireTenantPermission(
      orgIdOrSlug,
      'members.invite'
    );

    // Check if already a member
    const existingMember = await db
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(
        and(
          eq(organizationMembers.organizationId, context.organization.id),
          eq(users.email, email),
          eq(organizationMembers.status, 'active')
        )
      );

    if (existingMember.length > 0) {
      throw new Error('ALREADY_MEMBER: User is already an active member of this organization.');
    }

    // Check duplicate pending invitation
    const pendingInvites = await db
      .select({ id: organizationInvitations.id })
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.organizationId, context.organization.id),
          eq(organizationInvitations.email, email),
          eq(organizationInvitations.status, 'pending')
        )
      );

    if (pendingInvites.length > 0) {
      throw new Error('INVITATION_EXISTS: A pending invitation has already been sent to this email.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invitation] = await db
      .insert(organizationInvitations)
      .values({
        organizationId: context.organization.id,
        email,
        roleId,
        token,
        status: 'pending',
        expiresAt,
      })
      .returning();

    return invitation;
  }

  /**
   * Verify Invitation Token
   */
  static async verifyToken(token: string) {
    const [invitation] = await db
      .select({
        invitation: organizationInvitations,
        organization: organizations,
      })
      .from(organizationInvitations)
      .innerJoin(
        organizations,
        eq(organizationInvitations.organizationId, organizations.id)
      )
      .where(
        and(
          eq(organizationInvitations.token, token),
          eq(organizationInvitations.status, 'pending'),
          gte(organizationInvitations.expiresAt, new Date())
        )
      );

    if (!invitation) {
      throw new Error('INVALID_TOKEN: Invitation token is invalid or expired.');
    }

    return invitation;
  }

  /**
   * Accept Invitation
   */
  static async acceptInvitation(token: string, userId: string) {
    const { invitation, organization } = await this.verifyToken(token);

    // Create Membership
    await db.insert(organizationMembers).values({
      organizationId: organization.id,
      userId,
      roleId: invitation.roleId,
      status: 'active',
    });

    // Mark Invitation Accepted
    await db
      .update(organizationInvitations)
      .set({ status: 'accepted' })
      .where(eq(organizationInvitations.id, invitation.id));

    return { organization };
  }

  /**
   * Revoke Invitation
   */
  static async revokeInvitation(orgIdOrSlug: string, invitationId: string) {
    const context = await requireTenantPermission(
      orgIdOrSlug,
      'members.invite'
    );

    await db
      .update(organizationInvitations)
      .set({ status: 'revoked' })
      .where(
        and(
          eq(organizationInvitations.id, invitationId),
          eq(organizationInvitations.organizationId, context.organization.id)
        )
      );

    return { success: true };
  }
}
