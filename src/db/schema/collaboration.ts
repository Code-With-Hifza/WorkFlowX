import { pgTable, text, timestamp, uuid, boolean, integer, index } from 'drizzle-orm/pg-core';
import { tasks } from './tasks';
import { users } from './users';
import { organizations } from './organizations';
import { projects } from './projects';

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    taskIdx: index('comment_task_idx').on(table.taskId),
  })
);

export const commentMentions = pgTable(
  'comment_mentions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userMentionIdx: index('mention_user_idx').on(table.userId),
  })
);

export const attachments = pgTable(
  'attachments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, {
      onDelete: 'cascade',
    }),
    taskId: uuid('task_id').references(() => tasks.id, {
      onDelete: 'cascade',
    }),
    uploaderId: uuid('uploader_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    fileKey: text('file_key').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: text('mime_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('attachment_org_idx').on(table.organizationId),
    taskIdx: index('attachment_task_idx').on(table.taskId),
  })
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userReadIdx: index('notification_user_read_idx').on(
      table.userId,
      table.isRead
    ),
  })
);

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  emailTaskAssigned: boolean('email_task_assigned').default(true).notNull(),
  emailMentions: boolean('email_mentions').default(true).notNull(),
  emailComments: boolean('email_comments').default(true).notNull(),
  emailDueDates: boolean('email_due_dates').default(true).notNull(),
  inAppEnabled: boolean('in_app_enabled').default(true).notNull(),
});
