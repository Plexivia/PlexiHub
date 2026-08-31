import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { supportService } from '../../services/support.service';
import { Attachment, IssuePriority, SupportCategory } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { FileUploadModal } from '../../components/issues/FileUploadModal';
import { AttachmentList } from '../../components/issues/AttachmentList';
import { ArrowLeft, Send, Paperclip, AlertCircle, HelpCircle } from 'lucide-react';

export function SupportCreatePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const currentProject = useProjectStore((s) => s.currentProject);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportCategory>('Technical');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [projectId, setProjectId] = useState<string>(currentProject?.id || 'proj_1');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (subject.trim().length < 5) {
      setError('Please provide a descriptive subject (at least 5 characters).');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please provide details for the support request (at least 10 characters).');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await supportService.createRequest({
        subject: subject.trim(),
        category,
        priority,
        projectId,
        description: description.trim(),
        requestedBy: user,
        attachments,
      });

      navigate('/support/list');
    } catch (err: any) {
      setError(err.message || 'Failed to submit support request');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => navigate('/support/list')}
          className="text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Submit Support Request
          </h1>
          <p className="text-xs text-slate-500">
            Escalate infrastructure questions, client domain issues, or billing inquiries.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-6 space-y-5">
            {/* Category & Priority & Project */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category
                </label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportCategory)}
                  className="text-xs font-medium"
                >
                  <option value="Technical">Technical</option>
                  <option value="Deployment">Deployment</option>
                  <option value="Server">Server</option>
                  <option value="Domain">Domain</option>
                  <option value="Billing">Billing</option>
                  <option value="General">General</option>
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
                  Related Project
                </label>
                <Select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="text-xs font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Need CNAME and TXT verification records for custom storefront domain"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="text-xs font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Explanation <span className="text-rose-500">*</span>
              </label>
              <Textarea
                placeholder="Describe your request, requirements, or any error messages you are encountering..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
                className="text-xs"
              />
            </div>

            {/* Attachments */}
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
                  <Paperclip className="h-3 w-3" /> Add Screenshots / Files
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
              onClick={() => navigate('/support/list')}
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
              <Send className="h-3.5 w-3.5" />
              Submit Ticket
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
