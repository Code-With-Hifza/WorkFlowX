import { redirect } from 'next/navigation';
import { getTenantContext } from '@/lib/tenant-context';
import { OrganizationService } from '@/services/organization.service';
import { WorkspaceSwitcher } from '@/components/organization/workspace-switcher';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  Settings,
  CreditCard,
  LogOut,
  Shield,
  TrendingUp,
  Activity,
  Layers,
  Clock,
} from 'lucide-react';

interface DashboardParams {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function OrganizationDashboardPage({ params }: DashboardParams) {
  const { orgSlug } = await params;
  const context = await getTenantContext(orgSlug);

  if (!context) {
    redirect('/login');
  }

  const userOrgs = await OrganizationService.getUserOrganizations(context.user.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Workspace Switcher Header */}
          <div className="mb-6">
            <WorkspaceSwitcher
              organizations={userOrgs}
              activeOrgSlug={context.organization.slug}
            />
          </div>

          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Scopes
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href={`/org/${orgSlug}/dashboard`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-semibold text-xs transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link
              href={`/org/${orgSlug}/projects`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors"
            >
              <FolderKanban className="w-4 h-4" /> Projects
            </Link>
            <Link
              href={`/org/${orgSlug}/tasks`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors"
            >
              <CheckSquare className="w-4 h-4" /> Tasks
            </Link>
            <Link
              href={`/org/${orgSlug}/team`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors"
            >
              <Users className="w-4 h-4" /> Team Members
            </Link>
            <Link
              href={`/org/${orgSlug}/billing`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors"
            >
              <CreditCard className="w-4 h-4" /> Billing & Usage
            </Link>
            <Link
              href={`/org/${orgSlug}/settings`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </nav>
        </div>

        {/* User Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {context.user.fullName.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {context.user.fullName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {context.user.email}
              </p>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-950/60 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">
              {context.organization.name} Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3" /> Role: {context.role.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Executive Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Active Projects</span>
                <FolderKanban className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" /> +100% capacity
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Tasks</span>
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-[10px] text-slate-400 mt-1">across active sprints</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Team Members</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-[10px] text-slate-400 mt-1">RBAC assigned</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Subscription Tier</span>
                <CreditCard className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">Pro Plan</p>
              <p className="text-[10px] text-blue-400 mt-1 font-medium">50 member limit</p>
            </div>
          </div>

          {/* Active Tenant Context Information */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-800/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                  Active Multi-Tenant Context
                </span>
                <h2 className="text-xl font-bold text-white mt-2">
                  Isolated Tenant ID: {context.organization.id}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Tenant context resolves Server-Side (`{context.user.email}` + `{context.organization.slug}` + `{context.role.name}`).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/org/${orgSlug}/tasks`}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20"
                >
                  View Kanban Tasks
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Recent Organization Activity
              </h3>
              <span className="text-xs text-slate-400">Real-time synced</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                <div>
                  <p className="text-xs text-slate-200">
                    <span className="font-semibold text-white">Sarah Connor</span> moved task "Integrate Socket.IO Kanban Board" to Review
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Today at 10:32 AM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                <div>
                  <p className="text-xs text-slate-200">
                    <span className="font-semibold text-white">Hifza Khan</span> created task "Build Multi-Tenant Middleware"
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Today at 09:50 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
