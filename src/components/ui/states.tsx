import React from 'react';
import { AlertTriangle, Inbox, Lock, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export function LoadingState({ message = 'Loading data...', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <div className="relative mb-4">
        <div className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-sky-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Failed to load information from the service.',
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/40 p-8 text-center', className)}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-950">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-rose-700">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4 gap-1.5 border-rose-200 text-rose-800 hover:bg-rose-100/50">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
}

export function UnauthorizedState({
  title = 'Access Restricted',
  description = 'Your current role does not have permission to view or edit this section.',
  actionLabel = 'Go to Dashboard',
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-xs">
        <Lock className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs text-slate-500 leading-relaxed">{description}</p>
      {onAction && (
        <Button onClick={onAction} size="sm" className="mt-5 gap-1.5">
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
