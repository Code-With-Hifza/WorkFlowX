import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { db } from './index';
import {
  users,
  userProfiles,
  roles,
  permissions,
  rolePermissions,
  organizations,
  organizationMembers,
  projects,
  projectMembers,
  tasks,
  subtasks,
  labels,
  taskLabels,
  comments,
  commentMentions,
  notifications,
  activities,
  plans,
  subscriptions,
} from './schema/index';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting WorkFlowX database seeding...');

  // 1. Seed Roles
  console.log('Inserting default RBAC Roles...');
  const defaultRoles = [
    { name: 'Owner', description: 'Full organization access and billing owner', isSystem: true },
    { name: 'Admin', description: 'Full access except organization deletion', isSystem: true },
    { name: 'Manager', description: 'Manage projects, tasks, and team members', isSystem: true },
    { name: 'Member', description: 'Create and update assigned projects and tasks', isSystem: true },
    { name: 'Guest', description: 'View-only access to assigned projects', isSystem: true },
  ];

  await db.insert(roles).values(defaultRoles).onConflictDoNothing();
  const allRoles = await db.select().from(roles);
  const roleMap = new Map(allRoles.map((r) => [r.name, r.id]));

  // 2. Seed Permissions
  console.log('Inserting granular RBAC Permissions...');
  const defaultPermissions = [
    { key: 'organization.read', description: 'View organization details', category: 'organization' },
    { key: 'organization.update', description: 'Update organization settings', category: 'organization' },
    { key: 'organization.delete', description: 'Delete organization', category: 'organization' },
    { key: 'members.read', description: 'View team members', category: 'members' },
    { key: 'members.invite', description: 'Invite new team members', category: 'members' },
    { key: 'members.update', description: 'Update member roles', category: 'members' },
    { key: 'members.remove', description: 'Remove members from organization', category: 'members' },
    { key: 'projects.read', description: 'View projects', category: 'projects' },
    { key: 'projects.create', description: 'Create new projects', category: 'projects' },
    { key: 'projects.update', description: 'Update existing projects', category: 'projects' },
    { key: 'projects.delete', description: 'Delete projects', category: 'projects' },
    { key: 'tasks.read', description: 'View tasks', category: 'tasks' },
    { key: 'tasks.create', description: 'Create new tasks', category: 'tasks' },
    { key: 'tasks.update', description: 'Update tasks', category: 'tasks' },
    { key: 'tasks.delete', description: 'Delete tasks', category: 'tasks' },
    { key: 'billing.read', description: 'View billing and invoices', category: 'billing' },
    { key: 'billing.manage', description: 'Manage subscription and payment methods', category: 'billing' },
    { key: 'analytics.read', description: 'View analytics dashboards', category: 'analytics' },
    { key: 'audit_logs.read', description: 'View organization audit logs', category: 'audit_logs' },
  ];

  await db.insert(permissions).values(defaultPermissions).onConflictDoNothing();
  const allPermissions = await db.select().from(permissions);

  // Assign Permissions to Roles
  const ownerRoleId = roleMap.get('Owner')!;
  const adminRoleId = roleMap.get('Admin')!;
  const managerRoleId = roleMap.get('Manager')!;
  const memberRoleId = roleMap.get('Member')!;

  const rolePermsToInsert = [];
  for (const perm of allPermissions) {
    rolePermsToInsert.push({ roleId: ownerRoleId, permissionId: perm.id });
    if (perm.key !== 'organization.delete') {
      rolePermsToInsert.push({ roleId: adminRoleId, permissionId: perm.id });
    }
    if (!['organization.delete', 'billing.manage', 'audit_logs.read'].includes(perm.key)) {
      rolePermsToInsert.push({ roleId: managerRoleId, permissionId: perm.id });
    }
    if (['projects.read', 'tasks.read', 'tasks.create', 'tasks.update', 'members.read'].includes(perm.key)) {
      rolePermsToInsert.push({ roleId: memberRoleId, permissionId: perm.id });
    }
  }

  await db.insert(rolePermissions).values(rolePermsToInsert).onConflictDoNothing();

  // 3. Seed Pricing Plans
  console.log('Inserting SaaS Plans...');
  const defaultPlans = [
    {
      name: 'Free',
      slug: 'free',
      priceMonthly: 0,
      projectLimit: 2,
      memberLimit: 5,
      taskLimit: 100,
      storageGb: 1,
    },
    {
      name: 'Pro',
      slug: 'pro',
      priceMonthly: 2900,
      projectLimit: -1,
      memberLimit: 50,
      taskLimit: 10000,
      storageGb: 50,
    },
    {
      name: 'Business',
      slug: 'business',
      priceMonthly: 9900,
      projectLimit: -1,
      memberLimit: 200,
      taskLimit: -1,
      storageGb: 500,
    },
  ];

  await db.insert(plans).values(defaultPlans).onConflictDoNothing();
  const allPlans = await db.select().from(plans);
  const proPlanId = allPlans.find((p) => p.slug === 'pro')!.id;

  // 4. Seed Demo Users
  console.log('Checking/Inserting Demo Users...');
  const demoUsersData = [
    {
      email: 'hifza@workflowx.app',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E5g/.uRk1/Lp/f2m8p5eQ8dEa2rGq2',
      fullName: 'Hifza Khan',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      emailVerified: true,
    },
    {
      email: 'owner@acme.com',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E5g/.uRk1/Lp/f2m8p5eQ8dEa2rGq2',
      fullName: 'Alex Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      emailVerified: true,
    },
    {
      email: 'sarah@acme.com',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E5g/.uRk1/Lp/f2m8p5eQ8dEa2rGq2',
      fullName: 'Sarah Connor',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      emailVerified: true,
    },
    {
      email: 'ali@acme.com',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E5g/.uRk1/Lp/f2m8p5eQ8dEa2rGq2',
      fullName: 'Ali Hassan',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      emailVerified: true,
    },
  ];

  await db.insert(users).values(demoUsersData).onConflictDoNothing();
  const allUsers = await db.select().from(users);
  const hifzaUser = allUsers.find((u) => u.email === 'hifza@workflowx.app')!;
  const alexUser = allUsers.find((u) => u.email === 'owner@acme.com')!;
  const sarahUser = allUsers.find((u) => u.email === 'sarah@acme.com')!;
  const aliUser = allUsers.find((u) => u.email === 'ali@acme.com')!;

  // User Profiles
  for (const u of allUsers) {
    await db
      .insert(userProfiles)
      .values({
        userId: u.id,
        timezone: 'America/New_York',
        bio: `Senior Software Engineer at WorkFlowX`,
      })
      .onConflictDoNothing();
  }

  // 5. Seed Demo Organization: Acme Technologies
  console.log('Checking/Inserting Demo Organization: Acme Technologies...');
  await db
    .insert(organizations)
    .values({
      name: 'Acme Technologies',
      slug: 'acme-tech',
      description: 'Enterprise Engineering & Product Innovation Lab',
      ownerId: alexUser.id,
      status: 'active',
    })
    .onConflictDoNothing();

  const allOrgs = await db.select().from(organizations);
  const acmeOrg = allOrgs.find((o) => o.slug === 'acme-tech')!;

  // Organization Subscription
  await db
    .insert(subscriptions)
    .values({
      organizationId: acmeOrg.id,
      planId: proPlanId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .onConflictDoNothing();

  // Organization Members
  await db
    .insert(organizationMembers)
    .values([
      { organizationId: acmeOrg.id, userId: alexUser.id, roleId: ownerRoleId, status: 'active' },
      { organizationId: acmeOrg.id, userId: hifzaUser.id, roleId: adminRoleId, status: 'active' },
      { organizationId: acmeOrg.id, userId: sarahUser.id, roleId: managerRoleId, status: 'active' },
      { organizationId: acmeOrg.id, userId: aliUser.id, roleId: memberRoleId, status: 'active' },
    ])
    .onConflictDoNothing();

  // Organization Labels
  console.log('Inserting Organization Labels...');
  await db
    .insert(labels)
    .values([
      { organizationId: acmeOrg.id, name: 'frontend', color: '#3b82f6' },
      { organizationId: acmeOrg.id, name: 'backend', color: '#8b5cf6' },
      { organizationId: acmeOrg.id, name: 'urgent', color: '#ef4444' },
      { organizationId: acmeOrg.id, name: 'feature', color: '#10b981' },
      { organizationId: acmeOrg.id, name: 'bug', color: '#f59e0b' },
    ])
    .onConflictDoNothing();

  // 6. Seed Projects
  console.log('Inserting Demo Projects...');
  await db
    .insert(projects)
    .values([
      {
        organizationId: acmeOrg.id,
        name: 'Website Redesign',
        slug: 'website-redesign',
        description: 'Modernizing corporate web portal with Next.js & Tailwind CSS',
        status: 'active' as const,
        visibility: 'organization' as const,
        ownerId: hifzaUser.id,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
      {
        organizationId: acmeOrg.id,
        name: 'Mobile App',
        slug: 'mobile-app',
        description: 'Cross-platform iOS and Android app for enterprise clients',
        status: 'active' as const,
        visibility: 'organization' as const,
        ownerId: sarahUser.id,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        organizationId: acmeOrg.id,
        name: 'Authentication System',
        slug: 'auth-system',
        description: 'SecureAuth MFA and OAuth integration engine',
        status: 'completed' as const,
        visibility: 'organization' as const,
        ownerId: alexUser.id,
      },
    ])
    .onConflictDoNothing();

  console.log('✅ WorkFlowX Idempotent Database Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
