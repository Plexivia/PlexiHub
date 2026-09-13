import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportService } from '../../services/support.service';
import { useAuthStore } from '../../stores/authStore';
import { SupportRequest, SupportFilterParams } from '../../types';
import { SupportRequestTable } from '../../components/support/SupportRequestTable';
import { SupportStatusBadge, SupportCategoryBadge } from '../../components/support/SupportBadges';
import { IssuePriorityBadge } from '../../components/issues/IssuePriorityBadge';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/states';
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { AttachmentList } from '../../components/issues/AttachmentList';
import { formatDate, formatDateTime, formatTime } from '../../lib/utils';
import { PlusCircle, Search, RotateCcw, RefreshCw, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export function SupportListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<SupportFilterParams>({
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    status: 'all',
    category: 'all',
    search: '',
  });

  // Selected request for detail dialog
  const [selectedReq, setSelectedReq] = useState<SupportRequest | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supportService.getRequests(filters);
      setRequests(res.requests);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [JSON.stringify(filters)]);

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      status: 'all',
      category: 'all',
      search: '',
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !user || !newComment.trim() || commenting) return;
    setCommenting(true);
    try {
      const updated = await supportService.addComment(selectedReq.id, newComment.trim(), user);
      setSelectedReq(updated);
      setNewComment('');
      fetchRequests();
    } finally {
      setCommenting(false);
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    if (!selectedReq || !user) return;
    const updated = await supportService.updateRequestStatus(selectedReq.id, newStatus, user);
    setSelectedReq(updated);
    fetchRequests();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Operations Support & Service Desk
            </h1>
            <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              {total}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Client escalations, domain configuration requests, and infrastructure support tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            className="gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/support/requests')}
            className="gap-1.5 text-xs shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Request
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by ID (SUP-001), subject, or requester..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="text-xs h-9 min-w-[130px]"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting">Waiting</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </Select>

          <Select
            value={filters.category || 'all'}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            className="text-xs h-9 min-w-[140px]"
          >
            <option value="all">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Deployment">Deployment</option>
            <option value="Server">Server</option>
            <option value="Domain">Domain</option>
            <option value="Billing">Billing</option>
            <option value="General">General</option>
          </Select>

          {(filters.search || filters.status !== 'all' || filters.category !== 'all') && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-900 gap-1 h-9 px-2.5"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Main Table / Cards */}
      {loading ? (
        <LoadingState message="Loading support tickets..." />
      ) : error ? (
        <ErrorState title="Error" description={error} onRetry={fetchRequests} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No support requests found"
          description="Submit a new support ticket or adjust active search filters."
          actionLabel="Submit Request"
          onAction={() => navigate('/support/requests')}
        />
      ) : (
        <SupportRequestTable
          requests={requests}
          total={total}
          filters={filters}
          onFilterChange={setFilters}
          onRowClick={(req) => {
            supportService.markAsRead(req.id);
            setSelectedReq(req);
          }}
        />
      )}

      {/* Request Detail Dialog */}
      {selectedReq && (
        <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
          <DialogClose onClose={() => setSelectedReq(null)} />
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {selectedReq.id}
              </span>
              <SupportCategoryBadge category={selectedReq.category} />
              <IssuePriorityBadge priority={selectedReq.priority} size="sm" />
            </div>
            <DialogTitle className="text-base mt-1">{selectedReq.subject}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
            {/* Status Selector Bar */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <Avatar src={selectedReq.requestedBy.avatarUrl} name={selectedReq.requestedBy.name} size="xs" />
                <div>
                  <p className="font-semibold text-slate-900">{selectedReq.requestedBy.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Opened on {formatDate(selectedReq.createdAt)} at {formatTime(selectedReq.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500">Status:</span>
                <Select
                  value={selectedReq.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs h-8 w-32"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400">
                Ticket Description
              </label>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line text-xs">
                {selectedReq.description}
              </p>
            </div>

            {/* Attachments */}
            {selectedReq.attachments && selectedReq.attachments.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400">
                  Attachments
                </label>
                <AttachmentList attachments={selectedReq.attachments} />
              </div>
            )}

            {/* Discussion Comments */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <span>Discussion History ({selectedReq.comments?.length || 0})</span>
              </div>

              <div className="space-y-2">
                {selectedReq.comments && selectedReq.comments.length > 0 ? (
                  selectedReq.comments.map((comm) => (
                    <div key={comm.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Avatar src={comm.author.avatarUrl} name={comm.author.name} size="xs" />
                          <span className="font-semibold text-slate-900">{comm.author.name}</span>
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">{comm.author.role}</Badge>
                        </div>
                        <span className="text-[10px] text-slate-400">{formatDate(comm.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-700 pl-6">{comm.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-xs">No comments yet.</p>
                )}
              </div>

              {/* Add Comment Input */}
              {user && (
                <form onSubmit={handleAddComment} className="pt-2 space-y-2">
                  <Textarea
                    placeholder="Write a reply or update on this support ticket..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="xs"
                      disabled={!newComment.trim() || commenting}
                      isLoading={commenting}
                      className="gap-1.5"
                    >
                      <Send className="h-3 w-3" /> Reply
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
