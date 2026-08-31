import React from 'react';
import { IssueStatus } from '../../types';
import { cn } from '../../lib/utils';
import { Circle, PlayCircle, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface IssueStatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function IssueStatusBadge({ status, size = 'sm', className }: IssueStatusBadgeProps) {
  const configs: Record<IssueStatus, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
    Created: {
      label: 'Created',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      icon: Sparkles,
    },
    Open: {
      label: 'Open',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: Circle,
    },
    'In Progress': {
      label: 'In Progress',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: PlayCircle,
    },
    'Waiting for Client': {
      label: 'Waiting for Client',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: Clock,
    },
    Resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    Closed: {
      label: 'Closed',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      icon: XCircle,
    },
  };

  const config = configs[status] || configs.Open;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-semibold select-none whitespace-nowrap',
        config.bg,
        config.text,
        config.border,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      <span>{config.label}</span>
    </span>
  );
}
