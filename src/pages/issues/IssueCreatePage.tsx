import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { projectService } from '../../services/project.service';
import { issueService } from '../../services/issue.service';
import { Attachment, IssuePriority, User } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { FileUploadModal } from '../../components/issues/FileUploadModal';
import { AttachmentList } from '../../components/issues/AttachmentList';
import { ArrowLeft, Sparkles, Paperclip, Plus, Eye, Edit3, X, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function IssueCreatePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const currentProject = useProjectStore((s) => s.currentProject);
  const selectProject = useProjectStore((s) => s.selectProject);

  const activeProjectId = projectId || currentProject?.id || 'proj_1';

  const [previewIssueId, setPreviewIssueId] = useState<string>('...');
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  // Form State
  const [selectedProjId, setSelectedProjId] = useState(activeProjectId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [assigneeId, setAssigneeId] = useState<string>('unassigned');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>(['bug']);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load projected next ID & members
  useEffect(() => {
    async function init() {
      if (selectedProjId) {
        const nextId = await projectService.generateNextIssueId(selectedProjId);
        setPreviewIssueId(nextId);
        const members = await issueService.getTeamMembers(selectedProjId);
        setTeamMembers(members);
      }
    }
    init();
  }, [selectedProjId]);

  const handleAddLabel = () => {
    if (!labelInput.trim()) return;
    const clean = labelInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!labels.includes(clean)) {
      setLabels([...labels, clean]);
    }
    setLabelInput('');
  };

  const handleRemoveLabel = (lbl: string) => {
    setLabels(labels.filter((l) => l !== lbl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (title.trim().length < 5) {
      setError('Please provide a descriptive title (at least 5 characters).');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please provide diagnostic reproduction steps or description (at least 10 characters).');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const selectedAssignee =
        assigneeId !== 'unassigned' ? teamMembers.find((m) => m.id === assigneeId) : undefined;

      const created = await issueService.createIssue(selectedProjId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        createdBy: user,
        assignee: selectedAssignee,
        labels,
        attachments,
      });

      navigate(`/projects/${selectedProjId}/issues/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create issue');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate(`/projects/${selectedProjId}/issues`)}
            className="text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Create New Operations Issue
            </h1>
            <p className="text-xs text-slate-500">
              Log an incident, operational bug, or infrastructure task.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Assigned Serial:</span>
          <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
            {previewIssueId}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-6 space-y-5">
            {/* Project & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Project
                </label>
                <Select
                  value={selectedProjId}
                  onChange={(e) => {
                    setSelectedProjId(e.target.value);
                    selectProject(e.target.value);
                  }}
                  className="text-xs font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Priority
                </label>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IssuePriority)}
                  className="text-xs font-medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assignee
                </label>
                <Select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="text-xs font-medium"
                >
                  <option value="unassigned">Unassigned (Triage Pool)</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Issue Title <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. 500 error on checkout webhook for Apple Pay orders"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-xs font-medium"
              />
            </div>

            {/* Description with Markdown toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Description / Reproduction Steps <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewMarkdown(!previewMarkdown)}
                  className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-800 font-medium cursor-pointer"
                >
                  {previewMarkdown ? (
                    <>
                      <Edit3 className="h-3 w-3" /> Edit Raw Markdown
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" /> Preview Render
                    </>
                  )}
                </button>
              </div>

              {previewMarkdown ? (
                <div className="min-h-[160px] rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-xs prose prose-slate max-w-none">
                  {description ? (
                    <ReactMarkdown>{description}</ReactMarkdown>
                  ) : (
                    <p className="text-slate-400 italic">No description entered yet.</p>
                  )}
                </div>
              ) : (
                <Textarea
                  placeholder={`### Summary\nExplain the observed symptom or issue.\n\n### Steps to Reproduce\n1. Navigate to /checkout\n2. Select payment method...\n\n### Expected vs Actual\nExpected HTTP 200 OK, got HTTP 500 Internal Server Error.`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="text-xs font-mono"
                />
              )}
            </div>

            {/* Labels Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Labels & Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Type a label (e.g. backend, payments, urgent) and press Enter"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                  className="text-xs"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddLabel} className="shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-8">
                {labels.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                  >
                    #{l}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(l)}
                      className="hover:text-rose-600 ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Attachments ({attachments.length})
                </label>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => setUploadModalOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <Paperclip className="h-3 w-3" /> Add Files / Logs
                </Button>
              </div>

              <AttachmentList
                attachments={attachments}
                canEdit={true}
                onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/projects/${selectedProjId}/issues`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={submitting}
              className="gap-1.5 font-semibold shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Create Issue ({previewIssueId})
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* File Upload Modal */}
      {user && (
        <FileUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          currentUser={user}
          onUploadComplete={(newAtts) => setAttachments((prev) => [...prev, ...newAtts])}
        />
      )}
    </div>
  );
}
