import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo: text('logo'),
    description: text('description'),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    status: text('status', { enum: ['active', 'suspended', 'archived'] })
      .default('active')
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    ownerIdx: index('org_owner_idx').on(table.ownerId),
    slugIdx: index('org_slug_idx').on(table.slug),
  })
);

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id').notNull(),
    status: text('status', {
      enum: ['pending', 'active', 'suspended', 'removed'],
    })
      .default('active')
      .notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    orgUserIdx: index('org_member_org_user_idx').on(
      table.organizationId,
      table.userId
    ),
    userIdx: index('org_member_user_idx').on(table.userId),
  })
);

export const organizationInvitations = pgTable(
  'organization_invitations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    roleId: uuid('role_id').notNull(),
    token: text('token').notNull().unique(),
    status: text('status', {
      enum: ['pending', 'accepted', 'expired', 'revoked'],
    })
      .default('pending')
      .notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgEmailIdx: index('invitation_org_email_idx').on(
      table.organizationId,
      table.email
    ),
    tokenIdx: index('invitation_token_idx').on(table.token),
  })
);
