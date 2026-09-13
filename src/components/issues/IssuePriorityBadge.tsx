import React from 'react';
import { IssuePriority } from '../../types';
import { cn } from '../../lib/utils';
import { ArrowDown, ArrowRight, ArrowUp, AlertOctagon, Flame, AlertTriangle } from 'lucide-react';

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
    {
      label: string;
      bg: string;
      text: string;
      border: string;
      ring?: string;
      icon: React.ElementType;
      badgeStyle?: string;
    }
  > = {
    Low: {
      label: 'Low',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: ArrowDown,
    },
    Medium: {
      label: 'Medium',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      icon: ArrowRight,
    },
    High: {
      label: 'High',
      bg: 'bg-amber-100/90',
      text: 'text-amber-900',
      border: 'border-amber-300',
      ring: 'ring-1 ring-amber-300/60 shadow-2xs',
      icon: AlertTriangle,
      badgeStyle: 'font-bold',
    },
    Critical: {
      label: 'Critical',
      bg: 'bg-rose-100',
      text: 'text-rose-900',
      border: 'border-rose-400',
      ring: 'ring-1 ring-rose-300 shadow-xs animate-pulse',
      icon: Flame,
      badgeStyle: 'font-extrabold',
    },
  };

  const config = configs[priority] || configs.Medium;
  const Icon = config.icon;

  if (showIconOnly) {
    return (
      <span
        title={`Priority: ${config.label}`}
        className={cn(
          'inline-flex items-center justify-center p-0.5 rounded',
          config.text,
          priority === 'Critical' && 'text-rose-600',
          priority === 'High' && 'text-amber-600',
          className
        )}
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
        config.ring,
        config.badgeStyle,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5', priority === 'Critical' ? 'text-rose-600' : priority === 'High' ? 'text-amber-700' : '')} />
      <span>{config.label}</span>
    </span>
  );
}
