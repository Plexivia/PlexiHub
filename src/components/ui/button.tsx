import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'subtle';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading = false, children, disabled, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs border border-transparent active:scale-[0.99]',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-transparent',
      outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-xs',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200/80 border border-transparent',
      ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900',
      link: 'text-sky-600 underline-offset-4 hover:underline p-0 h-auto',
      subtle: 'bg-sky-50 text-sky-700 hover:bg-sky-100/80 border border-sky-200/60',
    };

    const sizes = {
      xs: 'h-7 px-2 text-xs rounded-md font-medium',
      sm: 'h-8 px-3 text-xs rounded-md font-medium',
      default: 'h-9 px-4 py-2 text-sm rounded-lg font-medium',
      lg: 'h-10 px-6 text-sm rounded-lg font-semibold',
      icon: 'h-9 w-9 rounded-lg flex items-center justify-center p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
