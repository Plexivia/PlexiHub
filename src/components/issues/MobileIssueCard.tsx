import React from 'react';
import { Issue } from '../../types';
import { IssueStatusBadge } from './IssueStatusBadge';
import { IssuePriorityBadge } from './IssuePriorityBadge';
import { Avatar } from '../ui/avatar';
import { formatRelativeTime, formatDate } from '../../lib/utils';
import { Paperclip, MessageSquare, ChevronRight } from 'lucide-react';

interface MobileIssueCardProps {
  issue: Issue;
  onClick: () => void;
}

export function MobileIssueCard({ issue, onClick }: MobileIssueCardProps) {
  const isCritical = issue.priority === 'Critical';
  const isHigh = issue.priority === 'High';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 shadow-2xs active:bg-slate-50 transition-all cursor-pointer space-y-3 ${
        isCritical
          ? 'border-rose-300 bg-rose-50/20 border-l-4 border-l-rose-600 hover:border-rose-400'
          : isHigh
          ? 'border-amber-300 bg-amber-50/20 border-l-4 border-l-amber-500 hover:border-amber-400'
          : 'border-slate-200 bg-white border-l-4 border-l-transparent hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
            {issue.id}
          </span>
          <IssuePriorityBadge priority={issue.priority} size="sm" />
        </div>
        <IssueStatusBadge status={issue.status} size="sm" />
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
          {issue.title}
        </h4>
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {issue.labels.slice(0, 3).map((l) => (
              <span key={l} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                #{l}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          {issue.assignee ? (
            <div className="flex items-center gap-1.5" title={`Assignee: ${issue.assignee.name}`}>
              <Avatar src={issue.assignee.avatarUrl} name={issue.assignee.name} size="xs" />
              <span className="truncate max-w-[90px] font-medium text-slate-700">{issue.assignee.name}</span>
            </div>
          ) : (
            <span className="italic text-slate-400">Unassigned</span>
          )}

          <div className="flex items-center gap-2 text-slate-400">
            {issue.attachments?.length > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Paperclip className="h-3 w-3" />
                {issue.attachments.length}
              </span>
            )}
            {issue.comments?.length > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <MessageSquare className="h-3 w-3" />
                {issue.comments.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span>{formatRelativeTime(issue.updatedAt)}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
