import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { issueService } from '../../services/issue.service';
import { Issue, IssueStatus, User, Attachment, Activity } from '../../types';
import { IssueStatusBadge } from '../../components/issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../../components/issues/IssuePriorityBadge';
import { IssueInfoPanel } from '../../components/issues/IssueInfoPanel';
import { IssueActions } from '../../components/issues/IssueActions';
import { AttachmentList } from '../../components/issues/AttachmentList';
import { IssueCommentBox } from '../../components/issues/IssueCommentBox';
import { ActivityTimeline } from '../../components/issues/ActivityTimeline';
import { FileUploadModal } from '../../components/issues/FileUploadModal';
import { LoadingState, ErrorState } from '../../components/ui/states';
import { Button } from '../../components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { ArrowLeft, MessageSquare, History, Paperclip, ChevronRight, Sparkles, Bot, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { hasPermission } from '../../lib/permissions';

export function IssueDetailPage() {
  const { projectId, issueId } = useParams<{ projectId: string; issueId: string }>();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const currentProject = useProjectStore((s) => s.currentProject);
  const selectProject = useProjectStore((s) => s.selectProject);

  const [issue, setIssue] = useState<Issue | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Gemini RCA Analysis State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedRca, setCopiedRca] = useState(false);

  const canEdit = user ? hasPermission(user.role, 'issue', 'edit') : false;

  const loadIssue = async (isBackground = false) => {
    if (!projectId || !issueId) return;
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const [data, members, acts] = await Promise.all([
        issueService.getIssueById(projectId, issueId),
        issueService.getTeamMembers(projectId),
        issueService.getActivitiesForIssue(issueId),
      ]);
      setIssue(data);
      setTeamMembers(members);
      setActivities(acts);
      if (projectId !== currentProject?.id) {
        selectProject(projectId);
      }
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message || 'Failed to load issue details');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadIssue();
  }, [projectId, issueId]);

  // Real-time collaborative update listener
  useEffect(() => {
    const handleCollaborativeUpdate = (e: any) => {
      const targetIssueId = e?.detail?.issueId;
      if (!targetIssueId || targetIssueId.toUpperCase() === issueId?.toUpperCase()) {
        loadIssue(true);
      }
    };

    window.addEventListener('commerceops:issue_updated', handleCollaborativeUpdate);
    return () => {
      window.removeEventListener('commerceops:issue_updated', handleCollaborativeUpdate);
    };
  }, [projectId, issueId]);

  const handleRunAiAnalysis = async () => {
    if (!issue) return;
    setAiModalOpen(true);
    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue }),
      });
      const data = await res.json();
      setAiAnalysis(data.analysis || 'No analysis generated.');
    } catch (err: any) {
      setAiAnalysis(`⚠️ **Analysis failed**: ${err.message || 'Check server connection'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: IssueStatus) => {
    if (!issue || !user || !projectId) return;
    try {
      const updated = await issueService.updateIssueStatus(projectId, issue.id, newStatus, user);
      setIssue(updated);
      const acts = await issueService.getActivitiesForIssue(issue.id);
      setActivities(acts);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    if (!issue || !user || !projectId) return;
    try {
      const updated = await issueService.updateIssueAssignee(
        projectId,
        issue.id,
        assigneeId === 'unassigned' ? null : assigneeId,
        user
      );
      setIssue(updated);
      const acts = await issueService.getActivitiesForIssue(issue.id);
      setActivities(acts);
    } catch (err: any) {
      alert(err.message || 'Failed to update assignee');
    }
  };

  const handleUpdateIssue = async (updates: Partial<Issue>, actionDesc?: string) => {
    if (!issue || !user || !projectId) return;
    try {
      const updated = await issueService.updateIssue(projectId, issue.id, updates, user, actionDesc);
      setIssue(updated);
      const acts = await issueService.getActivitiesForIssue(issue.id);
      setActivities(acts);
    } catch (err: any) {
      alert(err.message || 'Failed to update issue');
    }
  };

  const handleAddComment = async (content: string) => {
    if (!issue || !user || !projectId) return;
    const newComment = await issueService.addComment(projectId, issue.id, content, user);
    setIssue({
      ...issue,
      comments: [...(issue.comments || []), newComment],
    });
    const acts = await issueService.getActivitiesForIssue(issue.id);
    setActivities(acts);
  };

  const handleUploadComplete = async (newAttachments: Attachment[]) => {
    if (!issue || !user || !projectId) return;
    const currentAtts = issue.attachments || [];
    const updated = await issueService.updateIssue(
      projectId,
      issue.id,
      { attachments: [...currentAtts, ...newAttachments] },
      user,
      `Uploaded ${newAttachments.length} attachment(s)`
    );
    setIssue(updated);
    const acts = await issueService.getActivitiesForIssue(issue.id);
    setActivities(acts);
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!issue || !user || !projectId) return;
    const updatedAtts = (issue.attachments || []).filter((a) => a.id !== attachmentId);
    const updated = await issueService.updateIssue(
      projectId,
      issue.id,
      { attachments: updatedAtts },
      user,
      'Removed an attachment'
    );
    setIssue(updated);
    const acts = await issueService.getActivitiesForIssue(issue.id);
    setActivities(acts);
  };

  if (loading) {
    return <LoadingState message="Loading issue details..." />;
  }

  if (error || !issue || !currentProject) {
    return (
      <ErrorState
        title="Issue Not Found"
        description={error || `Could not locate issue ID ${issueId} in project ${projectId}.`}
        onRetry={loadIssue}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/projects/${projectId}/issues`}
            className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Issues</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-700">{currentProject.name}</span>
          <span className="text-gray-300">/</span>
          <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
            {issue.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <IssueStatusBadge status={issue.status} size="sm" />
          <IssuePriorityBadge priority={issue.priority} size="sm" />
        </div>
      </div>

      {/* Main 2-Column Responsive Layout (Jira Simplified Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (70% - Issues Core Content) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Title & Action Bar Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  {issue.id}
                </span>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleRunAiAnalysis}
                  className="gap-1.5 border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100 hover:text-blue-900 font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  <span>AI Root Cause Analysis</span>
                </Button>
              </div>

              {user && (
                <IssueActions
                  issue={issue}
                  currentUser={user}
                  onUpdateIssue={handleUpdateIssue}
                  onOpenUpload={() => setUploadModalOpen(true)}
                  canEdit={canEdit}
                />
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-snug">
              {issue.title}
            </h1>

            {/* Labels Chips */}
            {issue.labels && issue.labels.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {issue.labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 font-mono"
                  >
                    #{lbl}
                  </span>
                ))}
              </div>
            )}

            {/* Markdown Description */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2 mb-3">
                Description & Reproduction Details
              </label>
              <div className="prose prose-sm max-w-none text-xs text-gray-800 leading-relaxed bg-gray-50/70 rounded border border-gray-100 p-4">
                <ReactMarkdown>{issue.description}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-gray-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Attachments & Diagnostic Assets ({issue.attachments?.length || 0})
                </h3>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setUploadModalOpen(true)}
                className="gap-1 text-xs"
              >
                Upload Files
              </Button>
            </div>

            <AttachmentList
              attachments={issue.attachments || []}
              onRemove={handleRemoveAttachment}
              canEdit={canEdit}
            />
          </div>

          {/* Comments & Discussion */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Activity & Discussion ({issue.comments?.length || 0})
              </h3>
            </div>

            {user && (
              <IssueCommentBox
                comments={issue.comments || []}
                currentUser={user}
                onAddComment={handleAddComment}
              />
            )}
          </div>

          {/* Activity Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <History className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Issue Lifecycle Log ({activities.length})
              </h3>
            </div>
            <ActivityTimeline activities={activities} maxInitial={5} />
          </div>
        </div>

        {/* RIGHT COLUMN (30% - Sticky 100vh Information Panel) */}
        <div className="lg:col-span-4">
          {user && (
            <IssueInfoPanel
              issue={issue}
              project={currentProject}
              currentUser={user}
              onStatusChange={handleStatusChange}
              onAssigneeChange={handleAssigneeChange}
              teamMembers={teamMembers}
              canEdit={canEdit}
            />
          )}
        </div>
      </div>

      {/* File Upload Modal */}
      {user && (
        <FileUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          currentUser={user}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Gemini AI Root Cause Analysis Modal Dialog */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogClose onClose={() => setAiModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>CommerceOps AI — Incident Root Cause Analysis</DialogTitle>
          <DialogDescription>
            Automated diagnostic analysis and SLA remediation plan for {issue.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-xs font-bold">{issue.title}</p>
                <p className="text-[10px] text-slate-400">
                  Priority: {issue.priority} | Current Status: {issue.status}
                </p>
              </div>
            </div>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-mono text-blue-300 border border-blue-400/30">
              gemini-3.7-flash
            </span>
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Sparkles className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-700">
                Gemini is synthesizing telemetry, logs & architecture state...
              </p>
            </div>
          ) : aiAnalysis ? (
            <div className="relative rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-800 leading-relaxed max-h-[50vh] overflow-y-auto">
              <div className="prose prose-xs max-w-none">
                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            {aiAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(aiAnalysis);
                  setCopiedRca(true);
                  setTimeout(() => setCopiedRca(false), 2000);
                }}
                className="gap-1.5 text-xs"
              >
                {copiedRca ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedRca ? 'Copied RCA' : 'Copy Analysis'}</span>
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => setAiModalOpen(false)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={handleRunAiAnalysis}
                disabled={aiLoading}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Re-Analyze</span>
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
