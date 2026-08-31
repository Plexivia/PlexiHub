import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Project, TenantConfig } from '../../types';
import { cn } from '../../lib/utils';
import {
  PlusCircle,
  ListTodo,
  BarChart3,
  HelpCircle,
  LifeBuoy,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  tenant: TenantConfig;
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigateMobile?: () => void;
}

export function Sidebar({
  tenant,
  projects,
  currentProjectId,
  onSelectProject,
  isCollapsed = false,
  onToggleCollapse,
  onNavigateMobile,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = () => {
    if (onNavigateMobile) onNavigateMobile();
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors select-none',
      isActive
        ? 'bg-gray-800 text-white font-semibold'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    );

  return (
    <aside className="flex h-full w-full flex-col justify-between bg-[#111827] border-r border-gray-800 text-gray-300">
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-white font-bold text-sm shadow-xs italic"
            style={{ backgroundColor: tenant.primaryColor || '#2563eb' }}
          >
            {tenant.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold text-white tracking-tight leading-tight">
              {tenant.name}
            </h1>
            <p className="truncate text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
              {tenant.domain}
            </p>
          </div>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5 max-h-[calc(100vh-140px)]">
          {/* Projects Navigation Group */}
          <div className="space-y-4">
            {projects.map((proj) => {
              const isCurrent = proj.id === currentProjectId;

              return (
                <div key={proj.id} className="space-y-1">
                  {/* Project Group Heading (NOT A LINK) */}
                  <div
                    className={cn(
                      'flex items-center justify-between px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest',
                      isCurrent ? 'text-gray-200 font-bold' : 'text-gray-500'
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={cn("h-1.5 w-1.5 rounded-full", isCurrent ? "bg-blue-500" : "bg-gray-600")} />
                      <span className="truncate">{proj.name}</span>
                      <span className="font-mono text-[10px] text-gray-500">[{proj.code}]</span>
                    </div>
                  </div>

                  {/* Project Menu Items */}
                  <div className="space-y-0.5 pl-1">
                    <NavLink
                      to={`/projects/${proj.id}/issues/new`}
                      onClick={handleLinkClick}
                      className={navItemClass}
                    >
                      <PlusCircle className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-white" />
                      <span>Add New</span>
                    </NavLink>

                    <NavLink
                      to={`/projects/${proj.id}/issues`}
                      onClick={handleLinkClick}
                      className={navItemClass}
                    >
                      <ListTodo className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-white" />
                      <span>All Issues</span>
                    </NavLink>

                    <NavLink
                      to={`/projects/${proj.id}/reports`}
                      onClick={handleLinkClick}
                      className={navItemClass}
                    >
                      <BarChart3 className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-white" />
                      <span>Report</span>
                    </NavLink>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Support Group Heading (NOT A LINK) */}
          <div className="space-y-1 pt-3 border-t border-gray-800">
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Support
            </div>
            <div className="space-y-0.5 pl-1">
              <NavLink to="/support/requests" onClick={handleLinkClick} className={navItemClass}>
                <PlusCircle className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-white" />
                <span>Requests</span>
              </NavLink>

              <NavLink to="/support/list" onClick={handleLinkClick} className={navItemClass}>
                <LifeBuoy className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-white" />
                <span>List</span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Bottom: My Business */}
      <div className="p-3 border-t border-gray-800 bg-gray-900/60">
        <NavLink
          to="/business"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            cn(
              'flex items-center justify-between rounded-md px-3 py-2 text-xs font-semibold transition-colors select-none',
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )
          }
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
              <Briefcase className="h-3 w-3" />
            </div>
            <span>My Business</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
        </NavLink>
      </div>
    </aside>
  );
}
