import React from 'react';
import { Issue, IssueFilterParams } from '../../types';
import { IssueStatusBadge } from './IssueStatusBadge';
import { IssuePriorityBadge } from './IssuePriorityBadge';
import { Avatar } from '../ui/avatar';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MessageSquare, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';

interface IssueTableProps {
  issues: Issue[];
  total: number;
  filters: IssueFilterParams;
  onFilterChange: (filters: IssueFilterParams) => void;
  onRowClick: (issue: Issue) => void;
}

export function IssueTable({
  issues,
  total,
  filters,
  onFilterChange,
  onRowClick,
}: IssueTableProps) {
  const currentPage = filters.page || 1;
  const limit = filters.limit || 20;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleSort = (column: 'id' | 'updatedAt' | 'createdAt' | 'priority' | 'status') => {
    if (filters.sortBy === column) {
      onFilterChange({
        ...filters,
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      onFilterChange({
        ...filters,
        sortBy: column,
        sortOrder: 'desc',
        page: 1,
      });
    }
  };

  const renderSortIcon = (column: 'id' | 'updatedAt' | 'createdAt' | 'priority' | 'status') => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-500 transition-colors" />;
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-sky-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-sky-600" />
    );
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 cursor-pointer select-none group w-28 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Issue ID</span>
                  {renderSortIcon('id')}
                </div>
              </th>

              <th className="py-3 px-4 min-w-[280px]">
                <span>Issue Name</span>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 cursor-pointer select-none group w-36 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              <th
                onClick={() => handleSort('priority')}
                className="py-3 px-4 cursor-pointer select-none group w-28 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  {renderSortIcon('priority')}
                </div>
              </th>

              <th className="py-3 px-4 w-40">
                <span>Assignee</span>
              </th>

              <th className="py-3 px-4 w-36">
                <span>Created By</span>
              </th>

              <th
                onClick={() => handleSort('createdAt')}
                className="py-3 px-4 cursor-pointer select-none group w-28 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Created</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>

              <th
                onClick={() => handleSort('updatedAt')}
                className="py-3 px-4 cursor-pointer select-none group w-32 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Updated</span>
                  {renderSortIcon('updatedAt')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {issues.map((issue) => {
              const isCritical = issue.priority === 'Critical';
              const isHigh = issue.priority === 'High';

              return (
                <tr
                  key={issue.id}
                  onClick={() => onRowClick(issue)}
                  className={`cursor-pointer transition-colors group active:bg-gray-100/50 ${
                    isCritical
                      ? 'bg-rose-50/50 hover:bg-rose-100/60 border-l-4 border-l-rose-500'
                      : isHigh
                      ? 'bg-amber-50/40 hover:bg-amber-100/50 border-l-4 border-l-amber-500'
                      : 'hover:bg-gray-50/90 border-l-4 border-l-transparent'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded border transition-colors ${
                          isCritical
                            ? 'text-rose-700 bg-rose-50 border-rose-200 group-hover:border-rose-300'
                            : isHigh
                            ? 'text-amber-800 bg-amber-50 border-amber-200 group-hover:border-amber-300'
                            : 'text-blue-600 bg-blue-50 border-blue-200/60 group-hover:border-blue-300'
                        }`}
                      >
                        {issue.id}
                      </span>
                    </div>
                  </td>

                <td className="py-3 px-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {issue.title}
                      </span>
                      {issue.attachments?.length > 0 && (
                        <span className="text-gray-400 inline-flex items-center gap-0.5 text-[10px]" title={`${issue.attachments.length} attachments`}>
                          <Paperclip className="h-3 w-3" />
                        </span>
                      )}
                      {issue.comments?.length > 0 && (
                        <span className="text-gray-400 inline-flex items-center gap-0.5 text-[10px]" title={`${issue.comments.length} comments`}>
                          <MessageSquare className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    {issue.labels && issue.labels.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {issue.labels.slice(0, 3).map((l) => (
                          <span key={l} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.2 rounded font-mono">
                            #{l}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <IssueStatusBadge status={issue.status} size="sm" />
                </td>

                <td className="py-3 px-4">
                  <IssuePriorityBadge priority={issue.priority} size="sm" />
                </td>

                <td className="py-3 px-4">
                  {issue.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar src={issue.assignee.avatarUrl} name={issue.assignee.name} size="xs" />
                      <span className="truncate max-w-[110px] text-xs font-semibold text-gray-800">{issue.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Avatar src={issue.createdBy.avatarUrl} name={issue.createdBy.name} size="xs" />
                    <span className="truncate max-w-[100px] text-xs text-gray-600">{issue.createdBy.name}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-[11px] text-gray-500 whitespace-nowrap">
                  {formatDate(issue.createdAt)}
                </td>

                <td className="py-3 px-4 text-[11px] text-gray-500 whitespace-nowrap">
                  {formatRelativeTime(issue.updatedAt)}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-600">
        <div>
          Showing <span className="font-semibold text-gray-900">{issues.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to{' '}
          <span className="font-semibold text-gray-900">{Math.min(currentPage * limit, total)}</span> of{' '}
          <span className="font-semibold text-gray-900">{total}</span> issues
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => onFilterChange({ ...filters, page: currentPage - 1 })}
            disabled={currentPage <= 1}
            className="gap-1 rounded"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <span className="text-xs font-medium px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="xs"
            onClick={() => onFilterChange({ ...filters, page: currentPage + 1 })}
            disabled={currentPage >= totalPages}
            className="gap-1 rounded"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
