import { redirect } from 'next/navigation';
import { getTenantContext } from '@/lib/tenant-context';
import { OrganizationService } from '@/services/organization.service';
import { TaskService } from '@/services/task.service';
import { WorkspaceSwitcher } from '@/components/organization/workspace-switcher';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  Plus,
  Search,
  Filter,
  Clock,
  ListTodo,
} from 'lucide-react';

interface TasksPageParams {
  params: Promise<{
    orgSlug: string;
  }>;
  searchParams: Promise<{
    status?: string;
    priority?: string;
    search?: string;
  }>;
}

export default async function TasksPage({ params, searchParams }: TasksPageParams) {
  const { orgSlug } = await params;
  const query = await searchParams;
  const context = await getTenantContext(orgSlug);

  if (!context) {
    redirect('/login');
  }

  const userOrgs = await OrganizationService.getUserOrganizations(context.user.id);
  const { tasks: taskList, pagination } = await TaskService.getTasks(orgSlug, {
    status: query.status,
    priority: query.priority,
    search: query.search,
  });

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
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-semibold text-xs transition-colors"
            >
              <CheckSquare className="w-4 h-4" /> Tasks
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-950/60 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">Tasks Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
              {pagination.total} Tasks
            </span>
          </div>

          <Link
            href={`/org/${orgSlug}/kanban`}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
          >
            <ListTodo className="w-4 h-4" /> Open Kanban Board
          </Link>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Tasks Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Task Title</th>
                    <th className="px-5 py-3.5">Project</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Subtasks Progress</th>
                    <th className="px-5 py-3.5 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {taskList.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white text-xs">{task.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {task.description || 'No description'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-medium">
                          {task.project.name}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            task.status === 'done'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : task.status === 'in_progress'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : task.status === 'review'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize border ${
                            task.priority === 'urgent'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : task.priority === 'high'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-blue-400 font-medium text-[10px]">
                          {task.subtasksProgress}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right text-slate-400">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
