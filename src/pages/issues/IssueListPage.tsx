import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { issueService } from '../../services/issue.service';
import { Issue, IssueFilterParams, User, IssueStatus } from '../../types';
import { IssueTable } from '../../components/issues/IssueTable';
import { IssueFilters } from '../../components/issues/IssueFilters';
import { MobileIssueCard } from '../../components/issues/MobileIssueCard';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/states';
import { Button } from '../../components/ui/button';
import {
  PlusCircle,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Circle,
  PlayCircle,
  CheckCircle2,
  ListFilter,
  Layers,
  Flame,
  AlertTriangle,
} from 'lucide-react';

export function IssueListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const projects = useProjectStore((s) => s.projects);
  const currentProject = useProjectStore((s) => s.currentProject);
  const selectProject = useProjectStore((s) => s.selectProject);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [total, setTotal] = useState(0);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [statusCounts, setStatusCounts] = useState<{
    all: number;
    open: number;
    inProgress: number;
    resolved: number;
  }>({ all: 0, open: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read status from URL search params
  const urlStatusParam = searchParams.get('status') || 'all';

  const [filters, setFilters] = useState<IssueFilterParams>({
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    status: urlStatusParam,
    priority: 'all',
    assigneeId: 'all',
    search: '',
  });

  const activeProjectId = projectId || currentProject?.id || 'proj_1';

  // Keep filters.status synchronized when URL search params change
  useEffect(() => {
    const currentUrlStatus = searchParams.get('status') || 'all';
    if (filters.status !== currentUrlStatus) {
      setFilters((prev) => ({
        ...prev,
        status: currentUrlStatus,
        page: 1,
      }));
    }
  }, [searchParams]);

  // Ensure project store has this project selected
  useEffect(() => {
    if (activeProjectId && activeProjectId !== currentProject?.id) {
      selectProject(activeProjectId);
    }
  }, [activeProjectId, currentProject?.id, selectProject]);

  const fetchStatusCounts = async () => {
    try {
      const counts = await issueService.getStatusCounts(activeProjectId);
      setStatusCounts({
        all: counts.all,
        open: counts.open,
        inProgress: counts.inProgress,
        resolved: counts.resolved,
      });
    } catch (e) {
      console.error('Error loading status counts', e);
    }
  };

  const fetchIssues = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const [issueData, members] = await Promise.all([
        issueService.getIssues(activeProjectId, filters),
        issueService.getTeamMembers(activeProjectId),
      ]);
      setIssues(issueData.issues);
      setTotal(issueData.total);
      setTeamMembers(members);
      fetchStatusCounts();
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message || 'Failed to retrieve issues list');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [activeProjectId, JSON.stringify(filters)]);

  // Live real-time collaboration updates listener
  useEffect(() => {
    const handleCollaborativeUpdate = () => {
      fetchIssues(true);
    };

    window.addEventListener('commerceops:issue_updated', handleCollaborativeUpdate);
    return () => {
      window.removeEventListener('commerceops:issue_updated', handleCollaborativeUpdate);
    };
  }, [activeProjectId, JSON.stringify(filters)]);

  // Handler for changing filters and synchronizing status with URL search params
  const handleFilterChange = (newFilters: IssueFilterParams) => {
    setFilters(newFilters);

    // Sync status with URL search parameters
    const newParams = new URLSearchParams(searchParams);
    if (newFilters.status && newFilters.status !== 'all') {
      newParams.set('status', newFilters.status);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams, { replace: true });
  };

  // Quick toggle status handler that updates URL search params and filters state
  const handleQuickStatusToggle = (statusKey: 'all' | 'Open' | 'In Progress' | 'Resolved') => {
    const newParams = new URLSearchParams(searchParams);
    if (statusKey === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', statusKey);
    }
    setSearchParams(newParams, { replace: true });
    setFilters((prev) => ({
      ...prev,
      status: statusKey,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('status');
    setSearchParams(newParams, { replace: true });

    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      status: 'all',
      priority: 'all',
      assigneeId: 'all',
      search: '',
    });
  };

  const handleExportCSV = () => {
    if (issues.length === 0) return;
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Created By', 'Created At', 'Updated At'];
    const rows = issues.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.status,
      i.priority,
      i.assignee?.name || 'Unassigned',
      i.createdBy.name,
      i.createdAt,
      i.updatedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentProject?.code || 'Issues'}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              {currentProject?.name || 'Project'} Issues
            </h1>
            <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              {total}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational triage, bug tracker, and deployment issue tracking for {currentProject?.clientName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={issues.length === 0}
            className="gap-1.5 text-xs"
            title="Export CSV"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-slate-500" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchIssues()}
            className="gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => navigate(`/projects/${activeProjectId}/issues/new`)}
            className="gap-1.5 text-xs shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Create Issue
          </Button>
        </div>
      </div>

      {/* Status Quick Toggle Filter Bar synchronized with URL search params */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-1.5 sm:p-2 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5" role="tablist" aria-label="Status filters">
          {/* All Issues Toggle */}
          <button
            type="button"
            role="tab"
            aria-selected={!filters.status || filters.status === 'all'}
            onClick={() => handleQuickStatusToggle('all')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !filters.status || filters.status === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <span>All Issues</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                !filters.status || filters.status === 'all'
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {statusCounts.all}
            </span>
          </button>

          {/* Open Status Toggle */}
          <button
            type="button"
            role="tab"
            aria-selected={filters.status === 'Open'}
            onClick={() => handleQuickStatusToggle('Open')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filters.status === 'Open'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-xs font-bold ring-1 ring-rose-200'
                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50/60'
            }`}
          >
            <Circle className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
            <span>Open</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                filters.status === 'Open'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {statusCounts.open}
            </span>
          </button>

          {/* In Progress Status Toggle */}
          <button
            type="button"
            role="tab"
            aria-selected={filters.status === 'In Progress'}
            onClick={() => handleQuickStatusToggle('In Progress')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filters.status === 'In Progress'
                ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs font-bold ring-1 ring-amber-200'
                : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/60'
            }`}
          >
            <PlayCircle className="h-3.5 w-3.5 text-amber-600 fill-amber-500/20" />
            <span>In Progress</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                filters.status === 'In Progress'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {statusCounts.inProgress}
            </span>
          </button>

          {/* Resolved Status Toggle */}
          <button
            type="button"
            role="tab"
            aria-selected={filters.status === 'Resolved'}
            onClick={() => handleQuickStatusToggle('Resolved')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filters.status === 'Resolved'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs font-bold ring-1 ring-emerald-200'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Resolved</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                filters.status === 'Resolved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {statusCounts.resolved}
            </span>
          </button>
        </div>

        {/* Current URL Sync indicator */}
        {filters.status && filters.status !== 'all' && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pr-2">
            <span>Filtered by:</span>
            <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
              status={filters.status}
            </span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <IssueFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        teamMembers={teamMembers}
      />

      {/* Issue Table Content */}
      {loading ? (
        <LoadingState message="Loading issues..." />
      ) : error ? (
        <ErrorState title="Unable to load issues" description={error} onRetry={fetchIssues} />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No issues found"
          description="Try adjusting your filter parameters or create a new issue for this project."
          actionLabel="Create New Issue"
          onAction={() => navigate(`/projects/${activeProjectId}/issues/new`)}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <IssueTable
              issues={issues}
              total={total}
              filters={filters}
              onFilterChange={handleFilterChange}
              onRowClick={(issue) => navigate(`/projects/${activeProjectId}/issues/${issue.id}`)}
            />
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {issues.map((issue) => (
              <MobileIssueCard
                key={issue.id}
                issue={issue}
                onClick={() => navigate(`/projects/${activeProjectId}/issues/${issue.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
