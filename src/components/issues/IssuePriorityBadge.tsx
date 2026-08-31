import React from 'react';
import { IssuePriority } from '../../types';
import { cn } from '../../lib/utils';
import { ArrowDown, ArrowRight, ArrowUp, AlertOctagon } from 'lucide-react';

interface IssuePriorityBadgeProps {
  priority: IssuePriority;
  size?: 'sm' | 'md';
  showIconOnly?: boolean;
  className?: string;
}

export function IssuePriorityBadge({
  priority,
  size = 'sm',
  showIconOnly = false,
  className,
}: IssuePriorityBadgeProps) {
  const configs: Record<
    IssuePriority,
    { label: string; bg: string; text: string; border: string; icon: React.ElementType }
  > = {
    Low: {
      label: 'Low',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      icon: ArrowDown,
    },
    Medium: {
      label: 'Medium',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: ArrowRight,
    },
    High: {
      label: 'High',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: ArrowUp,
    },
    Critical: {
      label: 'Critical',
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      icon: AlertOctagon,
    },
  };

  const config = configs[priority] || configs.Medium;
  const Icon = config.icon;

  if (showIconOnly) {
    return (
      <span
        title={`Priority: ${config.label}`}
        className={cn('inline-flex items-center justify-center', config.text, className)}
      >
        <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border font-semibold select-none whitespace-nowrap',
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
