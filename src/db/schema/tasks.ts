import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { projects } from './projects';
import { users } from './users';

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', {
      enum: ['todo', 'in_progress', 'review', 'done'],
    })
      .default('todo')
      .notNull(),
    priority: text('priority', {
      enum: ['low', 'medium', 'high', 'urgent'],
    })
      .default('medium')
      .notNull(),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    assigneeId: uuid('assignee_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    startDate: timestamp('start_date'),
    dueDate: timestamp('due_date'),
    estimatedHours: integer('estimated_hours').default(0),
    actualHours: integer('actual_hours').default(0),
    position: integer('position').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('task_org_idx').on(table.organizationId),
    projectIdx: index('task_project_idx').on(table.projectId),
    assigneeIdx: index('task_assignee_idx').on(table.assigneeId),
    statusIdx: index('task_status_idx').on(table.status),
    priorityIdx: index('task_priority_idx').on(table.priority),
    dueDateIdx: index('task_due_date_idx').on(table.dueDate),
  })
);

export const subtasks = pgTable(
  'subtasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    isCompleted: boolean('is_completed').default(false).notNull(),
    position: integer('position').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    taskIdx: index('subtask_task_idx').on(table.taskId),
  })
);

export const labels = pgTable(
  'labels',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color').default('#3b82f6').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('label_org_idx').on(table.organizationId),
  })
);

export const taskLabels = pgTable(
  'task_labels',
  {
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    labelId: uuid('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.labelId] }),
  })
);
