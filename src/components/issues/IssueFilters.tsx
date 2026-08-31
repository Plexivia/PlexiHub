import React from 'react';
import { IssueFilterParams, User } from '../../types';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Search, RotateCcw, Filter } from 'lucide-react';

interface IssueFiltersProps {
  filters: IssueFilterParams;
  onChange: (filters: IssueFilterParams) => void;
  onClear: () => void;
  teamMembers: User[];
}

export function IssueFilters({ filters, onChange, onClear, teamMembers }: IssueFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.status && filters.status !== 'all') ||
      (filters.priority && filters.priority !== 'all') ||
      (filters.assigneeId && filters.assigneeId !== 'all')
  );

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          placeholder="Search by ID (DH-024), title, labels, or name..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          className="pl-9 text-xs bg-white border-gray-200 rounded"
        />
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onChange={(e) => onChange({ ...filters, status: e.target.value, page: 1 })}
          className="text-xs h-9 min-w-[130px] bg-white border-gray-200 rounded"
        >
          <option value="all">All Statuses</option>
          <option value="Created">Created</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Waiting for Client">Waiting for Client</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || 'all'}
          onChange={(e) => onChange({ ...filters, priority: e.target.value, page: 1 })}
          className="text-xs h-9 min-w-[120px] bg-white border-gray-200 rounded"
        >
          <option value="all">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>

        {/* Assignee Filter */}
        <Select
          value={filters.assigneeId || 'all'}
          onChange={(e) => onChange({ ...filters, assigneeId: e.target.value, page: 1 })}
          className="text-xs h-9 min-w-[130px] bg-white border-gray-200 rounded"
        >
          <option value="all">All Assignees</option>
          {teamMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-900 gap-1 h-9 px-2.5 rounded"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
