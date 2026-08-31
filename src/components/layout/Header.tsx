import React, { useState, useEffect } from 'react';
import { Project, User, Role } from '../../types';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { collaborationService } from '../../services/collaboration.service';
import {
  Menu,
  LayoutDashboard,
  LogOut,
  Shield,
  Layers,
  ChevronDown,
  Sparkles,
  ExternalLink,
  User as UserIcon,
  Check,
  Radio,
  Users,
  Play,
  Pause,
  Zap,
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';

interface HeaderProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (projectId: string) => void;
  currentUser: User | null;
  currentRole: Role;
  onSwitchRole: (role: Role) => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
}

export function Header({
  projects,
  currentProject,
  onSelectProject,
  currentUser,
  currentRole,
  onSwitchRole,
  onLogout,
  onToggleMobileMenu,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isSimActive, setIsSimActive] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setIsSimActive(collaborationService.isSimulationActive());
  }, []);

  const handleToggleSimulation = () => {
    const newState = collaborationService.toggle();
    setIsSimActive(newState);
  };

  const handleManualSimulate = async () => {
    setIsSimulating(true);
    try {
      await collaborationService.triggerManualSimulation(currentUser?.id);
    } finally {
      setTimeout(() => setIsSimulating(false), 600);
    }
  };

  const getRoleBadgeVariant = (r: Role) => {
    switch (r) {
      case 'Owner':
        return 'warning';
      case 'Admin':
        return 'destructive';
      case 'Manager':
        return 'info';
    }
  };

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    onSelectProject(selectedId);

    // If currently on an issue/report page, preserve route context with new project ID
    if (location.pathname.includes('/projects/')) {
      const match = location.pathname.match(/\/projects\/[^/]+\/(issues|reports)/);
      if (match) {
        navigate(`/projects/${selectedId}/${match[1]}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 shadow-xs">
      {/* Left Area: Mobile Menu + Project Context Switcher */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Dashboard Link */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors shrink-0"
        >
          <LayoutDashboard className="h-4 w-4 text-gray-500" />
          <span className="hidden sm:inline">Ops Dashboard</span>
        </Link>

        <span className="text-gray-300 hidden sm:inline">/</span>

        {/* Project Switcher */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-gray-400 hidden lg:inline whitespace-nowrap">
            Active Project:
          </span>
          <div className="w-44 sm:w-56">
            <Select
              value={currentProject?.id || projects[0]?.id || ''}
              onChange={handleProjectSelect}
              className="text-xs font-bold text-gray-900 bg-gray-50 border-gray-200 h-8 rounded"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Right Area: Role Matrix Switcher + Live Collab + Profile Menu */}
      <div className="flex items-center gap-2.5">
        {/* Live Multi-User Collaboration Simulator Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-1 text-emerald-800 text-[11px] font-medium shadow-2xs">
          <span className="relative flex h-2 w-2">
            {isSimActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isSimActive ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </span>
          <span className="font-bold text-[10px] tracking-wide text-emerald-900">
            {isSimActive ? 'Live Collab (4 Online)' : 'Collab Paused'}
          </span>

          <button
            type="button"
            onClick={handleManualSimulate}
            disabled={isSimulating}
            className="ml-1 flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors border border-emerald-200/60 cursor-pointer shadow-2xs disabled:opacity-50"
            title="Simulate a teammate updating an issue now"
          >
            <Zap className={`h-3 w-3 text-amber-600 ${isSimulating ? 'animate-bounce' : ''}`} />
            <span>{isSimulating ? 'Updating...' : 'Simulate Event'}</span>
          </button>
        </div>

        {/* Interactive Role Switcher Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded border border-gray-200 bg-gray-50/80 px-2 py-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Role:
          </span>
          <div className="flex items-center gap-1">
            {(['Owner', 'Admin', 'Manager'] as Role[]).map((r) => {
              const active = currentRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSwitchRole(r)}
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                  title={`Switch context to ${r}`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Avatar + Profile Dropdown Button */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 rounded p-1 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="rounded-full border border-gray-200 overflow-hidden">
                <Avatar
                  src={currentUser.avatarUrl}
                  name={currentUser.name}
                  size="sm"
                  status="online"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant={getRoleBadgeVariant(currentRole)} className="px-1 py-0 text-[10px] rounded">
                    {currentRole}
                  </Badge>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden md:block" />
            </button>

            {/* Profile Menu Popup */}
            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg z-50 animate-in fade-in-0 zoom-in-95 text-xs">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{currentUser.email}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{currentUser.department || 'Operations'}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/business');
                      }}
                      className="w-full flex items-center gap-2 rounded px-3 py-1.5 text-gray-700 hover:bg-gray-100 text-left font-medium"
                    >
                      <Shield className="h-3.5 w-3.5 text-gray-400" />
                      Business & Security
                    </button>
                  </div>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded px-3 py-1.5 text-rose-700 hover:bg-rose-50 text-left font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
