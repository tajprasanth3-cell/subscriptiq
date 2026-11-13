import type { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  highlight?: boolean;
}

export const Card = ({
  children,
  className,
  padding = 'md',
  highlight = false,
}: CardProps) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 lg:p-6',
    lg: 'p-5 sm:p-6 lg:p-8',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border transition-all duration-200 overflow-hidden w-full max-w-full',
        highlight
          ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-md'
          : 'border-slate-200/80 shadow-xs hover:border-slate-300',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
};
