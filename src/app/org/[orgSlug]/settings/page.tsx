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
  CreditCard,
  Settings,
  Shield,
  UserPlus,
  Mail,
  Trash2,
  Building2,
} from 'lucide-react';

interface SettingsParams {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function OrganizationSettingsPage({ params }: SettingsParams) {
  const { orgSlug } = await params;
  const context = await getTenantContext(orgSlug);

  if (!context) {
    redirect('/login');
  }

  const userOrgs = await OrganizationService.getUserOrganizations(context.user.id);
  const members = await OrganizationService.getMembers(orgSlug);

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
              href={`/org/${orgSlug}/settings`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-semibold text-xs transition-colors"
            >
              <Settings className="w-4 h-4" /> Settings & Members
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Settings Body */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-950/60 backdrop-blur sticky top-0 z-40">
          <h1 className="text-lg font-bold text-white">
            Organization Settings & Team Governance
          </h1>
        </header>

        <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
          {/* General Settings */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" /> Organization Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={context.organization.name}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Workspace Slug
                </label>
                <input
                  type="text"
                  readOnly
                  value={context.organization.slug}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Members & RBAC Table */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> Team Members & RBAC
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage organization access, roles, and pending invitations
                </p>
              </div>

              <button className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5" /> Invite Member
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {members.map((m) => (
                    <tr key={m.memberId} className="hover:bg-slate-950/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                            {m.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{m.fullName}</p>
                            <p className="text-[10px] text-slate-500">{m.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-200 text-[11px] font-medium capitalize">
                          {m.role.name}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium capitalize">
                          {m.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {new Date(m.joinedAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-950 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
