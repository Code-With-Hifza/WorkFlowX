'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';

interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  roleName?: string;
}

interface WorkspaceSwitcherProps {
  organizations: OrganizationItem[];
  activeOrgSlug: string;
}

export function WorkspaceSwitcher({
  organizations,
  activeOrgSlug,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const activeOrg =
    organizations.find((o) => o.slug === activeOrgSlug) || organizations[0];

  const handleSelectOrg = (slug: string) => {
    setIsOpen(false);
    // Replace active org slug in route URL
    const newPath = pathname.replace(
      new RegExp(`^/org/[^/]+`),
      `/org/${slug}`
    );
    router.push(newPath.startsWith('/org/') ? newPath : `/org/${slug}/dashboard`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all w-56 shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            {activeOrg?.name.charAt(0).toUpperCase() || 'W'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">
              {activeOrg?.name || 'Select Workspace'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium capitalize">
              {activeOrg?.roleName || 'Member'}
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-xl">
          <div className="px-3 py-1.5 border-b border-slate-800/80 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspaces ({organizations.length})
          </div>

          <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
            {organizations.map((org) => {
              const isSelected = org.slug === activeOrgSlug;
              return (
                <button
                  key={org.id}
                  onClick={() => handleSelectOrg(org.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-600/15 text-blue-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{org.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                </button>
              );
            })}
          </div>

          <div className="p-1 border-t border-slate-800/80">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/org/new');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              Create Organization
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
