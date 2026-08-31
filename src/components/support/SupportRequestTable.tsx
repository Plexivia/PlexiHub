import React from 'react';
import { SupportRequest, SupportFilterParams } from '../../types';
import { SupportStatusBadge, SupportCategoryBadge } from './SupportBadges';
import { IssuePriorityBadge } from '../issues/IssuePriorityBadge';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MessageSquare, Paperclip, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface SupportRequestTableProps {
  requests: SupportRequest[];
  total: number;
  filters: SupportFilterParams;
  onFilterChange: (filters: SupportFilterParams) => void;
  onRowClick: (req: SupportRequest) => void;
}

export function SupportRequestTable({
  requests,
  total,
  filters,
  onFilterChange,
  onRowClick,
}: SupportRequestTableProps) {
  const currentPage = filters.page || 1;
  const limit = filters.limit || 20;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleSort = (col: 'id' | 'updatedAt' | 'createdAt' | 'priority') => {
    if (filters.sortBy === col) {
      onFilterChange({
        ...filters,
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      onFilterChange({
        ...filters,
        sortBy: col,
        sortOrder: 'desc',
        page: 1,
      });
    }
  };

  const renderSortIcon = (col: 'id' | 'updatedAt' | 'createdAt' | 'priority') => {
    if (filters.sortBy !== col) {
      return <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-500 transition-colors" />;
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-sky-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-sky-600" />
    );
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 cursor-pointer select-none group w-28 hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Request ID</span>
                  {renderSortIcon('id')}
                </div>
              </th>

              <th className="py-3 px-4 min-w-[260px]">Subject</th>
              <th className="py-3 px-4 w-32">Category</th>
              <th className="py-3 px-4 w-40">Requested By</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th
                onClick={() => handleSort('priority')}
                className="py-3 px-4 cursor-pointer select-none group w-28 hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  {renderSortIcon('priority')}
                </div>
              </th>
              <th
                onClick={() => handleSort('createdAt')}
                className="py-3 px-4 cursor-pointer select-none group w-28 hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Created</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>
              <th
                onClick={() => handleSort('updatedAt')}
                className="py-3 px-4 cursor-pointer select-none group w-28 hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Updated</span>
                  {renderSortIcon('updatedAt')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {requests.map((req) => (
              <tr
                key={req.id}
                onClick={() => onRowClick(req)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group active:bg-slate-100/50"
              >
                <td className="py-3 px-4">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60 group-hover:border-sky-300">
                    {req.id}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                      {req.subject}
                    </span>
                    {req.attachments?.length > 0 && (
                      <span className="text-slate-400 inline-flex items-center gap-0.5 text-[10px]">
                        <Paperclip className="h-3 w-3" />
                      </span>
                    )}
                    {req.comments && req.comments.length > 0 && (
                      <span className="text-slate-400 inline-flex items-center gap-0.5 text-[10px]">
                        <MessageSquare className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <SupportCategoryBadge category={req.category} />
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar src={req.requestedBy.avatarUrl} name={req.requestedBy.name} size="xs" />
                    <div>
                      <p className="truncate max-w-[100px] text-xs font-semibold text-slate-800">
                        {req.requestedBy.name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-normal">{req.requestedBy.role}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <SupportStatusBadge status={req.status} />
                </td>

                <td className="py-3 px-4">
                  <IssuePriorityBadge priority={req.priority} size="sm" />
                </td>

                <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                  {formatDate(req.createdAt)}
                </td>

                <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                  {formatRelativeTime(req.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-slate-100">
        {requests.map((req) => (
          <div
            key={req.id}
            onClick={() => onRowClick(req)}
            className="p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
                  {req.id}
                </span>
                <SupportCategoryBadge category={req.category} />
              </div>
              <SupportStatusBadge status={req.status} />
            </div>

            <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{req.subject}</h4>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Avatar src={req.requestedBy.avatarUrl} name={req.requestedBy.name} size="xs" />
                <span>{req.requestedBy.name}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span>{formatRelativeTime(req.updatedAt)}</span>
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
        <div>
          Showing <span className="font-semibold text-slate-900">{requests.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-900">{Math.min(currentPage * limit, total)}</span> of{' '}
          <span className="font-semibold text-slate-900">{total}</span> requests
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => onFilterChange({ ...filters, page: currentPage - 1 })}
            disabled={currentPage <= 1}
            className="gap-1"
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
            className="gap-1"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
