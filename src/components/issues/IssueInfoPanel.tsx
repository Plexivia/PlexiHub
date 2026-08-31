import React, { useState } from 'react';
import { Issue, IssueStatus, Project, User } from '../../types';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { formatDate, formatTime } from '../../lib/utils';
import { IssuePriorityBadge } from './IssuePriorityBadge';
import { Copy, Check, ExternalLink, GitCommit, Server, Sparkles, User as UserIcon } from 'lucide-react';

interface IssueInfoPanelProps {
  issue: Issue;
  project: Project;
  currentUser: User;
  onStatusChange: (status: IssueStatus) => void;
  onAssigneeChange?: (assigneeId: string) => void;
  onPriorityChange?: (priority: string) => void;
  teamMembers: User[];
  canEdit: boolean;
}

export function IssueInfoPanel({
  issue,
  project,
  currentUser,
  onStatusChange,
  onAssigneeChange,
  onPriorityChange,
  teamMembers,
  canEdit,
}: IssueInfoPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(project.clientDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statuses: IssueStatus[] = [
    'Created',
    'Open',
    'In Progress',
    'Waiting for Client',
    'Resolved',
    'Closed',
  ];

  return (
    <div className="sticky top-4 h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 space-y-6 text-xs text-gray-700 shadow-xs">
      {/* Status section */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2 mb-3">
          Issue Status
        </label>
        {canEdit ? (
          <Select
            value={issue.status}
            onChange={(e) => onStatusChange(e.target.value as IssueStatus)}
            className="font-semibold text-xs h-8.5 rounded border-gray-200 bg-gray-50"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        ) : (
          <div className="py-1">
            <Badge variant="default" className="text-xs">
              {issue.status}
            </Badge>
          </div>
        )}
      </div>

      {/* People / Assignment */}
      <div className="space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
          Assignment & People
        </label>
        <div>
          <span className="block text-gray-500 italic mb-1.5">Assignee</span>
          {canEdit && onAssigneeChange ? (
            <Select
              value={issue.assignee?.id || 'unassigned'}
              onChange={(e) => onAssigneeChange(e.target.value)}
              className="text-xs h-8 rounded border-gray-200 bg-gray-50"
            >
              <option value="unassigned">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </Select>
          ) : (
            <div className="flex items-center gap-2">
              {issue.assignee ? (
                <>
                  <Avatar src={issue.assignee.avatarUrl} name={issue.assignee.name} size="xs" />
                  <span className="font-medium text-gray-900">{issue.assignee.name}</span>
                </>
              ) : (
                <span className="text-gray-400 italic">Unassigned</span>
              )}
            </div>
          )}
        </div>

        <div>
          <span className="block text-gray-500 italic mb-1.5">Created By</span>
          <div className="flex items-center gap-2">
            <Avatar src={issue.createdBy.avatarUrl} name={issue.createdBy.name} size="xs" />
            <div>
              <p className="font-medium text-gray-900 leading-none">{issue.createdBy.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{issue.createdBy.role}</p>
            </div>
          </div>
        </div>

        <div>
          <span className="block text-gray-500 italic mb-1">Priority</span>
          <div className="flex items-center gap-2">
            <IssuePriorityBadge priority={issue.priority} />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
          Timestamps
        </label>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 italic">Date Created</span>
          <span className="font-medium text-gray-900">
            {formatDate(issue.createdAt)}, {formatTime(issue.createdAt)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 italic">Last Updated</span>
          <span className="font-medium text-gray-900">
            {formatDate(issue.updatedAt)}, {formatTime(issue.updatedAt)}
          </span>
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
          Client Information
        </label>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 italic">Client Name</span>
          <p className="font-semibold text-gray-900">{project.clientName}</p>
        </div>
        <div>
          <span className="text-gray-500 italic block mb-1">Client Domain</span>
          <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5">
            <span className="truncate font-mono text-[11px] text-gray-700">{project.clientDomain}</span>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button
                type="button"
                onClick={handleCopyDomain}
                className="rounded p-1 text-gray-400 hover:bg-gray-200/60 hover:text-gray-700"
                title="Copy Domain"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              </button>
              <a
                href={`https://${project.clientDomain}`}
                target="_blank"
                rel="noreferrer"
                className="rounded p-1 text-gray-400 hover:bg-gray-200/60 hover:text-gray-700"
                title="Visit Storefront"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Versions */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
          Versions
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
            <span className="block text-[10px] text-gray-400 uppercase font-semibold">Backend</span>
            <span className="font-mono text-[11px] font-bold text-gray-900">
              B{project.backendVersion}
            </span>
          </div>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
            <span className="block text-[10px] text-gray-400 uppercase font-semibold">Dashboard</span>
            <span className="font-mono text-[11px] font-bold text-gray-900">
              D-{project.dashboardVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Last Deploy */}
      <div className="space-y-2">
        <div className="p-3 bg-green-50 border border-green-100 rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-green-700 uppercase">Last Deploy</span>
            <span className="text-[10px] font-semibold text-green-700 bg-green-100/80 px-1.5 py-0.2 rounded">
              {project.deploymentInfo.status}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-green-900">
            {formatDate(project.deploymentInfo.deployedAt)} at {formatTime(project.deploymentInfo.deployedAt)}
          </p>
          <p className="text-[10px] font-mono opacity-60 text-green-800 mt-1">
            Env: {project.deploymentInfo.environment} • {project.deploymentInfo.gitCommitHash || 'HEAD'}
          </p>
        </div>
      </div>
    </div>
  );
}
