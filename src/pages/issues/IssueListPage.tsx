import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { issueService } from '../../services/issue.service';
import { Issue, IssueFilterParams, User } from '../../types';
import { IssueTable } from '../../components/issues/IssueTable';
import { IssueFilters } from '../../components/issues/IssueFilters';
import { MobileIssueCard } from '../../components/issues/MobileIssueCard';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/states';
import { Button } from '../../components/ui/button';
import { PlusCircle, Download, FileSpreadsheet, RefreshCw } from 'lucide-react';

export function IssueListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);
  const currentProject = useProjectStore((s) => s.currentProject);
  const selectProject = useProjectStore((s) => s.selectProject);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [total, setTotal] = useState(0);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<IssueFilterParams>({
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    status: 'all',
    priority: 'all',
    assigneeId: 'all',
    search: '',
  });

  const activeProjectId = projectId || currentProject?.id || 'proj_1';

  // Ensure project store has this project selected
  useEffect(() => {
    if (activeProjectId && activeProjectId !== currentProject?.id) {
      selectProject(activeProjectId);
    }
  }, [activeProjectId, currentProject?.id, selectProject]);

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

  const handleClearFilters = () => {
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

      {/* Filter Toolbar */}
      <IssueFilters
        filters={filters}
        onChange={setFilters}
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
              onFilterChange={setFilters}
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
