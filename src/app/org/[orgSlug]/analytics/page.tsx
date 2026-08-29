import { redirect } from 'next/navigation';
import { getTenantContext } from '@/lib/tenant-context';
import { OrganizationService } from '@/services/organization.service';
import { AnalyticsService } from '@/services/analytics.service';
import { WorkspaceSwitcher } from '@/components/organization/workspace-switcher';
import { AnalyticsCharts } from '@/components/analytics/analytics-charts';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface AnalyticsPageParams {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageParams) {
  const { orgSlug } = await params;
  const context = await getTenantContext(orgSlug);

  if (!context) {
    redirect('/login');
  }

  const userOrgs = await OrganizationService.getUserOrganizations(context.user.id);
  const analyticsData = await AnalyticsService.getOrganizationAnalytics(orgSlug);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="mb-6">
            <WorkspaceSwitcher
              organizations={userOrgs}
              activeOrgSlug={context.organization.slug}
            />
          </div>

          <nav className="space-y-1">
            <Link
              href={`/org/${orgSlug}/dashboard`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors"
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
              href={`/org/${orgSlug}/analytics`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-semibold text-xs transition-colors"
            >
              <BarChart3 className="w-4 h-4" /> Analytics & Reports
            </Link>
            <Link
              href={`/org/${orgSlug}/settings`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Analytics Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-950/60 backdrop-blur sticky top-0 z-40">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" /> Executive Analytics & Reports
          </h1>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Executive Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Task Completion Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {analyticsData.kpi.completionRate}%
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-1.5 rounded-full"
                  style={{ width: `${analyticsData.kpi.completionRate}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Active Projects</span>
                <FolderKanban className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {analyticsData.kpi.activeProjects} / {analyticsData.kpi.totalProjects}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">projects in flight</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Completed Tasks</span>
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {analyticsData.kpi.completedTasks}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                out of {analyticsData.kpi.totalTasks} total tasks
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Overdue Tasks</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {analyticsData.kpi.overdueTasks}
              </p>
              <p className="text-[10px] text-red-400 mt-1 font-medium">requires attention</p>
            </div>
          </div>

          {/* Interactive Recharts Visual Graphs */}
          <AnalyticsCharts
            statusData={analyticsData.charts.tasksByStatus}
            priorityData={analyticsData.charts.tasksByPriority}
            teamData={analyticsData.charts.teamProductivity}
          />
        </div>
      </main>
    </div>
  );
}
