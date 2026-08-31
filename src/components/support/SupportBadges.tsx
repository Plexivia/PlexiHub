import React from 'react';
import { SupportStatus, SupportCategory, IssuePriority } from '../../types';
import { cn } from '../../lib/utils';
import {
  Circle,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Server,
  Globe,
  CreditCard,
  Layers,
  HelpCircle,
  Terminal,
} from 'lucide-react';

export function SupportStatusBadge({ status, className }: { status: SupportStatus; className?: string }) {
  const configs: Record<SupportStatus, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
    Open: { label: 'Open', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: Circle },
    'In Progress': { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: PlayCircle },
    Waiting: { label: 'Waiting', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Clock },
    Resolved: { label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    Closed: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: XCircle },
  };

  const config = configs[status] || configs.Open;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold select-none shadow-2xs',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
}

export function SupportCategoryBadge({ category, className }: { category: SupportCategory; className?: string }) {
  const configs: Record<SupportCategory, { icon: React.ElementType; color: string }> = {
    Technical: { icon: Terminal, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    Deployment: { icon: Layers, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    Server: { icon: Server, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    Domain: { icon: Globe, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    Billing: { icon: CreditCard, color: 'text-violet-600 bg-violet-50 border-violet-200' },
    General: { icon: HelpCircle, color: 'text-slate-600 bg-slate-100 border-slate-200' },
  };

  const config = configs[category] || configs.General;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium select-none shadow-2xs',
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{category}</span>
    </span>
  );
}
