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
  Calendar as CalendarIcon,
  Settings,
  Clock,
} from 'lucide-react';

interface CalendarPageParams {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function CalendarPage({ params }: CalendarPageParams) {
  const { orgSlug } = await params;
  const context = await getTenantContext(orgSlug);

  if (!context) {
    redirect('/login');
  }

  const userOrgs = await OrganizationService.getUserOrganizations(context.user.id);
  const { tasks: taskList } = await TaskService.getTasks(orgSlug, {
    limit: 100,
  });

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-blue-600 selection:text-white">
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
              href={`/org/${orgSlug}/kanban`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors"
            >
              <CheckSquare className="w-4 h-4" /> Kanban Board
            </Link>
            <Link
              href={`/org/${orgSlug}/calendar`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-semibold text-xs transition-colors"
            >
              <CalendarIcon className="w-4 h-4" /> Calendar View
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

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-950/60 backdrop-blur sticky top-0 z-40">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" /> Deadline Calendar
          </h1>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-7 gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-slate-400 py-2 border-b border-slate-800 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}

            {daysInMonth.map((dayNum) => {
              const dayTasks = taskList.filter((t) => {
                if (!t.dueDate) return false;
                const d = new Date(t.dueDate);
                return d.getDate() === dayNum;
              });

              return (
                <div
                  key={dayNum}
                  className="min-h-[110px] p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-slate-400">{dayNum}</span>

                  <div className="space-y-1">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-[10px] font-semibold text-blue-300 truncate"
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
