import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { users } from './users';

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    status: text('status', {
      enum: ['planning', 'active', 'completed', 'archived'],
    })
      .default('active')
      .notNull(),
    visibility: text('visibility', { enum: ['private', 'organization'] })
      .default('organization')
      .notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    startDate: timestamp('start_date'),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('project_org_idx').on(table.organizationId),
    ownerIdx: index('project_owner_idx').on(table.ownerId),
    statusIdx: index('project_status_idx').on(table.status),
  })
);

export const projectMembers = pgTable(
  'project_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', {
      enum: ['owner', 'manager', 'contributor', 'viewer'],
    })
      .default('contributor')
      .notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    projUserIdx: index('project_member_proj_user_idx').on(
      table.projectId,
      table.userId
    ),
  })
);
