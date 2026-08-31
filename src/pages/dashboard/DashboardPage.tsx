import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { dashboardService } from '../../services/dashboard.service';
import { projectService } from '../../services/project.service';
import { issueService } from '../../services/issue.service';
import { ServerMetrics, Container, Deployment, Issue, Activity } from '../../types';
import { ServerStorageCard, ServerHealthCard } from '../../components/dashboard/ServerStorageCard';
import { NetworkUsageChart } from '../../components/dashboard/NetworkUsageChart';
import { LastDeployCard } from '../../components/dashboard/LastDeployCard';
import { ContainerList } from '../../components/dashboard/ContainerList';
import { RecentIssuesWidget, RecentActivityWidget } from '../../components/dashboard/RecentIssuesWidget';
import { LoadingState, ErrorState } from '../../components/ui/states';
import { Button } from '../../components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Progress } from '../../components/ui/progress';
import { Select } from '../../components/ui/select';
import { hasPermission } from '../../lib/permissions';
import {
  Rocket,
  RefreshCw,
  Server,
  Globe,
  GitBranch,
  Terminal,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const currentProject = useProjectStore((s) => s.currentProject);
  const projects = useProjectStore((s) => s.projects);
  const selectProject = useProjectStore((s) => s.selectProject);

  const [metrics, setMetrics] = useState<ServerMetrics | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [lastDeploy, setLastDeploy] = useState<Deployment | null>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual Deploy Modal state
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deployEnv, setDeployEnv] = useState<'production' | 'staging'>('production');
  const [deploying, setDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployProgress, setDeployProgress] = useState(0);

  const canDeploy = user ? user.role === 'Owner' || user.role === 'Admin' : false;

  const loadData = async (isBackground = false) => {
    if (!currentProject) return;
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const [m, c, d, issuesData, actData] = await Promise.all([
        dashboardService.getServerMetrics(currentProject.id),
        dashboardService.getContainers(currentProject.id),
        dashboardService.getLastDeployment(currentProject.id),
        issueService.getIssues(currentProject.id, { page: 1, limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' }),
        dashboardService.getRecentActivity(currentProject.id, 6),
      ]);
      setMetrics(m);
      setContainers(c);
      setLastDeploy(d);
      setRecentIssues(issuesData.issues);
      setRecentActivities(actData);
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message || 'Failed to fetch dashboard metrics');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentProject?.id]);

  useEffect(() => {
    const handleCollaborativeUpdate = () => {
      loadData(true);
    };
    window.addEventListener('commerceops:issue_updated', handleCollaborativeUpdate);
    return () => {
      window.removeEventListener('commerceops:issue_updated', handleCollaborativeUpdate);
    };
  }, [currentProject?.id]);

  const handleStartDeploy = async () => {
    if (!currentProject || !user) return;
    setDeploying(true);
    setDeployLogs(['[00:00:01] Initializing deployment pipeline for ' + currentProject.name + '...']);
    setDeployProgress(10);

    const logSteps = [
      { msg: '[00:00:02] Fetching repository HEAD commit...', prog: 25 },
      { msg: '[00:00:04] Building Docker artifacts for backend & dashboard...', prog: 50 },
      { msg: '[00:00:06] Running automated database migrations & health check...', prog: 75 },
      { msg: '[00:00:08] Applying zero-downtime rolling restart to pods...', prog: 90 },
      { msg: '[00:00:10] Deployment successful! Service operational at ' + currentProject.clientDomain, prog: 100 },
    ];

    for (const step of logSteps) {
      await new Promise((r) => setTimeout(r, 600));
      setDeployLogs((prev) => [...prev, step.msg]);
      setDeployProgress(step.prog);
    }

    // Call service to persist deployment and increment minor version
    const newDep = await dashboardService.triggerDeployment(currentProject.id, user);

    setLastDeploy(newDep);
    setDeploying(false);
    await loadData();
    setTimeout(() => {
      setDeployModalOpen(false);
      setDeployLogs([]);
      setDeployProgress(0);
    }, 1200);
  };

  if (!currentProject) {
    return <LoadingState message="Connecting to project telemetry..." />;
  }

  if (loading && !metrics) {
    return <LoadingState message={`Fetching operations data for ${currentProject.name}...`} />;
  }

  if (error) {
    return <ErrorState title="Dashboard Error" description={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {currentProject.name} Operations Hub
            </h1>
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {currentProject.code}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <Globe className="h-3.5 w-3.5 text-gray-400" />
              {currentProject.clientDomain}
            </span>
            <span>•</span>
            <span>Client: <strong className="text-gray-900 font-semibold">{currentProject.clientName}</strong></span>
            <span>•</span>
            <span className="font-mono">Backend: <strong>B{currentProject.backendVersion}</strong></span>
            <span>•</span>
            <span className="font-mono">Dashboard: <strong>D-{currentProject.dashboardVersion}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs text-gray-700 hover:bg-gray-50 border-gray-300 rounded"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          {canDeploy && (
            <Button
              size="sm"
              onClick={() => setDeployModalOpen(true)}
              className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs"
            >
              <Rocket className="h-3.5 w-3.5" />
              Deploy Release
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/projects/${currentProject.id}/issues/new`)}
            className="gap-1.5 text-xs text-gray-700 border-gray-300 rounded hover:bg-gray-50"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Issue
          </Button>
        </div>
      </div>

      {/* Top Telemetry Metric Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ServerStorageCard metrics={metrics} />
          <ServerHealthCard metrics={metrics} />
          <NetworkUsageChart metrics={metrics} />
          {lastDeploy && <LastDeployCard deployment={lastDeploy} />}
        </div>
      )}

      {/* Middle Section: Running Pods & Containers */}
      <div>
        <ContainerList containers={containers} />
      </div>

      {/* Bottom Section: Recent Issues & Operations Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RecentIssuesWidget issues={recentIssues} projectId={currentProject.id} />
        </div>
        <div className="lg:col-span-5">
          <RecentActivityWidget activities={recentActivities} />
        </div>
      </div>

      {/* Trigger Deployment Modal */}
      <Dialog open={deployModalOpen} onOpenChange={setDeployModalOpen}>
        <DialogClose onClose={() => !deploying && setDeployModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>Deploy New Build</DialogTitle>
          <DialogDescription>
            Trigger an automated build and zero-downtime rolling update for{' '}
            <strong>{currentProject.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Target Environment
            </label>
            <Select
              value={deployEnv}
              onChange={(e) => setDeployEnv(e.target.value as any)}
              disabled={deploying}
              className="text-xs rounded border-gray-200"
            >
              <option value="production">Production (High Availability)</option>
              <option value="staging">Staging (Preview Branch)</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-gray-200 bg-gray-50 p-2.5">
              <span className="text-[10px] uppercase font-bold text-gray-400">Current Versions</span>
              <p className="font-mono font-bold text-gray-800 mt-0.5">
                B{currentProject.backendVersion} / D-{currentProject.dashboardVersion}
              </p>
            </div>
            <div className="rounded border border-blue-200 bg-blue-50/50 p-2.5">
              <span className="text-[10px] uppercase font-bold text-blue-600">New Target Version</span>
              <p className="font-mono font-bold text-blue-950 mt-0.5">
                B2.8.15 / D-4.12.3
              </p>
            </div>
          </div>

          {deploying && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-700">
                <span>Build Progress</span>
                <span>{deployProgress}%</span>
              </div>
              <Progress value={deployProgress} className="h-2" />
            </div>
          )}

          {deployLogs.length > 0 && (
            <div className="rounded bg-gray-950 p-3 font-mono text-[11px] text-emerald-400 space-y-1 max-h-40 overflow-y-auto">
              {deployLogs.map((l, i) => (
                <p key={i} className="leading-tight">
                  {l}
                </p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeployModalOpen(false)}
            disabled={deploying}
            className="rounded"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleStartDeploy}
            disabled={deploying}
            isLoading={deploying}
            className="gap-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Rocket className="h-3.5 w-3.5" />
            {deploying ? 'Deploying...' : 'Start Deployment'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
