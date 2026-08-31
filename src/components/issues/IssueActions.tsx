import React, { useState } from 'react';
import { Issue, IssuePriority, User } from '../../types';
import { Button } from '../ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Tag, Edit3, UserCheck, Paperclip, Sparkles, X, Plus } from 'lucide-react';

interface IssueActionsProps {
  issue: Issue;
  currentUser: User;
  onUpdateIssue: (updates: Partial<Issue>, actionDescription?: string) => Promise<void>;
  onOpenUpload: () => void;
  canEdit: boolean;
}

export function IssueActions({
  issue,
  currentUser,
  onUpdateIssue,
  onOpenUpload,
  canEdit,
}: IssueActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLabelOpen, setIsLabelOpen] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState(issue.title);
  const [editDesc, setEditDesc] = useState(issue.description);
  const [editPriority, setEditPriority] = useState<IssuePriority>(issue.priority);
  const [labels, setLabels] = useState<string[]>(issue.labels || []);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      await onUpdateIssue(
        {
          title: editTitle,
          description: editDesc,
          priority: editPriority,
        },
        'Issue details updated'
      );
      setIsEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLabels = async () => {
    setSaving(true);
    try {
      await onUpdateIssue({ labels }, 'Labels updated');
      setIsLabelOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const addLabel = () => {
    if (!newLabelInput.trim()) return;
    const clean = newLabelInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!labels.includes(clean)) {
      setLabels([...labels, clean]);
    }
    setNewLabelInput('');
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {canEdit && (
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            setEditTitle(issue.title);
            setEditDesc(issue.description);
            setEditPriority(issue.priority);
            setIsEditOpen(true);
          }}
          className="gap-1.5"
        >
          <Edit3 className="h-3 w-3 text-slate-500" />
          Edit Details
        </Button>
      )}

      <Button
        variant="outline"
        size="xs"
        onClick={onOpenUpload}
        className="gap-1.5"
      >
        <Paperclip className="h-3 w-3 text-slate-500" />
        Attach Files
      </Button>

      {canEdit && (
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            setLabels(issue.labels || []);
            setIsLabelOpen(true);
          }}
          className="gap-1.5"
        >
          <Tag className="h-3 w-3 text-slate-500" />
          Manage Labels ({issue.labels?.length || 0})
        </Button>
      )}

      {/* Edit Details Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogClose onClose={() => setIsEditOpen(false)} />
        <DialogHeader>
          <DialogTitle>Edit Issue Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Issue Title</label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Priority</label>
            <Select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as IssuePriority)}
              className="text-xs"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </Select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Description (Markdown)</label>
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={6}
              className="text-xs font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveDetails} isLoading={saving}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Manage Labels Dialog */}
      <Dialog open={isLabelOpen} onOpenChange={setIsLabelOpen}>
        <DialogClose onClose={() => setIsLabelOpen(false)} />
        <DialogHeader>
          <DialogTitle>Manage Issue Labels</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-xs">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. checkout, safari, bug"
              value={newLabelInput}
              onChange={(e) => setNewLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLabel();
                }
              }}
              className="text-xs"
            />
            <Button type="button" size="xs" onClick={addLabel} className="shrink-0 gap-1">
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-12 p-2 rounded-lg border border-slate-200 bg-slate-50">
            {labels.map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs"
              >
                #{l}
                <button
                  type="button"
                  onClick={() => removeLabel(l)}
                  className="hover:text-rose-600 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {labels.length === 0 && (
              <span className="text-slate-400 text-xs italic">No labels added.</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsLabelOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveLabels} isLoading={saving}>
            Save Labels
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
