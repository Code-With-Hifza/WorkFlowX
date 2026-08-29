import { redirect } from 'next/navigation';
import { getTenantContext } from '@/lib/tenant-context';
import { OrganizationService } from '@/services/organization.service';
import { ProjectService } from '@/services/project.service';
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
  Calendar,
  User,
} from 'lucide-react';

interface ProjectsPageParams {
  params: Promise<{
    orgSlug: string;
  }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export default async function ProjectsPage({ params, searchParams }: ProjectsPageParams) {
  const { orgSlug } = await params;
  const query = await searchParams;
  const context = await getTenantContext(orgSlug);

  if (!context) {
    redirect('/login');
  }

  const userOrgs = await OrganizationService.getUserOrganizations(context.user.id);
  const { projects: projectList, pagination } = await ProjectService.getProjects(
    orgSlug,
    {
      search: query.search,
      status: query.status,
    }
  );

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
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-semibold text-xs transition-colors"
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
            <h1 className="text-lg font-bold text-white">Projects Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
              {pagination.total} Total Projects
            </span>
          </div>

          <Link
            href={`/org/${orgSlug}/projects/new`}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Project
          </Link>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projectList.map((project) => (
              <Link
                key={project.id}
                href={`/org/${orgSlug}/projects/${project.slug}`}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-semibold uppercase tracking-wider">
                      {project.visibility}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium capitalize border ${
                        project.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : project.status === 'active'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{project.owner.name}</span>
                  </div>

                  {project.dueDate && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
