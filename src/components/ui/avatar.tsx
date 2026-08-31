import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'offline';
}

export function Avatar({ src, name, size = 'md', status, className, ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const getInitials = (str: string) => {
    if (!str) return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-xs font-semibold',
    lg: 'h-10 w-10 text-sm font-semibold',
    xl: 'h-14 w-14 text-base font-bold',
  };

  const statusSizes = {
    xs: 'h-1.5 w-1.5 bottom-0 right-0',
    sm: 'h-2 w-2 bottom-0 right-0',
    md: 'h-2.5 w-2.5 bottom-0 right-0',
    lg: 'h-3 w-3 bottom-0 right-0',
    xl: 'h-3.5 w-3.5 bottom-0.5 right-0.5',
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-white',
    busy: 'bg-amber-500 ring-white',
    offline: 'bg-slate-400 ring-white',
  };

  // Deterministic bg color based on name
  const getBgColor = (text: string) => {
    const colors = [
      'bg-sky-600 text-white',
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-rose-600 text-white',
      'bg-slate-700 text-white',
      'bg-teal-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className={cn('relative inline-flex shrink-0 select-none items-center justify-center', className)} {...props}>
      <div
        className={cn(
          'flex h-full w-full items-center justify-center overflow-hidden rounded-full font-medium ring-1 ring-slate-200/80 shadow-2xs',
          sizes[size],
          !src || imgError ? getBgColor(name) : 'bg-slate-100'
        )}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute rounded-full ring-2 ring-white',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
