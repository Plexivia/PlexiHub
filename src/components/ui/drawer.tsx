import * as React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  children,
  className,
}: DrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed inset-y-0 z-50 flex max-w-full bg-white shadow-2xl transition-transform duration-300 ease-in-out',
          side === 'left' ? 'left-0 w-80' : 'right-0 w-full max-w-md',
          className
        )}
      >
        <div className="flex h-full w-full flex-col overflow-y-auto">
          {(title || description) && (
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex-1 px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
