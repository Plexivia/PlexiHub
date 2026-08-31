import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Drawer } from '../ui/drawer';
import { GlobalToaster } from '../common/GlobalToaster';
import { AiChatbot } from '../chat/AiChatbot';
import { useAuthStore } from '../../stores/authStore';
import { useProjectStore } from '../../stores/projectStore';
import { useTenantStore } from '../../stores/tenantStore';
import { useRole } from '../../hooks/useRole';

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { role, switchRole } = useRole();

  const projects = useProjectStore((s) => s.projects);
  const currentProject = useProjectStore((s) => s.currentProject);
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const selectProject = useProjectStore((s) => s.selectProject);
  const loadProjects = useProjectStore((s) => s.loadProjects);

  const tenant = useTenantStore((s) => s.tenant);
  const loadTenant = useTenantStore((s) => s.loadTenant);

  useEffect(() => {
    loadProjects();
    loadTenant();
  }, [loadProjects, loadTenant]);

  // Sync project context if route has :projectId
  useEffect(() => {
    const match = location.pathname.match(/\/projects\/([^/]+)/);
    if (match && match[1] && match[1] !== currentProjectId) {
      selectProject(match[1]);
    }
  }, [location.pathname, currentProjectId, selectProject]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F3F4F6] text-gray-900 font-sans text-[13px] leading-tight">
      {/* Global Real-Time Collaborative Notification System */}
      <GlobalToaster />

      {/* Desktop Sidebar (fixed left, 240px wide) */}
      <div className="hidden md:flex md:w-[240px] md:shrink-0">
        <Sidebar
          tenant={tenant}
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={selectProject}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        side="left"
        className="w-64 p-0 bg-[#111827]"
      >
        <Sidebar
          tenant={tenant}
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={selectProject}
          onNavigateMobile={() => setMobileMenuOpen(false)}
        />
      </Drawer>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          projects={projects}
          currentProject={currentProject}
          onSelectProject={selectProject}
          currentUser={user}
          currentRole={role}
          onSwitchRole={switchRole}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Gemini AI Operations Copilot */}
      <AiChatbot />
    </div>
  );
}
